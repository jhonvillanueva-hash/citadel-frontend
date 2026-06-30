import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faFilter, 
  faSearch, 
  faEraser, 
  faChevronLeft, 
  faChevronRight,
  faEye,
  faTruck,
  faStore,
  faUser,
  faCalendar,
  faMoneyBillWave
} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { CarritoService } from '../../../data/services/cart.service';
import { CarritoProductoService } from '../../../data/services/carrito-producto.service';
import { UsuarioService } from '../../../data/services/usuario.service';
import { CuponService } from '../../../data/services/cupon.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { forkJoin, take, map, tap } from 'rxjs';

interface Sale {
  id: number;
  id_usuario: number;
  customerName: string;
  customerEmail: string;
  date: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discount: number;
  status: 'E' | 'R' | 'P' | 'S' | 'C' | 'A';
  type: 'D' | 'T';
  itemsCount: number;
}

@Component({
  selector: 'app-admin-sales',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, FormsModule, RouterLink],
  templateUrl: './sales.html',
})
export class SalesListComponent implements OnInit {
  private readonly cartService = inject(CarritoService);
  private readonly cartProductService = inject(CarritoProductoService);
  private readonly userService = inject(UsuarioService);
  private readonly couponService = inject(CuponService);
  private readonly toastService = inject(ToastService);

  // Data signals
  allSales = signal<Sale[]>([]);
  isLoading = signal(false);

  // Pagination signals
  currentPage = signal(1);
  pageSize = signal(10);
  
  // Filter signals
  filterField = signal<string>('all');
  filterText = signal<string>('');
  appliedFilterField = signal<string>('all');
  appliedFilterText = signal<string>('');

  // Icons
  icons = {
    faFilter,
    faSearch,
    faEraser,
    faChevronLeft,
    faChevronRight,
    faEye,
    faTruck,
    faStore,
    faUser,
    faCalendar,
    faMoneyBillWave
  };

  // Computed: Filtered sales
  filteredSales = computed(() => {
    let sales = this.allSales();
    const field = this.appliedFilterField();
    const text = this.appliedFilterText().toLowerCase().trim();

    if (text) {
      sales = sales.filter(s => {
        if (field === 'all') {
          return (
            s.id.toString().includes(text) ||
            s.customerName.toLowerCase().includes(text) ||
            s.customerEmail.toLowerCase().includes(text) ||
            s.date.toLowerCase().includes(text)
          );
        }
        
        const value = (s as any)[field]?.toString().toLowerCase() || '';
        return value.includes(text);
      });
    }

    return sales;
  });

  // Computed: Paginated sales
  paginatedSales = computed(() => {
    const start = (this.currentPage() - 1) * this.pageSize();
    const end = start + this.pageSize();
    return this.filteredSales().slice(start, end);
  });

  // Computed: Total pages
  totalPages = computed(() => {
    return Math.ceil(this.filteredSales().length / this.pageSize()) || 1;
  });

  ngOnInit(): void {
    this.loadSales();
  }

  loadSales() {
    this.isLoading.set(true);
    
    forkJoin({
      carritos: this.cartService.getAll().pipe(take(1)),
      usuarios: this.userService.getAll().pipe(take(1)),
      cupones: this.couponService.getAll().pipe(take(1))
    }).subscribe({
      next: ({ carritos, usuarios, cupones }) => {
        const vendidos = carritos.filter(c => c.estado !== 'E');
        if (vendidos.length === 0) {
          this.allSales.set([]);
          this.isLoading.set(false);
          return;
        }

        const saleObservables = vendidos.map(carrito => {
          const user = usuarios.find(u => u.id_usuario === carrito.direccion.id_usuario);
          
          return this.cartProductService.findByField('id_carrito', carrito.id_carrito).pipe(
            map((productos: any) => {
              const prodArray = Array.isArray(productos) ? productos : [productos];
              const subtotal = prodArray.reduce((sum: number, p: any) => sum + (p.cantidad * p.precio_venta), 0);
              const shippingFee = carrito.tipo === 'D' ? 20 : 0;
              let discount = 0;
              let couponCode = '';

              if (carrito.id_cupon) {
                const cupon = cupones.find(cp => cp.id_cupon === carrito.id_cupon);
                if (cupon && subtotal >= cupon.monto_minimo) {
                  if (cupon.tipo_descuento === 'F') {
                    discount = cupon.descuento;
                  } else if (cupon.tipo_descuento === 'P') {
                    discount = subtotal * (cupon.descuento / 100);
                  }
                  couponCode = cupon.codigo.toString();
                }
              }

              const total = Math.max(0, subtotal + shippingFee - discount);

              return {
                id: carrito.id_carrito,
                id_usuario: carrito.direccion.id_usuario,
                customerName: user ? `${user.nombres} ${user.apellidos}` : 'Usuario desconocido',
                customerEmail: user?.email || 'N/A',
                date: new Date(carrito.fecha_compra).toLocaleDateString(),
                total,
                subtotal,
                shippingFee,
                discount,
                status: carrito.estado,
                type: carrito.tipo,
                itemsCount: prodArray.length
              } as Sale;
            })
          );
        });

        forkJoin(saleObservables).subscribe({
          next: (sales) => {
            sales.sort((a, b) => b.id - a.id);
            this.allSales.set(sales);
            this.isLoading.set(false);
          },
          error: (err) => {
            this.toastService.showError('Error procesando ventas', err);
            this.isLoading.set(false);
          }
        });
      },
      error: (err) => {
        this.toastService.showError('Error cargando datos de ventas', err);
        this.isLoading.set(false);
      }
    });
  }

  applyFilter() {
    this.appliedFilterField.set(this.filterField());
    this.appliedFilterText.set(this.filterText());
    this.currentPage.set(1);
  }

  clearFilter() {
    this.filterField.set('all');
    this.filterText.set('');
    this.appliedFilterField.set('all');
    this.appliedFilterText.set('');
    this.currentPage.set(1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
    }
  }

  goToPage(page: number) {
    this.currentPage.set(page);
  }

  getPagesArray() {
    const total = this.totalPages();
    const current = this.currentPage();
    const pages: number[] = [];
    
    for (let i = 1; i <= total; i++) {
      if (
        i === 1 || 
        i === total || 
        (i >= current - 1 && i <= current + 1)
      ) {
        pages.push(i);
      } else if (pages.length > 0 && pages[pages.length - 1] !== -1) {
        pages.push(-1);
      }
    }
    return pages;
  }

  getStatusText(status: string): string {
    const texts: Record<string, string> = {
      E: 'En espera',
      P: 'Pagado',
      R: 'Revisado',
      A: 'Alistado',
      S: 'Enviado o listo para recoger',
      C: 'Completado',
    };
    return texts[status] || status;
  }
}