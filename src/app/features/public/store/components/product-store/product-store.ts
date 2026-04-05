import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VinoService } from '../../../../../data/services/vino.service';
import { SaborService } from '../../../../../data/services/sabor.service';
import { PresentacionService } from '../../../../../data/services/presentacion.service';
import { PrecioService } from '../../../../../data/services/precio.service';

import { Precio, Vino } from '../../../../../data/models/api.models';
import { forkJoin } from 'rxjs';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faEye } from '@fortawesome/free-solid-svg-icons';

export interface InternalProduct {
  id: number;
  flavor: string;
  category: string;
  name: string;
  description: string;
  volumen: string;
  state: string;
  image: string;
  iconoFlavor?: string;
  iconoCategory?: string;
  prices?: Precio[];
}

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FontAwesomeModule],
  templateUrl: './product-store.html',
})

export class ProductStore implements OnInit {

  icons = {
    faEye,
    faCartShopping
  }

  private vinoService = inject(VinoService);
  private saborService = inject(SaborService);
  private presentacionService = inject(PresentacionService);
  private precioService = inject(PrecioService);

  products: InternalProduct[] = [];

  private flavorMap = new Map<number, string>();
  private categoryMap = new Map<number, string>();

  ngOnInit(): void {
    this.loadCatalogs();
  }

  private loadCatalogs(): void {
    this.saborService.getAll().subscribe(sabores => {
      sabores.forEach(s => this.flavorMap.set(s.id_sabor, s.nombre));

      this.presentacionService.getAll().subscribe(presentaciones => {
        presentaciones.forEach(p =>
          this.categoryMap.set(p.id_presentacion, '')
        );

        this.loadVinosYPrecios();
      });
    });
  }

  private loadVinosYPrecios(): void {
    forkJoin({
      vinos: this.vinoService.getAll(),
      precios: this.precioService.getAll()
    }).subscribe(({ vinos, precios }) => {
      this.products = this.mapProducts(vinos, precios);
    });
  }

private mapProducts(vinos: Vino[], precios: Precio[]): InternalProduct[] {
    return vinos.map(vino => {

      const flavorName = this.flavorMap.get(vino.id_sabor) ?? 'Desconocido';
      const categoryName = this.categoryMap.get(vino.id_presentacion) ?? 'Desconocido';

      const preciosDelVino = precios.filter(p => p.id_vino === vino.id_vino);

      return {
        id: vino.id_vino,
        flavor: flavorName,
        category: categoryName,
        name: vino.nombre,
        description: vino.descripcion,
        volumen: `ml`,
        state: vino.estado === 'D' ? 'Disponible' : 'No disponible',
        image: vino.url_img_principal,
        prices: preciosDelVino,

        iconoCategory: this.getCategoryIcon(categoryName),
        iconoFlavor: this.getFlavorIcon(flavorName),
      };
    });
  }

  private getCategoryIcon(category: string): string {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('dulce')) return '/img/store/icons/droplet-fill.svg';
    if (lowerCat.includes('seco')) return '/img/store/icons/droplet.svg';
    if (lowerCat.includes('semiseco')) return '/img/store/icons/droplet-half.svg';
    return '';
  }

  private getFlavorIcon(flavor: string): string {
    const lowerFlavor = flavor.toLowerCase();
    if (lowerFlavor.includes('frambuesas')) return '/img/store/icons/baya.svg';
    if (lowerFlavor.includes('zarzamoras')) return '/img/store/icons/mora-de-los-pantanos.svg';
    if (lowerFlavor.includes('arandanos')) return '/img/store/icons/arandanos.svg';
    return '';
  }

  getMainPrice(prices: Precio[] | undefined): Precio | null {
    if (!prices || prices.length === 0) {
      return null;
    }

    const unitPrice = prices.find(p => p.cantidad_minima === 1);
    return unitPrice || prices[0];
  }

  trackById(index: number, item: InternalProduct) {
    return item.id;
  }
}
