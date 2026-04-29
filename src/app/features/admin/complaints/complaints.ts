import { Component, inject, signal, OnInit } from '@angular/core';
import { ReclamoService } from '../../../data/services/reclamo.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Reclamo } from '../../../data/models/api.models';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-complaints',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="p-4">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (complaint of dataComplaints(); track complaint.id_reclamo) {
          <div class="bg-white shadow-md rounded-2xl p-4 border border-gray-200">

            <div class="flex justify-between items-start mb-3">
              <h2 class="text-lg font-semibold text-gray-800">
                {{ complaint.nombres }} {{ complaint.apellidos }}
              </h2>
            </div>

            <div class="flex rounded-xl bg-gray-100 p-1 mb-3 text-xs font-medium select-none">
              
              @for (state of estados; track state.value) {
                <button
                  (click)="updateEstado(complaint, state.value)"
                  [disabled]="isUpdating()[complaint.id_reclamo]"
                  class="flex-1 px-2 py-1.5 rounded-lg transition-all duration-200 text-center"
                  [ngClass]="getEstadoClasses(complaint.estado, state.value, complaint.id_reclamo)"
                >
                  {{ state.label }}
                </button>
              }

            </div>

            <p class="text-sm text-gray-600 mb-1">
              <strong>DNI:</strong> {{ complaint.dni }}
            </p>

            <p class="text-sm text-gray-600 mb-1">
              <strong>Email:</strong> {{ complaint.email }}
            </p>

            <p class="text-sm text-gray-600 mb-1">
              <strong>Teléfono:</strong> {{ complaint.telefono }}
            </p>

            <p class="text-sm text-gray-600 mb-2">
              <strong>Tipo:</strong> {{ complaint.tipo === 'R' ? 'Reclamo' : 'Queja' }}
            </p>

            <p class="text-sm text-gray-700 font-medium mb-1">
              {{ complaint.motivo }}
            </p>

            <p class="text-sm text-gray-500 mb-3">
              {{ complaint.detalles }}
            </p>

            <div class="flex justify-between items-center">
              <span class="text-xs text-gray-400">
                {{ complaint.fecha_creacion | date:'short' }}
              </span>

              @if (complaint.id_pedido) {
                <a
                  [routerLink]="'#'"
                  class="text-sm text-blue-600 hover:underline">
                  Ver pedido
                </a>
              }
            </div>

          </div>
        }
      </div>

      @if (!dataComplaints()) {
        <p class="text-center text-gray-500 mt-6">
          Cargando reclamos...
        </p>
      }
    </div>
  `
})
export class ComplaintsComponent implements OnInit {
  private complaintService = inject(ReclamoService);
  private toastService = inject(ToastService);

  dataComplaints = signal<Reclamo[] | null>(null);

  estados = [
    { value: 'N' as const, label: 'Nuevo' },
    { value: 'R' as const, label: 'En revisión' },
    { value: 'S' as const, label: 'Solucionado' }
  ];

  isUpdating = signal<Record<number, boolean>>({});

  ngOnInit() {
    this.loadComplaints();
  }

  loadComplaints() {
    this.complaintService.getAll().subscribe({
      next: data => this.dataComplaints.set(data),
      error: err => this.toastService.showError('Error cargando reclamos', err)
    });
  }

  updateEstado(complaint: Reclamo, estado: Reclamo['estado']) {
    if (complaint.estado === estado) return;

    this.isUpdating.update(map => ({
      ...map,
      [complaint.id_reclamo]: true
    }));

    const previousEstado = complaint.estado;

    this.complaintService.patch(complaint.id_reclamo, { estado }).subscribe({
      next: () => {
        const current = this.dataComplaints();
        if (!current) return;

        this.dataComplaints.set(
          current.map(c =>
            c.id_reclamo === complaint.id_reclamo
              ? { ...c, estado }
              : c
          )
        );

        this.toastService.showSuccess('Estado actualizado');
      },
      error: err => {
        this.toastService.showError('Error actualizando estado', err);

        const current = this.dataComplaints();
        if (current) {
          this.dataComplaints.set(
            current.map(c =>
              c.id_reclamo === complaint.id_reclamo
                ? { ...c, estado: previousEstado }
                : c
            )
          );
        }
      },
      complete: () => {
        this.isUpdating.update(map => ({
          ...map,
          [complaint.id_reclamo]: false
        }));
      }
    });
  }

  getEstadoClasses(current: Reclamo['estado'], value: Reclamo['estado'], id: number) {
    const updating = this.isUpdating()[id];

    if (current === value) {
      return {
        'bg-yellow-100 text-yellow-700': value === 'N',
        'bg-blue-100 text-blue-700': value === 'R',
        'bg-green-100 text-green-700': value === 'S',

        'shadow': true,
        'cursor-default': true
      };
    }

    return {
      'text-gray-500 hover:bg-white hover:shadow cursor-pointer': !updating,
      'opacity-50 cursor-not-allowed': updating
    };
  }
}