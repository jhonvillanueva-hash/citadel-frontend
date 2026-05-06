import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { CartService } from '../services/cart.service';

export const storeGuard: CanActivateFn = () => {
  const cartService = inject(CartService);

  cartService.initCart();
  return true;
};
