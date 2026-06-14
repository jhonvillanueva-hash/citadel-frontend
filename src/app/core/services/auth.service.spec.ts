import { TestBed } from '@angular/core/testing';
import { AuthService, User } from './auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

describe('AuthService - Redirección', () => {
  let service: AuthService;

  const mockAdmin: User = {
    id_usuario: 1, nombres: 'Admin', apellidos: 'Test', email: 'admin@test.com',
    dni: '123', telefono: '123', tipo: 'A'
  };

  const mockUser: User = {
    id_usuario: 2, nombres: 'User', apellidos: 'Test', email: 'user@test.com',
    dni: '456', telefono: '456', tipo: 'U'
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([])
      ]
    });
    service = TestBed.inject(AuthService);
  });

  it('debería ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debería redirigir a /admin si el usuario es tipo "A"', () => {
    service.setUser(mockAdmin);
    const url = service.getRedirectUrl();
    expect(url).toBe('/admin');
  });

  it('debería redirigir a / si el usuario es tipo "U"', () => {
    service.setUser(mockUser);
    const url = service.getRedirectUrl();
    expect(url).toBe('/');
  });

  it('debería redirigir a /login si no hay usuario (null)', () => {
    service.handleLogout(); 
    const url = service.getRedirectUrl();
    expect(url).toBe('/login');
  });
});