import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { AuthService } from '../../../../../core/services/auth.service';
import { CartService } from '../../../../../core/services/cart.service';
import { CheckoutService } from '../../../../../core/services/checkout.service';
import { CulqiService } from '../../../../../core/services/culqi.service';
import { CuponService } from '../../../../../data/services/cupon.service';
import { DireccionService } from '../../../../../data/services/direccion.service';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { CheckoutStore } from './checkout-store';

describe('CheckoutStore', () => {
  let component: CheckoutStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckoutStore, RouterTestingModule],
      providers: [
        {
          provide: AuthService,
          useValue: {
            currentUser: () => ({
              id_usuario: 1,
              email: 'cliente@ejemplo.com',
              nombres: 'Juan',
              apellidos: 'Pérez',
              dni: '12345678',
              telefono: '987654321'
            })
          }
        },
        {
          provide: CartService,
          useValue: {
            cartItems: signal([]),
            getCarritoActivo: () => null,
            subtotal: () => 0,
            setCoupon: () => of({}),
            setDeliveryType: () => {}
          }
        },
        {
          provide: CheckoutService,
          useValue: {
            getProfile: () => ({
              email: 'cliente@ejemplo.com',
              nombres: 'Juan',
              apellidos: 'Pérez',
              dni: '12345678',
              telefono: '987654321',
              deliveryType: 'home',
              direccion: 'Av. Principal',
              numeroCasa: '123',
              codigoPostal: '15001',
              departamento: '1',
              provincia: '2',
              distrito: '3'
            }),
            updateField: () => {}
          }
        },
        { provide: CuponService, useValue: {} },
        {
          provide: UsuarioService,
          useValue: {
            getProfile: () => of({ direcciones: [] })
          }
        },
        { provide: DireccionService, useValue: { actualizarPrincipal: () => of({}) } },
        {
          provide: ToastService,
          useValue: {
            showSuccess: () => {},
            showError: () => {},
            showWarning: () => {},
            show: () => {}
          }
        },
        {
          provide: CulqiService,
          useValue: {
            loading: signal(false),
            pagar: () => Promise.resolve({ success: true })
          }
        },
        { provide: HttpClient, useValue: {} },
        {
          provide: DomSanitizer,
          useValue: {
            bypassSecurityTrustResourceUrl: (value: string) => value
          }
        },
        { provide: Router, useValue: { navigate: jasmine.createSpy('navigate') } }
      ]
    }).compileComponents();

    const fixture = TestBed.createComponent(CheckoutStore);
    component = fixture.componentInstance;
  });

  it('does not enable edit mode after restoring profile data', () => {
    (component as any).restoreFromProfile();

    expect(component.isEditingStep1()).toBeFalse();
    expect(component.isEditingStep2()).toBeFalse();
  });
});
