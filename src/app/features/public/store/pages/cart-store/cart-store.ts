import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

import { CartService, CartItem } from '../../../../../core/services/cart.service';
import { ToastService } from '../../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-cart-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart-store.html',
})
export class CartStore {
  cartService = inject(CartService);

  cartItems  = this.cartService.cartItems;
  subtotal   = this.cartService.subtotal;

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

    this.cartService.updateQuantity(item, change);

    if (change > 0) {
      this.toastService.showSuccess(
        'Cantidad actualizada',
        `${item.nombre} · ${item.cantidad + 1} ${item.cantidad + 1 === 1 ? 'botella' : 'botellas'}`
      );
    } else if (change < 0 && item.cantidad > 1) {
      this.toastService.showWarning(
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
    this.router.navigate(['/store']);
  }
}
