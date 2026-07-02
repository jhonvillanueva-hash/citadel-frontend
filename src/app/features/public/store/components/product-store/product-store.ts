import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VinoService } from '../../../../../data/services/vino.service';
import { PrecioService } from '../../../../../data/services/precio.service';
import { CarritoService as ApiCartService } from '../../../../../data/services/cart.service';
import { CarritoProductoService } from '../../../../../data/services/carrito-producto.service';
import { AuthService } from '../../../../../core/services/auth.service';

import { Precio, Vino, Carrito } from '../../../../../data/models/api.models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faEye, faFilter, faWineBottle } from '@fortawesome/free-solid-svg-icons';

import { signal, computed, effect, untracked } from '@angular/core';
import { input } from '@angular/core';

import { CartItem, CartService } from '../../../../../core/services/cart.service';
import { switchMap, of } from 'rxjs';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { FabStackComponent } from '../../../../../shared/layouts/fab-stack/fab-stack';
import { AiButtonComponent } from '../../../../../shared/components/ai-button/ai-button';
import { AiChatWidgetComponent } from '../../../../../shared/layouts/ai-chat-widget/ai-chat-widget';

export interface InternalProduct {
  id: number;

  stock: number;
  estado: 'D' | 'A' | 'P';

  flavor: string;
  flavorId: number;

  category: string;
  categoryId: number;

  name: string;
  description: string;

  volumen: string;
  volumen_ml: number;
  botellas_por_caja: number;

  image: string;

  iconoFlavor?: string;
  iconoCategory?: string;

  prices?: Precio[];
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule, FabStackComponent, AiButtonComponent, AiChatWidgetComponent],
  templateUrl: './product-store.html',
})

export class ProductStore implements OnInit {

  filterType = input<'todos' | 'mixtos' | 'promociones' | 'sabor' | 'dulzor'>('todos');
  filterSaborId = input<number | undefined>();
  filterDulzorId = input<number | undefined>();
  @Input() filterSaborNombre?: string;
  @Input() customTitle?: string;

  customProducts = input<InternalProduct[] | undefined>(undefined);

  private localCartService = inject(CartService);

  private apiCartService = inject(ApiCartService);
  private carritoProductoService = inject(CarritoProductoService);
  private authService = inject(AuthService);

  icons = { faEye, faCartShopping, faFilter, faWineBottle };

  private vinoService = inject(VinoService);
  private precioService = inject(PrecioService);

  private toastService = inject(ToastService);

  allProducts = signal<InternalProduct[]>([]);
  imageStates = signal<Record<number, 'loading' | 'loaded' | 'error'>>({});

  selectedFlavors = signal<Set<string>>(new Set());
  selectedCategories = signal<Set<string>>(new Set());
  selectedPresentations = signal<Set<string>>(new Set());
  minPrice = signal<number>(0);
  maxPrice = signal<number>(10000);
  mobileFilterOpen = signal<boolean>(false);

  availableFlavors = computed(() => {
    const products = this.allProducts();
    const flavors = new Set(products.map(p => p.flavor).filter(f => f && f !== 'Desconocido'));
    return Array.from(flavors).sort();
  });

  availableCategories = computed(() => {
    const products = this.allProducts();
    const categories = new Set(products.map(p => p.category).filter(c => c && c !== 'Desconocido'));
    return Array.from(categories).sort();
  });

  availablePresentations = computed(() => {
    const products = this.allProducts();
    const presentations = new Set(products.map(p => p.volumen).filter(v => v));
    return Array.from(presentations).sort((a, b) => {
      const volA = parseInt(a) || 0;
      const volB = parseInt(b) || 0;
      return volA - volB;
    });
  });

  maxPriceAllowed = computed(() => {
    const products = this.allProducts();
    let max = 0;
    products.forEach(p => {
      const price = this.getMainPrice(p.prices)?.precio || 0;
      if (Number(price) > max) max = Number(price);
    });
    return Math.ceil(max) || 1000;
  });

  toggleFilter(type: 'flavor' | 'category' | 'presentation', value: string) {
    const signalRef = type === 'flavor' ? this.selectedFlavors :
      type === 'category' ? this.selectedCategories :
        this.selectedPresentations;

    const current = new Set(signalRef());
    if (current.has(value)) {
      current.delete(value);
    } else {
      current.add(value);
    }
    signalRef.set(current);
  }

  isFilterSelected(type: 'flavor' | 'category' | 'presentation', value: string): boolean {
    const signalRef = type === 'flavor' ? this.selectedFlavors :
      type === 'category' ? this.selectedCategories :
        this.selectedPresentations;
    return signalRef().has(value);
  }

  clearFilters() {
    this.selectedFlavors.set(new Set());
    this.selectedCategories.set(new Set());
    this.selectedPresentations.set(new Set());
    this.minPrice.set(0);
    this.maxPrice.set(this.maxPriceAllowed());
  }

