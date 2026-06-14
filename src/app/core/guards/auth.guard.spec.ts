import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { PLATFORM_ID, signal } from '@angular/core';
import { vi } from 'vitest';
import { firstValueFrom } from 'rxjs';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  let authServiceMock: {
    isInitializing: ReturnType<typeof signal<boolean>>;
    isAuthenticated: ReturnType<typeof vi.fn>;
  };

  let routerMock: {
    navigate: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    authServiceMock = {
      isInitializing: signal(true),
      isAuthenticated: vi.fn(),
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

  it('debería permitir el paso si es plataforma servidor', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    const result = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    expect(result).toBe(true);
  });

  it('debería permitir el paso si está autenticado después de inicializar', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(true);
    
    const result$ = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);
    
    authServiceMock.isInitializing.set(false);
    
    const result = await firstValueFrom(result$ as any);
    expect(result).toBe(true);
  });

  it('debería bloquear y redirigir a login si no está autenticado después de inicializar', async () => {
    authServiceMock.isAuthenticated.mockReturnValue(false);
    
    const result$ = executeGuard({} as ActivatedRouteSnapshot, {} as RouterStateSnapshot);

    authServiceMock.isInitializing.set(false);
    
    const result = await firstValueFrom(result$ as any);
    expect(result).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
