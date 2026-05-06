import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { ProductStore } from '../../components/product-store/product-store';

@Component({
  selector: 'app-sweet-store',
  standalone: true,
  imports: [ProductStore],
  template: `
    <app-product
      [filterType]="'dulzor'"
      [filterDulzorId]="filterDulzorId()"
      [customTitle]="title()"
    ></app-product>
  `,
})
export class SweetStore {

  private route = inject(ActivatedRoute);

  private params = toSignal(this.route.paramMap);

  filterDulzorId = computed(() => {
    const id = this.params()?.get('id');
    return id ? Number(id) : undefined;
  });

  name = computed(() => this.params()?.get('name'));

  title = computed(() => {
    const name = this.name();
    if (!name) return 'Vinos por Dulzor';
    return `Vinos ${name.charAt(0).toUpperCase() + name.slice(1)}`;
  });
}