  updatePriceRange(event: Event, type: 'min' | 'max') {
    const input = event.target as HTMLInputElement;
    const value = parseInt(input.value);
    if (type === 'min') {
      this.minPrice.set(Math.min(value, this.maxPrice()));
    } else {
      this.maxPrice.set(Math.max(value, this.minPrice()));
    }
  }

  toggleMobileFilter() {
    this.mobileFilterOpen.set(!this.mobileFilterOpen());
  }

  constructor() {
    effect(() => {
      const type = this.filterType();
      const saborId = this.filterSaborId();
      const dulzorId = this.filterDulzorId();
      const products = this.allProducts();

      if (products.length > 0) {
        untracked(() => {
          if (type === 'sabor' && saborId !== undefined) {
            const flavor = products.find(p => p.flavorId === saborId)?.flavor;
            if (flavor) {
              this.selectedFlavors.set(new Set([flavor]));
              this.selectedCategories.set(new Set());
              this.selectedPresentations.set(new Set());
              this.minPrice.set(0);
              this.maxPrice.set(this.maxPriceAllowed());
            }
          } else if (type === 'dulzor' && dulzorId !== undefined) {
            const cat = products.find(p => p.categoryId === dulzorId)?.category;
            if (cat) {
              this.selectedCategories.set(new Set([cat]));
              this.selectedFlavors.set(new Set());
              this.selectedPresentations.set(new Set());
              this.minPrice.set(0);
              this.maxPrice.set(this.maxPriceAllowed());
            }
          } else if (type === 'todos' || (type === 'sabor' && saborId === undefined) || (type === 'dulzor' && dulzorId === undefined)) {
            this.clearFilters();
          }
        });
      }
    });
  }

  filteredProducts = computed(() => {

    const custom = this.customProducts();
    if (custom !== undefined) return custom;

    const products = this.allProducts();
    const type = this.filterType();
    const saborId = this.filterSaborId();
    const dulzorId = this.filterDulzorId();

    if (!products.length) return [];

    let result = products.filter(product =>
      product.estado === 'D'
    );

    const flavors = this.selectedFlavors();
    if (flavors.size > 0) {
      result = result.filter(p => flavors.has(p.flavor));
    }

    const categories = this.selectedCategories();
    if (categories.size > 0) {
      result = result.filter(p => categories.has(p.category));
    }

    const presentations = this.selectedPresentations();
    if (presentations.size > 0) {
      result = result.filter(p => presentations.has(p.volumen));
    }

    const minP = this.minPrice();
    const maxP = this.maxPrice();

    result = result.filter(p => {
      const price = Number(this.getMainPrice(p.prices)?.precio || 0);
      return price >= minP && price <= maxP;
    });

    return result;
  });
  ngOnInit(): void {
    this.loadVinosYPrecios();
  }

  private loadVinosYPrecios(): void {
    this.vinoService.getAll().subscribe({
      next: (vinos: Vino[]) => {
        this.precioService.getAll().subscribe({
          next: (precios: Precio[]) => {
            this.allProducts.set(this.mapProducts(vinos, precios));
            this.maxPrice.set(this.maxPriceAllowed());
          }
        });
      }
    });
  }

  private capitalizeFirstLetter(nombre: string): string {
    if (!nombre || nombre === 'Desconocido') return nombre;
    const lowerName = nombre.toLowerCase();
    return lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
  }

  private mapProducts(vinos: Vino[], precios: Precio[]): InternalProduct[] {
    return vinos.map(vino => {
      const rawFlavorName = vino.Sabor?.nombre ?? 'Desconocido';
      const rawCategoryName = vino.Dulzor?.nombre ?? 'Desconocido';

      const flavorName = this.capitalizeFirstLetter(rawFlavorName);
      const categoryName = this.capitalizeFirstLetter(rawCategoryName);

      const volumenMl = vino.Presentacion?.volumen_ml ?? 0;
      const botellasPorCaja = vino.Presentacion?.botellas_por_caja ?? 12;

      const preciosDelVino = precios.filter(p => p.id_vino === vino.id_vino);

      return {
        id: vino.id_vino,
        flavor: flavorName,
        flavorId: vino.id_sabor,
        category: categoryName,
        categoryId: vino.id_dulzor,
        name: vino.nombre,
        description: vino.descripcion,
        volumen: `${volumenMl} ml`,
        volumen_ml: volumenMl,
        botellas_por_caja: botellasPorCaja,
        estado: vino.estado,
        stock: vino.stock,
        image: vino.url_img_principal,
        prices: preciosDelVino,
        iconoCategory: this.getCategoryIcon(rawCategoryName),
        iconoFlavor: this.getFlavorIcon(rawFlavorName),
      };
    });
  }

