import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';

import { publicGuard } from './public.guard';
import { AuthService } from '../services/auth.service';

describe('publicGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => publicGuard(...guardParameters));

  let authServiceMock: {
    isAuthenticated: ReturnType<typeof vi.fn>;
    getRedirectUrl: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      isAuthenticated: vi.fn(),
      getRedirectUrl: vi.fn(),
    };

    routerMock = {
      navigate: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
      ],
    });
  });

  it('debería permitir el paso si NO está autenticado', () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(true);
  });

  it('debería redirigir si ya está autenticado', () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    authServiceMock.getRedirectUrl.mockReturnValue('/admin');

    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/admin']);
  });
});
