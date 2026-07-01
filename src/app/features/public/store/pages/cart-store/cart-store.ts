import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { CartService, CartItem } from '../../../../../core/services/cart.service';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { faArrowUpRightFromSquare, faLock, faTrashCan, faTruckFast, faWallet } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-cart-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, FontAwesomeModule],
  templateUrl: './cart-store.html',
  styles: `
    .quantity-wrapper {
      position: relative;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      height: 24px;
      min-width: 20px;
    }

    .qty-old {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .qty-new {
      display: inline-flex;
    }

    .up-out { animation: slideUpOut 200ms ease-out forwards; }
    .up-in  { animation: slideUpIn 200ms ease-out forwards; }

    .down-out { animation: slideDownOut 200ms ease-out forwards; }
    .down-in  { animation: slideDownIn 200ms ease-out forwards; }

    @keyframes slideUpOut {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(-100%); opacity: 0; }
    }
    @keyframes slideUpIn {
      0% { transform: translateY(100%); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }

    @keyframes slideDownOut {
      0% { transform: translateY(0); opacity: 1; }
      100% { transform: translateY(100%); opacity: 0; }
    }
    @keyframes slideDownIn {
      0% { transform: translateY(-100%); opacity: 0; }
      100% { transform: translateY(0); opacity: 1; }
    }
  `
})
export class CartStore {
  cartService = inject(CartService);

  cartItems = this.cartService.cartItems;
  subtotal = this.cartService.subtotal;

  private router = inject(Router);
  private toastService = inject(ToastService);

  getQuantityText(item: CartItem): string {
    const { cantidad, botellas_por_caja } = item;
    const cajas = Math.floor(cantidad / botellas_por_caja);
    const sueltas = cantidad % botellas_por_caja;

    if (cajas === 0) {
      return `${cantidad} ${cantidad === 1 ? 'botella' : 'botellas'}`;
    }

    if (sueltas === 0) {
      return `${cantidad} botellas (${cajas} ${cajas === 1 ? 'caja' : 'cajas'})`;
    }

    return `${cantidad} botellas (${cajas} ${cajas === 1 ? 'caja' : 'cajas'} + ${sueltas} ${sueltas === 1 ? 'botella' : 'botellas'})`;
  }

  getPrecioUnitarioActual(item: CartItem): number {
    return this.cartService.getPrecioUnitarioActual(item);
  }

  getTotalItem(item: CartItem): number {
    return this.cartService.getTotalItem(item);
  }

  tieneDescuento(item: CartItem): boolean {
    return this.cartService.tieneDescuento(item);
  }

  isAtStockLimit(item: CartItem): boolean {
    return this.cartService.isAtStockLimit(item);
  }

  updateQuantity(item: CartItem, change: number): void {

    if (change > 0 && item.cantidad >= item.stock) {
      this.toastService.showError(
        'Stock máximo alcanzado',
        `Solo hay ${item.stock} unidad${item.stock === 1 ? '' : 'es'} disponible${item.stock === 1 ? '' : 's'}`
      );
      return;
    }

    item.oldCantidad = item.cantidad;
    item.animationDirection = null;
    setTimeout(() => {
      item.animationDirection = change > 0 ? 'up' : 'down';
      this.cartService.updateQuantity(item, change);
    }, 0);

    if (change > 0) {
      this.toastService.showSuccess(
        'Cantidad actualizada',
        `${item.nombre} · ${item.cantidad + 1} ${item.cantidad + 1 === 1 ? 'botella' : 'botellas'}`
      );
    } else if (change < 0 && item.cantidad > 1) {
      this.toastService.showSuccess(
        'Cantidad disminuida',
        `${item.nombre} · ${item.cantidad - 1} ${item.cantidad - 1 === 1 ? 'botella' : 'botellas'}`
      );
    }
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item);
  }

  getTotalAhorro(): number {
    return this.cartItems().reduce((acc, item) => {
      if (!this.tieneDescuento(item)) return acc;

      return acc + (
        item.precio_base - this.getPrecioUnitarioActual(item)
      ) * item.cantidad;

    }, 0);
  }

  getTotal(): number {
    return this.subtotal();
  }

  volverATienda(): void {
    this.router.navigate(['/']);
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  icons = {
    faTrashCan,
    faWallet,
    faLock,
    faTruckFast,
    faArrowUpRightFromSquare,
  }
}
