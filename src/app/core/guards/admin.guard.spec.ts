import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { adminGuard } from './admin.guard';
import { AuthService, User } from '../services/auth.service';

describe('AdminGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => adminGuard(...guardParameters));

  let authSpy: {
    currentUser: ReturnType<typeof vi.fn>;
  };

  let routerSpy: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authSpy = {
      currentUser: vi.fn()
    };

    routerSpy = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy }
      ]
    });
  });

  it('debería permitir el paso si es Admin', () => {
    authSpy.currentUser.mockReturnValue({ tipo: 'A' } as User);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );

    expect(result).toBe(true);
  });

  it('debería bloquear si no es Admin', () => {
    authSpy.currentUser.mockReturnValue({ tipo: 'U' } as User);

    const result = executeGuard(
      {} as ActivatedRouteSnapshot,
      {} as RouterStateSnapshot
    );

    expect(result).toBe(false);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
  });
});