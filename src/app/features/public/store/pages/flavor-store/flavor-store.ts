import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ProductStore } from '../../components/product-store/product-store';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-flavor-store',
  standalone: true,
  imports: [CommonModule, ProductStore],
  template: `
    <app-product
      [filterType]="filterType()"
      [filterSaborId]="filterSaborId()"
      [filterSaborNombre]="filterSaborNombre()"
      [customTitle]="pageTitle()">
    </app-product>
  `
})
export class FlavorStore {

  private route = inject(ActivatedRoute);

  private params = toSignal(this.route.paramMap);

  filterType = computed(() => {
    const name = this.params()?.get('name');

    if (!name || name === 'todos') return 'todos';
    if (name === 'mixtos') return 'mixtos';
    if (name === 'promociones') return 'promociones';

    return 'sabor';
  });

  filterSaborId = computed(() => {
    const id = this.params()?.get('id');
    return id ? Number(id) : undefined;
  });

  filterSaborNombre = computed(() => undefined);

  pageTitle = computed(() => {
    const name = this.params()?.get('name');

    if (!name || name === 'todos') return 'Todos los Vinos';
    if (name === 'mixtos') return 'Vinos Mixtos';
    if (name === 'promociones') return 'Vinos en Promoción';

    return `Vinos de ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  });
}
