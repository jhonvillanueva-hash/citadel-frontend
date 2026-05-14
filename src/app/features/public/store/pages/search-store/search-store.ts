import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { VinoService } from '../../../../../data/services/vino.service';
import { PrecioService } from '../../../../../data/services/precio.service';
import { Vino, Precio } from '../../../../../data/models/api.models';
import { InternalProduct, ProductStore } from '../../components/product-store/product-store';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-search-store',
  standalone: true,
  imports: [CommonModule, ProductStore, RouterLink],
  templateUrl: './search-store.html'
})
export class SearchStore implements OnInit {

  private route = inject(ActivatedRoute);
  private vinoService = inject(VinoService);
  private precioService = inject(PrecioService);
  hasResults = computed(() => this.results().length > 0);

  vinos = signal<Vino[]>([]);
  precios = signal<Precio[]>([]);
  searchTerm = signal('');

  ngOnInit() {
    this.vinoService.getAll().subscribe(v => this.vinos.set(v));
    this.precioService.getAll().subscribe(p => this.precios.set(p));

    this.route.queryParams.subscribe(params => {
      this.searchTerm.set((params['q'] || '').toLowerCase().trim());
    });
  }

  private normalize(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  private filtered = computed(() => {
    const term = this.normalize(this.searchTerm());
    if (!term) return this.vinos();

    return this.vinos().filter(v =>
      [v.nombre, v.descripcion, v.Sabor?.nombre, v.Dulzor?.nombre]
        .some(field => this.normalize(field || '').includes(term))
    );
  });

  private mapProducts(vinos: Vino[]): InternalProduct[] {
    const preciosAll = this.precios();

    return vinos.map(vino => {
      const volumenMl = vino.Presentacion?.volumen_ml ?? 0;
      const rawFlavor = vino.Sabor?.nombre ?? 'Desconocido';
      const rawCategory = vino.Dulzor?.nombre ?? 'Desconocido';

      const capitalize = (s: string) =>
        s.toLowerCase().replace(/^\w/, c => c.toUpperCase());

      const preciosDelVino = preciosAll.filter(p => p.id_vino === vino.id_vino);

      return {
        id: vino.id_vino,
        flavor: capitalize(rawFlavor),
        flavorId: vino.id_sabor,
        category: capitalize(rawCategory),
        categoryId: vino.id_dulzor,
        name: vino.nombre,
        description: vino.descripcion,
        volumen: `${volumenMl} ml`,
        volumen_ml: volumenMl,
        botellas_por_caja: vino.Presentacion?.botellas_por_caja ?? 12,
        stock: vino.stock,
        estado: vino.estado,
        image: vino.url_img_principal,
        prices: preciosDelVino,
        iconoCategory: this.getCategoryIcon(rawCategory),
        iconoFlavor: this.getFlavorIcon(rawFlavor),
      };
    });
  }

  results = computed(() => this.mapProducts(this.filtered()));

  private getCategoryIcon(category: string): string {
    const c = category.toLowerCase();
    if (c.includes('dulce')) return '/img/store/icons/droplet-fill.svg';
    if (c.includes('semiseco')) return '/img/store/icons/droplet-half.svg';
    return '/img/store/icons/droplet.svg';
  }

  private getFlavorIcon(flavor: string): string {
    const f = flavor.toLowerCase();
    if (f.includes('frambuesa')) return '/img/store/icons/baya.svg';
    if (f.includes('zarzamora')) return '/img/store/icons/mora-de-los-pantanos.svg';
    if (f.includes('arandano')) return '/img/store/icons/arandanos.svg';
    return '/img/store/icons/baya.svg';
  }
}
