import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, NavigationStart, Router } from '@angular/router';
import { CartService, CartItem } from '../../../../../core/services/cart.service';
import { BodyScrollLockDirective } from '../../../../../shared/directives/body-scroll-lock.directive';

@Component({
  selector: 'app-cart-modal',
  standalone: true,
  imports: [CommonModule, RouterLink, BodyScrollLockDirective],
  templateUrl: './cart-modal.html',
})
export class CartModal implements OnInit {
  cartService = inject(CartService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) this.cartService.close();
    });
  }

  ngOnInit(): void {
    
  }

  getQuantityText(item: CartItem): string {
    const { cantidad, botellas_por_caja } = item;
    const cajas = Math.floor(cantidad / botellas_por_caja);
    const sueltas = cantidad % botellas_por_caja;
    if (cajas === 0) return `${cantidad} ${cantidad === 1 ? 'botella' : 'botellas'}`;
    if (sueltas === 0) return `${cantidad} botellas (${cajas} ${cajas === 1 ? 'caja' : 'cajas'})`;
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

  updateQuantity(item: CartItem, change: number): void {
    this.cartService.updateQuantity(item, change);
  }

  removeItem(item: CartItem): void {
    this.cartService.removeItem(item);
  }
}
