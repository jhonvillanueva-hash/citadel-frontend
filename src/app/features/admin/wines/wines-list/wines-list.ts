import { Component, inject, OnInit, signal } from '@angular/core';
import { VinoService } from '../../../../data/services/vino.service';
import { SaborService } from '../../../../data/services/sabor.service';
import { PresentacionService } from '../../../../data/services/presentacion.service';
import { Vino } from '../../../../data/models/api.models';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-wines-list',
  templateUrl: './wines-list.html',
})
export class WinesListComponent implements OnInit {
  wineService = inject(VinoService);
  saborService = inject(SaborService);
  presentacionService = inject(PresentacionService);
  toastService = inject(ToastService);

  dataWines = signal<Vino[] | null>(null);

  ngOnInit(): void {
    this.loadWines();
  }

  loadWines() {
    forkJoin({
      vinos: this.wineService.getAll(),
      sabores: this.saborService.getAll(),
      presentaciones: this.presentacionService.getAll(),
    }).subscribe({
      next: ({ vinos, sabores, presentaciones }) => {
        const winesWithRelations = vinos.map(vino => ({
          ...vino,
          sabor: sabores.find(s => s.id_sabor === vino.id_sabor),
          presentacion: presentaciones.find(p => p.id_presentacion === vino.id_presentacion),
        }));
        this.dataWines.set(winesWithRelations);
      },
      error: (err) => this.toastService.showError('Error cargando vinos', err),
    });
  }
}