import { Component, inject, Signal, signal } from '@angular/core';
import { VinoService } from '../../../../data/services/vino.service';
import { Vino } from '../../../../data/models/api.models';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, Subject, switchMap, startWith } from 'rxjs';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';

@Component({
  selector: 'app-admin-wines-list',
  templateUrl: './wines-list.html',
  imports: [FontAwesomeModule, RouterLink]
})
export class WinesListComponent {
  wineService = inject(VinoService);
  toastService = inject(ToastService);
  confirmDialogService = inject(ConfirmDialogService);

  private refresh$ = new Subject<void>();
  dataWines: Signal<Vino[] | null>;
  error = signal<string | null>(null);

  constructor() {
    this.dataWines = toSignal(
      this.refresh$.pipe(
        startWith(void 0),
        switchMap(() => this.wineService.getAll().pipe(
          catchError(err => {
            this.toastService.showError('Error cargando vinos', err);
            return of(null);
          })
        ))
      ),
      { initialValue: null }
    );
  }

  async deleteWine(id: number) {
    const ok = await this.confirmDialogService.confirm('¿Está seguro de eliminar este vino?');
    if (ok) {
      this.wineService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Vino eliminado');
          this.refresh$.next();
        },
        error: (err) => this.toastService.showError('Error al eliminar vino', err)
      });
    }
  }

  groupedBySabor() {
    const wines = this.dataWines();
    if (!wines) return {};
    return wines.reduce((acc: Record<string, Vino[]>, wine) => {
      const sabor = wine.Sabor?.nombre || 'Sin sabor';
      if (!acc[sabor]) {
        acc[sabor] = [];
      }
      acc[sabor].push(wine);
      return acc;
    }, {});
  }

  groupedEntries() {
    return Object.entries(this.groupedBySabor());
  }

  icons = {
    faPen,
    faTrash
  }
}