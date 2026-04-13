import { Injectable, inject, signal } from '@angular/core';
import { forkJoin, tap, finalize } from 'rxjs';
import { Sabor, Dulzor, Presentacion } from '../../../../../data/models/api.models';
import { SaborService } from '../../../../../data/services/sabor.service';
import { DulzorService } from '../../../../../data/services/dulzor.service';
import { PresentacionService } from '../../../../../data/services/presentacion.service';

@Injectable({ providedIn: 'root' })
export class CatalogFacade {
  private flavorService = inject(SaborService);
  private sweetService = inject(DulzorService);
  private presentationService = inject(PresentacionService);

  flavors = signal<Sabor[]>([]);
  sweets = signal<Dulzor[]>([]);
  presentations = signal<Presentacion[]>([]);
  isLoading = signal(false);

  loadAll() {
    this.isLoading.set(true);
    forkJoin({
      flavors: this.flavorService.getAll(),
      sweets: this.sweetService.getAll(),
      presentations: this.presentationService.getAll(),
    }).pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.flavors.set(data.flavors);
          this.sweets.set(data.sweets);
          this.presentations.set(data.presentations);
        }
      });
  }

  addFlavor(nombre: string) {
    return this.flavorService.create({ nombre }).pipe(
      tap(newFlavor => this.flavors.update(list => [...list, newFlavor]))
    );
  }

  addSweet(nombre: string) {
    return this.sweetService.create({ nombre }).pipe(
      tap(newSweet => this.sweets.update(list => [...list, newSweet]))
    );
  }

  addPresentation(data: Partial<Presentacion>) {
    return this.presentationService.create(data as any).pipe(
      tap(newPres => this.presentations.update(list => [...list, newPres]))
    );
  }
}
