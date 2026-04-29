import { Injectable, signal, computed, effect } from '@angular/core';

export interface CartItem {
  id_vino: number;
  nombre: string;
  cantidad: number;
  presentacion: string;
  volumen_ml: number;
  url_img_principal: string;
  precio_base: number;
  precios_por_cantidad: Array<{
    cantidad: number;
    precio: number;
  }>;
  botellas_por_caja: number;
  esCaja: boolean;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  isOpen = signal(false);
  private cartItems = signal<CartItem[]>([]);

  private getPrecioPorBotella(totalBotellas: number, precios: Array<{ cantidad: number; precio: number }>): number {
    let precio = precios[0]?.precio || 0;
    for (const p of precios) {
      if (totalBotellas >= p.cantidad) {
        precio = p.precio;
      }
    }
    return precio;
  }

  private getTotalBotellas(item: CartItem): number {
    return item.esCaja
      ? item.cantidad * item.botellas_por_caja
      : item.cantidad;
  }

  getPrecioUnitarioActual(item: CartItem): number {
    const totalBotellas = this.getTotalBotellas(item);
    return this.getPrecioPorBotella(totalBotellas, item.precios_por_cantidad);
  }

  getTotalItem(item: CartItem): number {
    const totalBotellas = this.getTotalBotellas(item);
    const precioUnitario = this.getPrecioUnitarioActual(item);
    return precioUnitario * totalBotellas;
  }

  cartCount = computed(() =>
    this.cartItems().reduce((total, item) => total + item.cantidad, 0)
  );

  subtotal = computed(() =>
    this.cartItems().reduce((total, item) => total + this.getTotalItem(item), 0)
  );

  constructor() {
    this.loadFromLocalStorage();
    effect(() => {
      localStorage.setItem('shopping_cart', JSON.stringify(this.cartItems()));
    });
  }

  getCartItems() {
    return this.cartItems.asReadonly();
  }

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }
  toggle() { this.isOpen.update(v => !v); }

  addToCart(item: CartItem) {
    const existingIndex = this.cartItems().findIndex(
      cartItem => cartItem.id_vino === item.id_vino
    );

    if (existingIndex !== -1) {
      const current = this.cartItems()[existingIndex];
      const nuevaCantidad = current.cantidad + item.cantidad;
      this.updateQuantity(item.id_vino, current.presentacion, nuevaCantidad);
    } else {
      this.cartItems.update(items => [...items, item]);
    }
  }

  updateQuantity(id_vino: number, presentacion: string, nuevaCantidad: number) {
    if (nuevaCantidad <= 0) {
      this.removeItem(id_vino);
      return;
    }

    this.cartItems.update(items =>
      items.map(item =>
        item.id_vino === id_vino
          ? { ...item, cantidad: nuevaCantidad, presentacion: `${nuevaCantidad} ${nuevaCantidad === 1 ? 'botella' : 'botellas'}` }
          : item
      )
    );
  }

  removeItem(id_vino: number) {
    this.cartItems.update(items =>
      items.filter(item => item.id_vino !== id_vino)
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }

  private loadFromLocalStorage() {
    const savedCart = localStorage.getItem('shopping_cart');
    if (savedCart) {
      try {
        const items = JSON.parse(savedCart);
        this.cartItems.set(items);
      } catch (e) {
        console.error('Error loading cart from localStorage', e);
      }
    }
  }
}
