import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../../../../core/services/cart.service';
import { BodyScrollLockDirective } from '../../../../../shared/directives/body-scroll-lock.directive';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, BodyScrollLockDirective],
  templateUrl: './cart-modal.html',
  styles: ``
})

export class CartModal {
  cartService = inject(CartService);
  cartItems = this.cartService.getCartItems();
  subtotal = this.cartService.subtotal;

  getQuantityText(item: any): string {
    const totalBotellas = item.cantidad;
    const botellasPorCaja = item.botellas_por_caja;
    const cajas = Math.floor(totalBotellas / botellasPorCaja);
    const botellasSueltas = totalBotellas % botellasPorCaja;

    if (cajas === 0) {
      return `${totalBotellas} ${totalBotellas === 1 ? 'botella' : 'botellas'}`;
    } else if (botellasSueltas === 0) {
      return `${totalBotellas} botellas (${cajas} ${cajas === 1 ? 'caja' : 'cajas'})`;
    } else {
      return `${totalBotellas} botellas (${cajas} ${cajas === 1 ? 'caja' : 'cajas'} + ${botellasSueltas} ${botellasSueltas === 1 ? 'botella' : 'botellas'})`;
    }
  }

  getPrecioUnitarioActual(item: any): number {
    return this.cartService.getPrecioUnitarioActual(item);
  }

  getTotalItem(item: any): number {
    return this.cartService.getTotalItem(item);
  }

  tieneDescuento(item: any): boolean {
    return this.getPrecioUnitarioActual(item) < item.precio_base;
  }

  updateQuantity(item: any, change: number) {
    const newQuantity = item.cantidad + change;
    if (newQuantity >= 1) {
      this.cartService.updateQuantity(item.id_vino, item.presentacion, newQuantity);
    }
  }

  removeItem(item: any) {
    this.cartService.removeItem(item.id_vino);
  }
}
