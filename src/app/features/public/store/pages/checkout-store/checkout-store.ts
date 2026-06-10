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

@Component({
  selector: 'app-checkout-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-store.html',
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

  cartItems = this.cartService.cartItems;

  email = signal('');
  nombres = signal('');
  apellidos = signal('');
  dni = signal('');
  telefono = signal('');
  deliveryType = signal<'home' | 'pickup'>('home');

  direccion = signal('');
  departamento = signal('');
  provincia = signal('');
  distrito = signal('');
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

  storeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.0034028862783!2d-79.03289702523057!3d-8.101133691927716!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad3d8e1edab0b7%3A0xbd166949bab68060!2sAv.%20Carlos%20Valderrama%20491%2C%20Trujillo%2013001!5e0!3m2!1ses-419!2spe!4v1780459041053!5m2!1ses-419!2spe'
  );

  departamentos: any[] = [];
  provincias: any[] = [];
  distritos: any[] = [];
  filteredProvincias: any[] = [];
  filteredDistritos: any[] = [];

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

      // Sincronizar tipo de envío desde el carrito activo
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

    // 1. Si el usuario está logueado → usar datos reales
    const user = this.authService.currentUser();

    if (user) {
      this.email.set(user.email || '');
      this.nombres.set(user.nombres || '');
      this.apellidos.set(user.apellidos || '');
      this.dni.set(user.dni || '');
      this.telefono.set(user.telefono || '');
      this.direccion.set(user.direccion || '');

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
      this.departamento.set(p.departamento);

      this.filteredProvincias = this.provincias.filter(
        pr => pr.departamento_id == Number(p.departamento)
      );
    }

    if (p.provincia) {
      this.provincia.set(p.provincia);

      this.filteredDistritos = this.distritos.filter(
        d => d.provincia_id == Number(p.provincia)
      );
    }

    if (p.distrito) {
      this.distrito.set(p.distrito);
    }

    if (this.isStep1Valid()) {
      this.step1Completed.set(true);
      this.step2Enabled.set(true);
    } else {
      this.step1Completed.set(false);
      this.step2Enabled.set(false);
    }

    if (this.step1Completed() && this.isStep2Valid()) {
      this.step2Completed.set(true);
    } else {
      this.step2Completed.set(false);
    }
  }

  onDepartamentoChange(): void {
    this.provincia.set('');
    this.distrito.set('');
    this.filteredDistritos = [];
    this.filteredProvincias = this.provincias.filter(p =>
      p.departamento_id == Number(this.departamento())
    );
    this.checkoutService.updateField('departamento', this.departamento());
    this.checkoutService.updateField('provincia', '');
    this.checkoutService.updateField('distrito', '');
  }

  onProvinciaChange(): void {
    this.distrito.set('');
    this.filteredDistritos = this.distritos.filter(d =>
      d.provincia_id == Number(this.provincia())
    );
    this.checkoutService.updateField('provincia', this.provincia());
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
      this.step1Completed.set(true);
      this.step2Enabled.set(true);
    }
  }

  completeStep2(): void {
    if (this.isStep2Valid()) {
      this.step2Completed.set(true);
    }
  }

  buscarEnMapa(): void {
    const dep = this.departamentos.find(
      d => String(d.id) === String(this.departamento())
    );
    const prov = this.filteredProvincias.find(
      p => String(p.id) === String(this.provincia())
    );
    const dist = this.filteredDistritos.find(
      d => String(d.id) === String(this.distrito())
    );
    const dir = `${this.direccion()} ${this.numeroCasa()}, ${dist?.distrito}, ${prov?.provincia}, ${dep?.departamento}, Perú`;
    const url = `https://maps.google.com/maps?q=${encodeURIComponent(dir)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
    this.mapUrl.set(
      this.sanitizer.bypassSecurityTrustResourceUrl(url)
    );
  }

  goBackToStore(): void {
    this.router.navigate(['/store']);
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
          this.cartService.setCoupon(cupon.id_cupon);
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
    this.cartService.setCoupon(null);
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
}
