import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CartService } from '../../../../../core/services/cart.service';

@Component({
  selector: 'app-cart-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart-store.html',
})

export class CartStore {
  cartService = inject(CartService);
  cartItems = this.cartService.getCartItems();
  subtotal = this.cartService.subtotal;
  private router = inject(Router);

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

  getTotalAhorro(): number {
    let totalAhorro = 0;
    for (const item of this.cartItems()) {
      if (this.tieneDescuento(item)) {
        totalAhorro += (item.precio_base - this.getPrecioUnitarioActual(item)) *
          (item.esCaja ? item.cantidad * item.botellas_por_caja : item.cantidad);
      }
    }
    return totalAhorro;
  }

  getTotal(): number {
    return this.subtotal();
  }

  volverATienda() {
    this.router.navigate(['/store']);
  }
}
