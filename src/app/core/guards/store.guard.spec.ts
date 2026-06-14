import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { storeGuard } from './store.guard';
import { CartService } from '../services/cart.service';

describe('storeGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => storeGuard(...guardParameters));

  let cartServiceMock: {
    initCart: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    cartServiceMock = {
      initCart: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: CartService, useValue: cartServiceMock },
      ],
    });
  });

  it('debería llamar a initCart y permitir el paso', () => {
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(cartServiceMock.initCart).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