  private getCategoryIcon(category: string): string {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('dulce')) return '/img/store/icons/droplet-fill.svg';
    if (lowerCat.includes('semiseco')) return '/img/store/icons/droplet-half.svg';
    if (lowerCat.includes('seco')) return '/img/store/icons/droplet.svg';
    return '/img/store/icons/droplet.svg';
  }

  private getFlavorIcon(flavor: string): string {
    const lowerFlavor = flavor.toLowerCase();
    if (lowerFlavor.includes('frambuesa')) return '/img/store/icons/baya.svg';
    if (lowerFlavor.includes('zarzamora')) return '/img/store/icons/mora-de-los-pantanos.svg';
    if (lowerFlavor.includes('arandano')) return '/img/store/icons/arandanos.svg';
    return '/img/store/icons/baya.svg';
  }

  getMainPrice(prices: Precio[] | undefined): Precio | null {
    if (!prices || prices.length === 0) return null;
    const unitPrice = prices.find(p => p.cantidad_minima === 1);
    return unitPrice || prices[0];
  }

  getImageDisplayState(product: InternalProduct): 'loading' | 'loaded' | 'error' {
    const state = this.imageStates()[product.id];
    if (state) return state;
    return product.image ? 'loading' : 'error';
  }

  onImageLoaded(productId: number): void {
    this.imageStates.update(state => ({ ...state, [productId]: 'loaded' }));
  }

  onImageError(productId: number): void {
    this.imageStates.update(state => ({ ...state, [productId]: 'error' }));
  }

  aiOpen = false;

  toggleAi() {
    this.aiOpen = !this.aiOpen;
  }

  closeAi() {
    this.aiOpen = false;
  }

  loadingProducts = signal<Set<number>>(new Set());

  setLoading(id: number, state: boolean) {
    const current = new Set(this.loadingProducts());
    if (state) current.add(id);
    else current.delete(id);
    this.loadingProducts.set(current);
  }

  isLoading(id: number): boolean {
    return this.loadingProducts().has(id);
  }

  getStockDisponible(product: InternalProduct): number {
    const cantidadEnCarrito =
      this.localCartService.getCantidadEnCarrito(product.id);

    return Math.max(product.stock - cantidadEnCarrito, 0);
  }

  isOutOfStock(product: InternalProduct): boolean {
    return this.getStockDisponible(product) <= 0;
  }

  addToCart(wine: InternalProduct): void {

    if (this.isLoading(wine.id)) return;

    if (wine.estado !== 'D' || wine.stock <= 0) {
      return;
    }

    const stockDisponible = this.getStockDisponible(wine);

    if (stockDisponible <= 0) {
      return;
    }

    const mainPrice = this.getMainPrice(wine.prices);

    if (!mainPrice) return;

    const user = this.authService.currentUser();

    this.setLoading(wine.id, true);

    if (!user) {

      this.addToLocalCart(wine, mainPrice);

      this.toastService.showSuccess(
        'Producto agregado',
        `${wine.name} fue añadido al carrito`
      );

      setTimeout(() => {
        this.setLoading(wine.id, false);
      }, 400);

      return;
    }

    this.apiCartService.getAll().pipe(
      switchMap((carritos: Carrito[]) => {
        const carritoActivo = carritos.find(c => c.estado === 'E');
        if (carritoActivo) return of(carritoActivo);

        return this.apiCartService.create({
          estado: 'E'
        });
      }),
      switchMap((carrito: Carrito) =>
        this.carritoProductoService.addOrUpdate({
          id_carrito: carrito.id_carrito,
          id_vino: wine.id,
          cantidad: 1
        })
      )
    ).subscribe({
      next: () => {

        this.addToLocalCart(wine, mainPrice);

        this.toastService.showSuccess(
          'Producto agregado',
          `${wine.name} fue añadido al carrito`
        );

        this.setLoading(wine.id, false);
      },
      error: (err) => {

        console.error(err);

        this.setLoading(wine.id, false);
      }
    });
  }

  private addToLocalCart(wine: InternalProduct, mainPrice: Precio): void {
    const preciosOrdenados = (wine.prices || [])
      .sort((a, b) => a.cantidad_minima - b.cantidad_minima)
      .map(p => ({
        cantidad: p.cantidad_minima,
        precio: Number(p.precio) || 0
      }));

    const precioBase = preciosOrdenados.find(p => p.cantidad === 1)?.precio || 0;

    const cartItem: CartItem = {
      id_vino: wine.id,
      nombre: wine.name,
      cantidad: 1,
      stock: wine.stock,
      presentacion: `1 botella`,
      volumen_ml: wine.volumen_ml,
      url_img_principal: wine.image,
      precio_base: precioBase,
      precios_por_cantidad: preciosOrdenados,
      botellas_por_caja: wine.botellas_por_caja,
      esCaja: false
    };

    this.localCartService.addToCart(cartItem);
  }

  trackById(index: number, item: InternalProduct) {
    return item.id;
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  getTitle(): string {
    if (this.customTitle) return this.customTitle;
    switch (this.filterType()) {
      case 'todos': return 'Todos los Vinos';
      case 'mixtos': return 'Vinos Mixtos';
      case 'promociones': return 'Vinos en Promoción';
      default: return 'Lista de Vinos';
    }
  }
}
