import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CartService } from '../../../../../core/services/cart.service';
import { RouterLink } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-checkout-store',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './checkout-store.html',
})
export class CheckoutStore implements OnInit {
  cartService  = inject(CartService);
  private sanitizer = inject(DomSanitizer);
  private http      = inject(HttpClient);
  private router    = inject(Router);

  cartItems = this.cartService.cartItems;

  email      = signal('');
  nombres    = signal('');
  apellidos  = signal('');
  deliveryType = signal('home');

  direccion    = signal('');
  departamento = signal('');
  provincia    = signal('');
  distrito     = signal('');
  numeroCasa   = signal('');
  codigoPostal = signal('');

  pickupAddress = signal('Baltazar Villalonga 1775, El Porvenir, Trujillo, La Libertad, Peru');
  pickupDetails = signal('Tienda Principal - Horario: Lunes a Sábado 10am-8pm');

  paymentMethod  = signal<string | null>(null);
  yapeAvailable  = signal(true);

  step1Completed = signal(false);
  step2Completed = signal(false);
  step3Completed = signal(false);
  step1Enabled   = signal(true);
  step2Enabled   = signal(false);
  step3Enabled   = signal(false);

  mapUrl = signal<SafeResourceUrl | null>(null);

  yapeIcon         = 'https://upload.wikimedia.org/wikipedia/commons/0/08/Icono_de_la_aplicaci%C3%B3n_Yape.png';
  pagoEfectivoIcon = 'https://scontent.flim37-1.fna.fbcdn.net/v/t39.30808-6/462601235_953445320144713_2500571434057430817_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeHvs0dIDXuXZkY6PmB-srj6zgzzahEeqMbODPNqER6oxsKYPKXc7_dhGk-r0XFFra9Y78se3Gkr7x_qNEZLL7Jk&_nc_ohc=It5DSprk1Q4Q7kNvwFakjLE&_nc_oc=Adr_Ht_c0BW9ZDIRWiq2UBR5QDePAh4pDFEOSqwlMwH_HoDPEu6_mfQBU4pkn8MW-lrcsA7zEZ3Ur_nhPUc9EMe7&_nc_zt=23&_nc_ht=scontent.flim37-1.fna&_nc_gid=8oVI87fy3BBDiR3ze434dg&_nc_ss=7b2a8&oh=00_Af1mYEKcMnLNYgoIGFKqeMAxUdmPJMcnnHMc5oEYCNRhQg&oe=69F3279B';

  storeMapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(
    'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d426.276085731222!2d-78.996418!3d-8.072184!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x91ad1675558555c1%3A0xfb5efa0732efbb78!2s1173%20113%2C%20Baltazar%20Villalonga%201775%2C%20El%20Porvenir%2013004!5e1!3m2!1ses-419!2spe!4v1777160015031!5m2!1ses-419!2spe'
  );

  departamentos: any[] = [];
  provincias:    any[] = [];
  distritos:     any[] = [];
  filteredProvincias: any[] = [];
  filteredDistritos:  any[] = [];

  get subtotal(): number {
    return this.cartService.subtotal();
  }

  get shippingCost(): number {
    return this.subtotal * 0.05;
  }

  get total(): number {
    return this.subtotal + this.shippingCost;
  }

  ngOnInit(): void {
    this.http.get<any>('assets/1_ubigeo_departamentos.json')
      .subscribe(res => this.departamentos = res.ubigeo_departamentos);

    this.http.get<any>('assets/2_ubigeo_provincias.json')
      .subscribe(res => this.provincias = res.ubigeo_provincias);

    this.http.get<any>('assets/3_ubigeo_distritos.json')
      .subscribe(res => this.distritos = res.ubigeo_distritos);
  }

  onDepartamentoChange(): void {
    this.provincia.set('');
    this.distrito.set('');
    this.filteredDistritos = [];
    this.filteredProvincias = this.provincias.filter(p =>
      p.departamento_id == Number(this.departamento())
    );
  }

  onProvinciaChange(): void {
    this.distrito.set('');
    this.filteredDistritos = this.distritos.filter(d =>
      d.provincia_id == Number(this.provincia())
    );
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
    if (this.email() && this.nombres() && this.apellidos() &&
        this.email().includes('@') && this.email().includes('.')) {
      this.step1Completed.set(true);
      this.step2Enabled.set(true);
    }
  }

  completeStep2(): void {
    if (this.deliveryType() === 'home') {
      if (this.direccion() && this.departamento() && this.provincia() &&
          this.distrito() && this.numeroCasa()) {
        this.step2Completed.set(true);
        this.step3Enabled.set(true);
      }
    } else {
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
}
