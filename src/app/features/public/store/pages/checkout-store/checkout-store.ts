import { Component, inject, OnInit, signal } from '@angular/core';
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

@Component({
  selector: 'app-checkout-store',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout-store.html',
})
export class CheckoutStore implements OnInit {
  private authService     = inject(AuthService);
  private checkoutService = inject(CheckoutService);
  cartService  = inject(CartService);
  private cuponService = inject(CuponService);
  private sanitizer = inject(DomSanitizer);
  private http      = inject(HttpClient);
  private router    = inject(Router);

  cartItems = this.cartService.cartItems;

  email        = signal('');
  nombres      = signal('');
  apellidos    = signal('');
  deliveryType = signal<'home' | 'pickup'>('home');

  direccion    = signal('');
  departamento = signal('');
  provincia    = signal('');
  distrito     = signal('');
  numeroCasa   = signal('');
  codigoPostal = signal('');

  pickupAddress = signal('Baltazar Villalonga 1775, El Porvenir, Trujillo, La Libertad, Peru');
  pickupDetails = signal('Tienda Principal - Horario: Lunes a Sábado 10am-8pm');

  paymentMethod = signal<string | null>(null);
  yapeAvailable = signal(true);

  step1Completed = signal(false);
  step2Completed = signal(false);
  step3Completed = signal(false);
  step1Enabled   = signal(true);
  step2Enabled   = signal(false);
  step3Enabled   = signal(false);

  mapUrl = signal<SafeResourceUrl | null>(null);

  yapeIcon         = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Icono_de_la_aplicaci%C3%B3n_Yape.png';
  pagoEfectivoIcon = 'https://scontent.flim37-1.fna.fbcdn.net/v/t39.30808-6/462601235_953445320144713_2500571434057430817_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_ohc=H1aIIt90Eb0Q7kNvwHgXD-P&_nc_oc=Adpb8_HPIJPJU402lDpiv0Cl86zaBKbuLp8E_e8vKQGJdHDUcrwOKXnw6qqFTDe9bL_m3hixzEwwCeKAhS5Wr8Hs&_nc_zt=23&_nc_ht=scontent.flim37-1.fna&_nc_gid=Inm4oftZ1smwDPkJSQH8Kw&_nc_ss=7b2a8&oh=00_Af7CBiFuCnaXgYa4QGTZSOVSgt2BuFoFitUyfvZRv3KzGA&oe=6A00C71B';

  storeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d426.276085731222!2d-78.996418!3d-8.072184!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad1675558555c1%3A0xfb5efa0732efbb78!2s1173%20113%2C%20Baltazar%20Villalonga%201775%2C%20El%20Porvenir%2013004!5e1!3m2!1ses-419!2spe!4v1777160015031!5m2!1ses-419!2spe'
  );

  departamentos: any[] = [];
  provincias:    any[] = [];
  distritos:     any[] = [];
  filteredProvincias: any[] = [];
  filteredDistritos:  any[] = [];

  get isLogged(): boolean {
    return !!this.authService.currentUser();
  }

  handleReservar(): void {
    if (!this.isLogged) {
      this.router.navigate(['/login']);
      return;
    }
    console.log('Proceder con la compra');
  }

  get subtotal(): number {
    return this.cartService.subtotal();
  }

  get shippingCost(): number {
    return this.subtotal * 0.05;
  }

  private isStep1Valid(): boolean {
    const e = this.email();
    return !!(e && this.nombres() && this.apellidos() && e.includes('@') && e.includes('.'));
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
    const p = this.checkoutService.getProfile();

    this.email.set(p.email);
    this.nombres.set(p.nombres);
    this.apellidos.set(p.apellidos);
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
    if (p.distrito) this.distrito.set(p.distrito);

    if (this.isStep1Valid()) {
      this.step1Completed.set(true);
      this.step2Enabled.set(true);
    }

    if (this.step1Completed() && this.isStep2Valid()) {
      this.step2Completed.set(true);
      this.step3Enabled.set(true);
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
    this.step3Enabled.set(false);
    this.step3Completed.set(false);
    this.paymentMethod.set(null);
  }

  goBackToStep2(): void {
    this.step2Completed.set(false);
    this.step3Enabled.set(false);
    this.step3Completed.set(false);
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
      this.step3Enabled.set(true);
    }
  }

  completeStep3(): void {
    if (this.paymentMethod()) {
      this.step3Completed.set(true);
    }
  }

  buscarEnMapa(): void {
    if (this.direccion() && this.departamento() && this.provincia() &&
        this.distrito() && this.numeroCasa()) {
      const dir = `${this.direccion()} ${this.numeroCasa()}, ${this.distrito()}, ${this.provincia()}, ${this.departamento()}, Perú`;
      const url = `https://maps.google.com/maps?q=${encodeURIComponent(dir)}&t=&z=17&ie=UTF8&iwloc=&output=embed`;
      this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
    }
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

  showCouponInput = signal(false);
  couponCode      = signal('');
  couponApplied   = signal(false);
  couponError     = signal('');
  discountAmount  = 0;
  appliedCoupon   = signal<Cupon | null>(null);

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

          this.discountAmount = cupon.tipo_descuento === 'F'
            ? Math.min(cupon.descuento, this.subtotal)
            : this.subtotal * (cupon.descuento / 100);

          this.couponApplied.set(true);
          this.showCouponInput.set(false);
          this.couponCode.set('');
          this.couponError.set('');
          this.appliedCoupon.set(cupon);
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
    this.discountAmount = 0;
    this.appliedCoupon.set(null);
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

  get total(): number { return this.discountedSubtotal + this.shippingCost; }

  get discountedSubtotal(): number {
    const value = this.couponApplied() ? this.subtotal - this.discountAmount : this.subtotal;
    return value < 0 ? 0 : value;
  }
}
