import { Component, inject, Signal, signal } from '@angular/core';
import { VinoService } from '../../../../data/services/vino.service';
import { Vino } from '../../../../data/models/api.models';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-admin-wines-list',
  templateUrl: './wines-list.html',
  imports: [FontAwesomeModule, RouterLink]
})
export class WinesListComponent {
  wineService = inject(VinoService);
  toastService = inject(ToastService);

  dataWines: Signal<Vino[] | null>;
  loading = signal(true);
  error = signal<string | null>(null);

  constructor() {
    this.dataWines = toSignal(
      this.wineService.getAll().pipe(
        catchError(err => {
          this.toastService.showError('Error cargando vinos', err);
          return of(null);
        })
      ),
      { initialValue: null }
    );
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