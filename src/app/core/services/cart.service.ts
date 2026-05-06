import {
  Injectable, signal, computed, effect, inject, PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { switchMap, of, tap, catchError, forkJoin } from 'rxjs';
import { AuthService } from './auth.service';
import { CarritoService as ApiCarritoService } from '../../data/services/cart.service';
import { CarritoProductoService } from '../../data/services/carrito-producto.service';
import { Carrito } from '../../data/models/api.models';


export interface CartItem {
  id_vino: number;
  id_carrito_producto?: number;
  nombre: string;
  cantidad: number;
  presentacion: string;
  volumen_ml: number;
  url_img_principal: string;
  precio_base: number;
  precio_venta?: number;
  precios_por_cantidad: Array<{ cantidad: number; precio: number }>;
  botellas_por_caja: number;
  esCaja: boolean;
}

const LS_KEY = 'shopping_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private _initialized = false;
  private platformId = inject(PLATFORM_ID);
  private authService = inject(AuthService);
  private apiCarrito = inject(ApiCarritoService);
  private apiProductos = inject(CarritoProductoService);

  isOpen = signal(false);
  isLoading = signal(false);

  private _items = signal<CartItem[]>([]);
  private _carritoActivo = signal<Carrito | null>(null);

  readonly cartItems = this._items.asReadonly();

  readonly cartCount = computed(() =>
    this._items().reduce((acc, i) => acc + i.cantidad, 0)
  );

  readonly subtotal = computed(() =>
    this._items().reduce((acc, i) => acc + this.getTotalItem(i), 0)
  );

  private initialized = false;
  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;

    effect(() => {
      const user = this.authService.currentUser();

      if (!this._initialized) return;

      if (user) {
        this._migrateAndLoad();
      } else {
        this._loadFromLocalStorage();
      }
    });
  }

  initCart(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this._initialized) return;

    this._initialized = true;

    const user = this.authService.currentUser();

    if (user) {
      this._loadFromApi();
    } else {
      this._loadFromLocalStorage();
    }
  }

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }

  loadCart(): void {
    if (this.authService.currentUser()) {
      this._loadFromApi();
    } else {
      this._loadFromLocalStorage();
    }
  }

  addToCart(item: CartItem): void {
    if (this.authService.currentUser()) {
      this._loadFromApi();
      return;
    }
    const idx = this._items().findIndex(i => i.id_vino === item.id_vino);
    if (idx !== -1) {
      const curr = this._items()[idx];
      this._updateLocalQuantity(item.id_vino, curr.cantidad + item.cantidad);
    } else {
      this._items.update(items => [...items, item]);
      this._saveToLocalStorage();
    }
  }

  updateQuantity(item: CartItem, change: number): void {
    const newQty = item.cantidad + change;
    if (newQty < 1) { this.removeItem(item); return; }

    if (this.authService.currentUser()) {
      const carrito = this._carritoActivo();
      if (!carrito) return;

      this.isLoading.set(true);
      this.apiProductos.addOrUpdate({
        id_carrito: carrito.id_carrito,
        id_vino: item.id_vino,
        cantidad: change
      }).pipe(
        tap(() => this._loadFromApi()),
        catchError(err => { console.error('updateQuantity', err); this.isLoading.set(false); return of(null); })
      ).subscribe();
      return;
    }

    this._updateLocalQuantity(item.id_vino, newQty);
  }

  removeItem(item: CartItem): void {
    if (this.authService.currentUser()) {
      if (!item.id_carrito_producto) return;
      this.isLoading.set(true);
      this.apiProductos.delete(item.id_carrito_producto).pipe(
        tap(() => this._loadFromApi()),
        catchError(err => { console.error('removeItem', err); this.isLoading.set(false); return of(null); })
      ).subscribe();
      return;
    }
    this._items.update(items => items.filter(i => i.id_vino !== item.id_vino));
    this._saveToLocalStorage();
  }

  clearCart(): void {
    this._items.set([]);
    this._carritoActivo.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(LS_KEY);
    }
  }

  getPrecioUnitarioActual(item: CartItem): number {
    if (this.authService.currentUser() && item.precio_venta !== undefined) {
      return item.precio_venta;
    }
    return this._calcularPrecioLocal(item.cantidad, item.precios_por_cantidad);
  }

  getTotalItem(item: CartItem): number {
    return this.getPrecioUnitarioActual(item) * item.cantidad;
  }

  tieneDescuento(item: CartItem): boolean {
    return this.getPrecioUnitarioActual(item) < item.precio_base;
  }

  private _saveToLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(LS_KEY, JSON.stringify(this._items()));
  }

  private _loadFromLocalStorage(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const raw = localStorage.getItem(LS_KEY);
      this._items.set(raw ? JSON.parse(raw) : []);
      this.initialized = true;
      console.log('Saving to LS:', this._items());
    } catch {
      this._items.set([]);
      this.initialized = true;
      console.log('Saving to LS:', this._items());
    }
  }

  private _updateLocalQuantity(id_vino: number, qty: number): void {
    if (qty <= 0) { this._items.update(items => items.filter(i => i.id_vino !== id_vino)); return; }
    this._items.update(items =>
      items.map(i => i.id_vino === id_vino
        ? { ...i, cantidad: qty, presentacion: `${qty} ${qty === 1 ? 'botella' : 'botellas'}` }
        : i
      )
    );
    this._saveToLocalStorage();
  }

  private _loadFromApi(): void {
    this.isLoading.set(true);
    this.apiCarrito.getAll().pipe(
      switchMap((carritos: Carrito[]) => {
        const activo = carritos.find(c => c.estado === 'E') ?? null;
        this._carritoActivo.set(activo);
        if (!activo) { this._items.set([]); return of([]); }
        return this.apiProductos.getByCarrito(activo.id_carrito);
      }),
      tap((productos: any[]) => {

        this._items.set(productos.map(p => this._mapApiItem(p)));
        this.isLoading.set(false);
      }),
      catchError(err => {
        console.error('_loadFromApi', err);
        this._items.set([]);
        this.isLoading.set(false);
        return of([]);
      })
    ).subscribe();
  }

  private _mapApiItem(p: any): CartItem {
    const vino = p.Precio?.Vino ?? {};
    const presentacion = vino.Presentacion ?? {};
    const precios = (vino.Precios ?? []).map((pr: any) => ({
      cantidad: Number(pr.cantidad_minima),
      precio: Number(pr.precio)
    })).sort((a: any, b: any) => a.cantidad - b.cantidad);

    const precioBase = precios.find((pr: any) => pr.cantidad === 1)?.precio
      ?? Number(p.precio_venta) ?? 0;

    return {
      id_vino: vino.id_vino ?? 0,
      id_carrito_producto: p.id_carrito_producto,
      nombre: vino.nombre ?? 'Producto',
      cantidad: p.cantidad,
      presentacion: `${p.cantidad} ${p.cantidad === 1 ? 'botella' : 'botellas'}`,
      volumen_ml: presentacion.volumen_ml ?? 0,
      url_img_principal: vino.url_img_principal ?? '',
      precio_base: precioBase,
      precio_venta: Number(p.precio_venta),
      precios_por_cantidad: precios,
      botellas_por_caja: presentacion.botellas_por_caja ?? 12,
      esCaja: false,
    };
  }

  private _calcularPrecioLocal(
    cantidad: number,
    tiers: Array<{ cantidad: number; precio: number }>
  ): number {
    return (
      tiers
        .filter(t => cantidad > t.cantidad)
        .sort((a, b) => b.cantidad - a.cantidad)[0]?.precio
      ?? tiers.find(t => t.cantidad === 1)?.precio
      ?? 0
    );
  }

  private _migrateAndLoad(): void {
    const localItems = this._getLocalItems();

    if (!localItems.length) {
      this._loadFromApi();
      return;
    }

    this.apiCarrito.getAll().pipe(
      switchMap((carritos: Carrito[]) => {
        const activo = carritos.find(c => c.estado === 'E');
        if (activo) return of(activo);
        const user = this.authService.currentUser()!;
        return this.apiCarrito.create({ id_usuario: user.id_usuario, estado: 'E' });
      }),
      switchMap((carrito: Carrito) => {
        this._carritoActivo.set(carrito);
        const requests = localItems.map(item =>
          this.apiProductos.addOrUpdate({
            id_carrito: carrito.id_carrito,
            id_vino: item.id_vino,
            cantidad: item.cantidad
          })
        );
        return requests.length ? forkJoin(requests) : of([]);
      }),
      tap(() => {
        localStorage.removeItem(LS_KEY);
        this._loadFromApi();
      }),
      catchError(err => {
        console.error('_migrateAndLoad', err);
        this._loadFromApi();
        return of(null);
      })
    ).subscribe();
  }

  private _getLocalItems(): CartItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  }



  isLogged(): boolean {
    return !!this.authService.currentUser();
  }

  getCarritoActivo(): Carrito | null {
    return this._carritoActivo();
  }
}
