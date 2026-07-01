import { Component, inject, OnInit, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CartService } from '../../../../../core/services/cart.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../../core/services/auth.service';
import { CuponService } from '../../../../../data/services/cupon.service';
import { Cupon } from '../../../../../data/models/api.models';
import { CheckoutService } from '../../../../../core/services/checkout.service';
import { CulqiService } from '../../../../../core/services/culqi.service';
import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { UsuarioService } from '../../../../../data/services/usuario.service';
import { DireccionService } from '../../../../../data/services/direccion.service';

@Component({
  selector: 'app-checkout-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-store.html',
  styles: `
    @keyframes borderPulse {
    0% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
    }

    50% {
      box-shadow: 0 0 0 8px rgba(239, 68, 68, 0.15);
    }

    100% {
      box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
    }
  }

  .border-pulse {
    animation: borderPulse 1.6s infinite;
  }
  `,
})
export class CheckoutStore implements OnInit {
  private authService = inject(AuthService);
  private checkoutService = inject(CheckoutService);
  cartService = inject(CartService);
  private cuponService = inject(CuponService);
  private sanitizer = inject(DomSanitizer);
  private http = inject(HttpClient);
  private router = inject(Router);
  private culqiService = inject(CulqiService);
  private toastService = inject(ToastService);
  private userService = inject(UsuarioService);
  private directionService = inject(DireccionService);

  cartItems = this.cartService.cartItems;

  email = signal('');
  nombres = signal('');
  apellidos = signal('');
  dni = signal('');
  telefono = signal('');
  deliveryType = signal<'home' | 'pickup'>('home');

  departamento = signal('');
  provincia = signal('');
  distrito = signal('');
  direccion = signal('');
  numeroCasa = signal('');
  codigoPostal = signal('');

  pickupAddress = signal('Av. Carlos Valderrama 491, Trujillo 13001, La Libertad, Perú');
  pickupDetails = signal('Punto de recogida oficial - Lunes a Sábado 10:00 AM - 8:00 PM');

  paymentMethod = signal<string | null>(null);
  yapeAvailable = signal(true);

  step1Completed = signal(false);
  step2Completed = signal(false);
  step1Enabled = signal(true);
  step2Enabled = signal(false);

  mapUrl = signal<SafeResourceUrl | null>(null);

  private initialStep2Values = {
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    numeroCasa: '',
    codigoPostal: ''
  };

  storeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.0034028862783!2d-79.03289702523057!3d-8.101133691927716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad3d8e1edab0b7%3A0xbd166949bab68060!2sAv.%20Carlos%20Valderrama%20491%2C%20Trujillo%2013001!5e0!3m2!1ses-419!2spe!4v1780459041053!5m2!1ses-419!2spe'
  );

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  filteredProvincias: any[] = [];
  filteredDistritos: any[] = [];

  isEditingStep1 = signal(false);
  isEditingStep2 = signal(false);

  private step1DataBackup = {
    email: '',
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: ''
  };

  private step2DataBackup = {
    departamento: '',
    provincia: '',
    distrito: '',
    direccion: '',
    numeroCasa: '',
    codigoPostal: ''
  };

  showCouponInput = signal(false);
  couponCode = signal('');
  couponApplied = signal(false);
  couponError = signal('');
  appliedCoupon = signal<Cupon | null>(null);
  loadingCulqi = this.culqiService.loading;

  discountAmount = computed(() => {
    const cupon = this.appliedCoupon();
    if (!cupon || !this.couponApplied()) return 0;
    return cupon.tipo_descuento === 'F'
      ? Math.min(cupon.descuento, this.subtotal)
      : this.subtotal * (cupon.descuento / 100);
  });

  get total(): number { return this.discountedSubtotal + this.shippingCost; }

  get discountedSubtotal(): number {
    const value = this.subtotal - this.discountAmount();
    return value < 0 ? 0 : value;
  }

  constructor() {
    effect(() => {
      const carrito = this.cartService.getCarritoActivo();

      if (carrito?.tipo) {
        const type = carrito.tipo === 'D' ? 'home' : 'pickup';
        if (this.deliveryType() !== type) {
          this.deliveryType.set(type);
        }
      }

      if (carrito?.id_cupon && !this.couponApplied() && !this.appliedCoupon()) {
        this.loadCouponById(carrito.id_cupon);
      } else if (!carrito?.id_cupon && this.couponApplied()) {
        this.removeCouponLocally();
      }
    });

    // Sincronizar datos del usuario si está logueado
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        if (user.email) this.email.set(user.email);
        if (user.nombres) this.nombres.set(user.nombres);
        if (user.apellidos) this.apellidos.set(user.apellidos);
        if (user.dni) this.dni.set(user.dni);
        if (user.telefono) this.telefono.set(user.telefono);
        if (user.direccion) this.direccion.set(user.direccion);
      }
    });
  }

  private loadCouponById(id: number): void {
    this.cuponService.getById(id).subscribe({
      next: (cupon) => {
        if (cupon && cupon.activo) {
          const hoy = new Date();
          if (new Date(cupon.fecha_inicio) <= hoy && new Date(cupon.fecha_fin) >= hoy) {
            if (this.subtotal >= cupon.monto_minimo) {
              this.appliedCoupon.set(cupon);
              this.couponApplied.set(true);
            } else {
              this.cartService.setCoupon(null);
            }
          }
        }
      }
    });
  }

  private removeCouponLocally(): void {
    this.couponApplied.set(false);
    this.showCouponInput.set(false);
    this.couponCode.set('');
    this.couponError.set('');
    this.appliedCoupon.set(null);
  }

  get isLogged(): boolean {
    return !!this.authService.currentUser();
  }

  async handleReservar(): Promise<void> {
    if (!this.isLogged) {
      this.router.navigate(['/login']);
      return;
    }

    try {
      const response: any = await this.culqiService.pagar(this.email());

      if (response.success) {
        this.router.navigate(['/store/profile']);
        return;
      }

      this.toastService.showError(
        'Error en el pago',
        'Asegúrate de tener saldo suficiente.'
      );
    } catch (error: any) {
      console.error(error);

      const declineCode = error?.culqi?.decline_code;
      const userMessage = error?.culqi?.user_message;
      const merchantMessage = error?.culqi?.merchant_message;

      const message =
        declineCode === 'insufficient_funds'
          ? 'La tarjeta no tiene saldo suficiente.'
          : userMessage || merchantMessage || 'Pago rechazado.';

      this.toastService.show(
        'error',
        'Error en el pago',
        message
      );
    }
  }

  get subtotal(): number {
    return this.cartService.subtotal();
  }

  get shippingCost(): number {
    return this.deliveryType() === 'home' ? 20 : 0;
  }

  private isStep1Valid(): boolean {
    const e = this.email()?.trim();
    const dni = String(this.dni() ?? '').trim();
    const telefono = String(this.telefono() ?? '').trim();

    return (
      !!this.nombres()?.trim() &&
      !!this.apellidos()?.trim() &&
      /^\d{8}$/.test(dni) &&
      /^\d{9}$/.test(telefono) &&
      !!e &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
    );
  }

  private isStep2Valid(): boolean {
    if (this.deliveryType() === 'pickup') return true;
    return !!(this.direccion() && this.departamento() && this.provincia() &&
      this.distrito() && this.numeroCasa());
  }

  ngOnInit(): void {
    this.http.get<any>('assets/1_ubigeo_departamentos.json')
      .subscribe(res => this.departamentos = res.ubigeo_departamentos);

    this.http.get<any>('assets/2_ubigeo_provincias.json')
      .subscribe(res => this.provincias = res.ubigeo_provincias);

    this.http.get<any>('assets/3_ubigeo_distritos.json')
      .subscribe(res => {
        this.distritos = res.ubigeo_distritos;
        this.restoreFromProfile();
      });
  }

  private restoreFromProfile(): void {
    const user = this.authService.currentUser();

    if (user) {
      this.email.set(user.email || '');
      this.nombres.set(user.nombres || '');
      this.apellidos.set(user.apellidos || '');
      this.dni.set(user.dni || '');
      this.telefono.set(user.telefono || '');

      this.userService.getProfile().subscribe({
        next: (profileUser) => {
          const principalAddress = profileUser.direcciones?.find(d => d.principal) || profileUser.direcciones?.[0] || null;
          this.applyStep2DataFromAddress(principalAddress);
          this.updateStepState();
        },
        error: () => {
          this.updateStepState();
        }
      });

      return;
    }

    const p = this.checkoutService.getProfile();

    this.email.set(p.email);
    this.nombres.set(p.nombres);
    this.apellidos.set(p.apellidos);
    this.dni.set(p.dni);
    this.telefono.set(p.telefono);

    this.deliveryType.set(p.deliveryType);
    this.direccion.set(p.direccion);
    this.numeroCasa.set(p.numeroCasa);
    this.codigoPostal.set(p.codigoPostal);

    if (p.departamento) {
      const departamentoId = String(p.departamento);
      this.departamento.set(departamentoId);

      this.filteredProvincias = this.provincias.filter(
        pr => pr.departamento_id == Number(departamentoId)
      );
    }

    if (p.provincia) {
      const provinciaId = String(p.provincia);
      this.provincia.set(provinciaId);

      this.filteredDistritos = this.distritos.filter(
        d => d.provincia_id == Number(provinciaId)
      );
    }

    if (p.distrito) {
      this.distrito.set(String(p.distrito));
    }

    this.updateStepState();
  }

  private applyStep2DataFromAddress(address: {
    id_departamento?: number;
    id_provincia?: number;
    id_distrito?: number;
    calle?: string;
    numero?: string;
    cp?: number | string;
  } | null): void {
    if (!address) {
      return;
    }

    this.departamento.set(address.id_departamento != null ? String(address.id_departamento) : '');
    this.provincia.set(address.id_provincia != null ? String(address.id_provincia) : '');
    this.distrito.set(address.id_distrito != null ? String(address.id_distrito) : '');
    this.direccion.set(address.calle ?? '');
    this.numeroCasa.set(address.numero ?? '');
    this.codigoPostal.set(address.cp != null ? String(address.cp) : '');

    this.filteredProvincias = this.provincias.filter(
      pr => pr.departamento_id == Number(this.departamento())
    );
    this.filteredDistritos = this.distritos.filter(
      d => d.provincia_id == Number(this.provincia())
    );
  }

  private updateStepState(): void {
    if (this.isStep1Valid()) {
      this.step1Completed.set(true);
      this.step2Enabled.set(true);
    } else {
      this.step1Completed.set(false);
      this.step2Enabled.set(false);
    }

    this.syncStep2Snapshot();

    if (this.step1Completed() && this.isStep2Valid()) {
      this.step2Completed.set(true);
    } else {
      this.step2Completed.set(false);
    }
  }

  private syncStep2Snapshot(): void {
    this.initialStep2Values = {
      departamento: String(this.departamento() ?? ''),
      provincia: String(this.provincia() ?? ''),
      distrito: String(this.distrito() ?? ''),
      direccion: String(this.direccion() ?? ''),
      numeroCasa: String(this.numeroCasa() ?? ''),
      codigoPostal: String(this.codigoPostal() ?? '')
    };
  }

  private hasStep2AddressChanged(): boolean {
    return (
      this.initialStep2Values.departamento !== String(this.departamento() ?? '') ||
      this.initialStep2Values.provincia !== String(this.provincia() ?? '') ||
      this.initialStep2Values.distrito !== String(this.distrito() ?? '') ||
      this.initialStep2Values.direccion !== String(this.direccion() ?? '') ||
      this.initialStep2Values.numeroCasa !== String(this.numeroCasa() ?? '') ||
      this.initialStep2Values.codigoPostal !== String(this.codigoPostal() ?? '')
    );
  }

  onDepartamentoChange(value: string): void {
    this.departamento.set(value);
    this.provincia.set('');
    this.distrito.set('');
    this.filteredDistritos = [];
    this.filteredProvincias = this.provincias.filter(p =>
      p.departamento_id == Number(value)
    );
    this.checkoutService.updateField('departamento', value);
    this.checkoutService.updateField('provincia', '');
    this.checkoutService.updateField('distrito', '');
  }

  onProvinciaChange(value: string): void {
    this.provincia.set(value);
    this.distrito.set('');
    this.filteredDistritos = this.distritos.filter(d =>
      d.provincia_id == Number(value)
    );
    this.checkoutService.updateField('provincia', value);
    this.checkoutService.updateField('distrito', '');
  }

  goBackToStep1(): void {
    this.step1Completed.set(false);
    this.step2Enabled.set(false);
    this.step2Completed.set(false);
    this.paymentMethod.set(null);
  }

  goBackToStep2(): void {
    this.step2Completed.set(false);
    this.paymentMethod.set(null);
  }

  completeStep1(): void {
    if (this.isStep1Valid()) {
      const user = this.authService.currentUser();
      if (user) {
        this.userService.patch(user.id_usuario, {
          dni: this.dni(),
          telefono: this.telefono()
        }).subscribe({
          next: (resp) => {
            this.toastService.showSuccess('¡Datos guardados correctamente!');
          },
          error: (err) => {
            console.error(err);
          }
        });
        this.step1Completed.set(true);
        this.step2Enabled.set(true);
      }
    }
  }

  completeStep2(): void {
    if (this.isStep2Valid()) {
      const shouldSaveAddress = this.deliveryType() === 'home' && this.hasStep2AddressChanged();

      if (shouldSaveAddress) {
        this.directionService.actualizarPrincipal({
          id_departamento: Number(this.departamento()),
          id_provincia: Number(this.provincia()),
          id_distrito: Number(this.distrito()),
          calle: this.direccion(),
          numero: this.numeroCasa(),
          cp: Number(this.codigoPostal())
        }).subscribe({
          next: () => {
            this.syncStep2Snapshot();
            this.toastService.showSuccess('¡Datos actualizados correctamente!');
          },
          error: (err) => {
            console.error(err);
          }
        });
      }

      this.step2Completed.set(true);
    }
  }

  goBackToStore(): void {
    this.router.navigate(['/']);
  }

  onEmailChange(value: string): void {
    this.email.set(value);
    this.checkoutService.updateField('email', value);
  }

  onNombresChange(value: string): void {
    this.nombres.set(value);
    this.checkoutService.updateField('nombres', value);
  }

  onApellidosChange(value: string): void {
    this.apellidos.set(value);
    this.checkoutService.updateField('apellidos', value);
  }

  onDeliveryTypeChange(value: 'home' | 'pickup'): void {
    this.deliveryType.set(value);
    this.checkoutService.updateField('deliveryType', value);
    const cartTipo = value === 'home' ? 'D' : 'T';
    this.cartService.setDeliveryType(cartTipo);
  }

  onDireccionChange(value: string): void {
    this.direccion.set(value);
    this.checkoutService.updateField('direccion', value);
  }

  onDistritoChange(value: string): void {
    this.distrito.set(value);
    this.checkoutService.updateField('distrito', value);
  }

  onNumeroCasaChange(value: string): void {
    this.numeroCasa.set(value);
    this.checkoutService.updateField('numeroCasa', value);
  }

  onCodigoPostalChange(value: string): void {
    this.codigoPostal.set(value);
    this.checkoutService.updateField('codigoPostal', value);
  }

  onDniChange(value: string) {
    this.dni.set(value);
    this.checkoutService.updateField('dni', value);
  }

  onTelefonoChange(value: string) {
    this.telefono.set(value);
    this.checkoutService.updateField('telefono', value);
  }

  applyCoupon(): void {
    const code = this.couponCode();
    if (code.length !== 6 || !/^\d+$/.test(code)) return;

    this.couponError.set('');

    this.cuponService.findByField('codigo', Number(code))
      .subscribe({
        next: (cupones) => {
          const cupon = cupones.find(c => c.activo);

          if (!cupon) {
            this.couponError.set('Cupón inválido o inactivo');
            return;
          }

          const hoy = new Date();
          if (new Date(cupon.fecha_inicio) > hoy || new Date(cupon.fecha_fin) < hoy) {
            this.couponError.set('Cupón fuera de fecha');
            return;
          }

          if (this.subtotal < cupon.monto_minimo) {
            this.couponError.set(`Compra mínima requerida: S/ ${cupon.monto_minimo}`);
            return;
          }

          this.couponApplied.set(true);
          this.showCouponInput.set(false);
          this.couponCode.set('');
          this.couponError.set('');
          this.appliedCoupon.set(cupon);
          this.cartService.setCoupon(cupon.id_cupon)
            .subscribe({
              next: () => {
                // éxito
              },
              error: (err) => {
                this.toastService.showWarning(err.error?.message ??
                  'Ya has usado este cupón anteriormente.');
              }
            });
        },
        error: () => {
          this.couponError.set('Error al validar el cupón. Intente nuevamente.');
        }
      });
  }

  removeCoupon(): void {
    this.couponApplied.set(false);
    this.showCouponInput.set(false);
    this.couponCode.set('');
    this.couponError.set('');
    this.appliedCoupon.set(null);
    this.cartService.setCoupon(null).subscribe({
      next: () => {
        this.toastService.showSuccess('Cupón eliminado correctamente.');
      },
      error: err => {
        console.error(err);
      }
    });
  }

  cancelCoupon(): void {
    this.showCouponInput.set(false);
    this.couponCode.set('');
    this.couponError.set('');
  }

  activateCoupon(): void {
    if (!this.isLogged) { this.router.navigate(['/login']); return; }
    this.showCouponInput.set(true);
  }

  enableEditingStep1(): void {
    this.isEditingStep1.set(true);
    this.step1DataBackup = {
      email: this.email(),
      nombres: this.nombres(),
      apellidos: this.apellidos(),
      dni: this.dni(),
      telefono: this.telefono()
    };
  }

  cancelEditingStep1(): void {
    this.isEditingStep1.set(false);
    this.email.set(this.step1DataBackup.email);
    this.nombres.set(this.step1DataBackup.nombres);
    this.apellidos.set(this.step1DataBackup.apellidos);
    this.dni.set(this.step1DataBackup.dni);
    this.telefono.set(this.step1DataBackup.telefono);
  }

  enableEditingStep2(): void {
    this.isEditingStep2.set(true);
    this.step2DataBackup = {
      departamento: this.departamento(),
      provincia: this.provincia(),
      distrito: this.distrito(),
      direccion: this.direccion(),
      numeroCasa: this.numeroCasa(),
      codigoPostal: this.codigoPostal()
    };
  }

  cancelEditingStep2(): void {
    this.isEditingStep2.set(false);
    this.departamento.set(this.step2DataBackup.departamento);
    this.provincia.set(this.step2DataBackup.provincia);
    this.distrito.set(this.step2DataBackup.distrito);
    this.direccion.set(this.step2DataBackup.direccion);
    this.numeroCasa.set(this.step2DataBackup.numeroCasa);
    this.codigoPostal.set(this.step2DataBackup.codigoPostal);

    this.filteredProvincias = this.provincias.filter(
      pr => pr.departamento_id == Number(this.departamento())
    );
    this.filteredDistritos = this.distritos.filter(
      d => d.provincia_id == Number(this.provincia())
    );
  }
}
