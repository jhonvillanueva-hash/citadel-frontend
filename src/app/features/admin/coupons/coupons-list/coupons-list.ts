import { Component, inject, OnInit, signal } from '@angular/core';
import { CuponService } from '../../../../data/services/cupon.service';
import { Cupon } from '../../../../data/models/api.models';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faPlus, 
  faTrash, 
  faEdit, 
  faTicket, 
  faCalendarAlt, 
  faDollarSign, 
  faPercentage,
  faCircleCheck,
  faCircleXmark
} from '@fortawesome/free-solid-svg-icons';
import { RouterLink } from '@angular/router';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-admin-coupons-list',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, RouterLink],
  template: `
    <div class="space-y-6">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-2xl font-bold text-admin-brown tracking-tight">Gestión de Cupones</h2>
          <p class="text-admin-brown-light text-sm">Administre los códigos de descuento disponibles en la tienda.</p>
        </div>
        
        <a routerLink="create" 
          class="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-admin-pink to-admin-pink-dark text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all whitespace-nowrap">
          <fa-icon [icon]="icons.faPlus" />
          Nuevo Cupón
        </a>
      </div>

      @if (dataCoupons() === null) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-admin-pink-light">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-admin-pink"></div>
          <p class="mt-4 text-admin-brown-light font-medium">Cargando cupones...</p>
        </div>
      } @else if (dataCoupons()?.length === 0) {
        <div class="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-admin-pink-light">
          <fa-icon [icon]="icons.faTicket" class="text-5xl text-admin-pink-light mb-4" />
          <p class="text-admin-brown-light font-medium">No hay cupones disponibles</p>
          <a routerLink="create" class="mt-4 text-admin-pink font-semibold hover:underline">
            Crear el primer cupón
          </a>
        </div>
      } @else {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (coupon of dataCoupons(); track coupon.id_cupon) {
            <div class="bg-white rounded-2xl shadow-sm border border-admin-pink-light overflow-hidden hover:shadow-md transition-shadow group">
              <div class="bg-admin-pink-light bg-opacity-30 px-5 py-4 border-b border-admin-pink-light flex justify-between items-center">
                <div class="flex items-center gap-3">
                  <div class="bg-white p-2 rounded-lg shadow-sm text-admin-pink">
                    <fa-icon [icon]="icons.faTicket" />
                  </div>
                  <span class="font-bold text-admin-brown text-lg tracking-wider">{{ coupon.codigo }}</span>
                </div>
                <div [class]="coupon.activo ? 'text-green-500' : 'text-red-400'" 
                     [title]="coupon.activo ? 'Activo' : 'Inactivo'">
                  <fa-icon [icon]="coupon.activo ? icons.faCircleCheck : icons.faCircleXmark" class="text-xl" />
                </div>
              </div>

              <div class="p-5 space-y-4">
                <div class="flex justify-between items-end">
                  <div>
                    <p class="text-xs text-admin-brown-light uppercase font-bold tracking-wider mb-1">Descuento</p>
                    <div class="flex items-center gap-1">
                      <fa-icon [icon]="coupon.tipo_descuento === 'P' ? icons.faPercentage : icons.faDollarSign" 
                               class="text-admin-pink text-xl font-bold" />
                      <span class="text-3xl font-black text-admin-brown">
                        {{ coupon.descuento }}{{ coupon.tipo_descuento === 'P' ? '%' : '' }}
                      </span>
                    </div>
                  </div>
                  <div class="text-right">
                    <p class="text-xs text-admin-brown-light uppercase font-bold tracking-wider mb-1">Mínimo</p>
                    <p class="font-bold text-admin-brown">S/. {{ coupon.monto_minimo }}</p>
                  </div>
                </div>

                <div class="pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                  <div>
                    <p class="text-[10px] text-admin-brown-light uppercase font-bold tracking-wider mb-1">Válido desde</p>
                    <div class="flex items-center gap-2 text-sm text-admin-brown">
                      <fa-icon [icon]="icons.faCalendarAlt" class="text-admin-pink" />
                      {{ coupon.fecha_inicio | date:'dd/MM/yyyy' }}
                    </div>
                  </div>
                  <div>
                    <p class="text-[10px] text-admin-brown-light uppercase font-bold tracking-wider mb-1">Vence el</p>
                    <div class="flex items-center gap-2 text-sm text-admin-brown">
                      <fa-icon [icon]="icons.faCalendarAlt" class="text-admin-pink" />
                      {{ coupon.fecha_fin | date:'dd/MM/yyyy' }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="px-5 py-3 bg-gray-50 flex justify-end gap-2 border-t border-gray-100">
                <button (click)="onDelete(coupon.id_cupon)" 
                  class="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar">
                  <fa-icon [icon]="icons.faTrash" />
                </button>
                <a [routerLink]="['edit', coupon.id_cupon]" 
                  class="p-2 text-admin-brown-light hover:text-admin-pink hover:bg-admin-pink-light hover:bg-opacity-20 rounded-lg transition-colors"
                  title="Editar">
                  <fa-icon [icon]="icons.faEdit" />
                </a>
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
})
export class CouponsListComponent implements OnInit {
  couponService = inject(CuponService);
  toastService = inject(ToastService);
  confirmService = inject(ConfirmDialogService);

  dataCoupons = signal<Cupon[] | null>(null);

  icons = {
    faPlus,
    faTrash,
    faEdit,
    faTicket,
    faCalendarAlt,
    faDollarSign,
    faPercentage,
    faCircleCheck,
    faCircleXmark
  };

  ngOnInit() {
    this.loadCoupons();
  }

  loadCoupons() {
    this.couponService.getAll().subscribe({
      next: data => this.dataCoupons.set(data),
      error: err => this.toastService.showError('Error cargando cupones', err)
    });
  }

  async onDelete(id: number) {
    
    if (await this.confirmService.confirm('¿Está seguro de que desea eliminar este cupón?')) {
      this.couponService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Cupón eliminado correctamente');
          this.loadCoupons();
        },
        error: err => this.toastService.showError('Error al eliminar el cupón', err)
      });
    }
  }
}