import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faArrowLeft, 
  faBox, 
  faTruck, 
  faStore, 
  faUser, 
  faEnvelope, 
  faPhone, 
  faMapMarkerAlt,
  faReceipt,
  faTag,
  faCheckCircle,
  faArrowUpRightFromSquare
} from '@fortawesome/free-solid-svg-icons';
import { CarritoService } from '../../../data/services/cart.service';
import { CarritoProductoService } from '../../../data/services/carrito-producto.service';
import { UsuarioService } from '../../../data/services/usuario.service';
import { CuponService } from '../../../data/services/cupon.service';
import { VinoService } from '../../../data/services/vino.service';
import { PrecioService } from '../../../data/services/precio.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { forkJoin, finalize, take, map, switchMap } from 'rxjs';
import { Usuario, Carrito, Cupon, Vino, Precio } from '../../../data/models/api.models';

interface DetailProduct {
  id: number;
  name: string;
  quantity: number;
  price: number;
  imageUrl: string;
}

@Component({
  selector: 'app-admin-sales-detail',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  templateUrl: './sales-detail.html',
})
export class SalesDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly cartService = inject(CarritoService);
  private readonly cartProductService = inject(CarritoProductoService);
  private readonly userService = inject(UsuarioService);
  private readonly couponService = inject(CuponService);
  private readonly vinoService = inject(VinoService);
  private readonly precioService = inject(PrecioService);
  private readonly toastService = inject(ToastService);

  saleId = signal<number | null>(null);
  carrito = signal<Carrito | null>(null);
  usuario = signal<Usuario | null>(null);
  products = signal<DetailProduct[]>([]);
  cupon = signal<Cupon | null>(null);
  isLoading = signal(true);

  // Summary values
  subtotal = signal(0);
  shippingFee = signal(0);
  discount = signal(0);
  total = signal(0);

  icons = {
    faArrowLeft,
    faBox,
    faTruck,
    faStore,
    faUser,
    faEnvelope,
    faPhone,
    faMapMarkerAlt,
    faReceipt,
    faTag,
    faCheckCircle,
    faArrowUpRightFromSquare,
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.saleId.set(Number(id));
      this.loadDetail();
    }
  }

  loadDetail() {
    this.isLoading.set(true);
    const id = this.saleId();
    if (!id) return;

    this.cartService.getById(id).pipe(
      switchMap(carrito => {
        this.carrito.set(carrito);
        return forkJoin({
          usuario: this.userService.getById(carrito.id_usuario).pipe(take(1)),
          productos: this.cartProductService.findByField('id_carrito', id).pipe(map((p: any) => Array.isArray(p) ? p : [p]), take(1)),
          cupon: carrito.id_cupon ? this.couponService.getById(carrito.id_cupon).pipe(take(1)) : of(null),
          vinos: this.vinoService.getAll().pipe(take(1)),
          precios: this.precioService.getAll().pipe(take(1))
        }).pipe(
          map(data => ({ ...data, carrito }))
        );
      }),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (data) => {
        this.usuario.set(data.usuario);
        this.cupon.set(data.cupon);
        
        const detailProducts: DetailProduct[] = data.productos.map(p => {
          const precio = data.precios.find(pr => pr.id_precio === p.id_precio);
          const vino = data.vinos.find(v => v.id_vino === precio?.id_vino);
          return {
            id: vino?.id_vino!,
            name: vino?.nombre || 'Producto desconocido',
            quantity: p.cantidad,
            price: p.precio_venta,
            imageUrl: vino?.url_img_principal || ''
          };
        });
        this.products.set(detailProducts);

        const sub = detailProducts.reduce((sum, p) => sum + (p.quantity * p.price), 0);
        this.subtotal.set(sub);
        
        const ship = data.carrito.tipo === 'D' ? 20 : 0;
        this.shippingFee.set(ship);

        let disc = 0;
        if (data.cupon && sub >= data.cupon.monto_minimo) {
          if (data.cupon.tipo_descuento === 'F') {
            disc = Number(data.cupon.descuento);
          } else if (data.cupon.tipo_descuento === 'P') {
            disc = Number(sub * (data.cupon.descuento / 100));
          }
        }
        
        this.discount.set(disc);
        

        this.total.set(Math.max(0, sub + ship - disc));
      },
      error: (err) => {
        this.toastService.showError('Error cargando detalle de venta', err);
      }
    });
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      E: 'En espera',
      R: 'Revisado',
      P: 'Preparado',
      S: 'Enviado o listo para recoger',
      C: 'Completado',
    };
    return texts[status] || status;
  }

  updateStatus(event: any) {
    const newStatus = event.target.value as any;
    const id = this.saleId();
    if (!id) return;

    this.cartService.patch(id, { estado: newStatus }).subscribe({
      next: (updated) => {
        this.carrito.set(updated);
        this.toastService.showSuccess('Estado actualizado correctamente');
      },
      error: (err) => {
        this.toastService.showError('Error al actualizar el estado', err);
      }
    });
  }
}

import { of } from 'rxjs';
