import { Component, OnInit, inject, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { VinoService } from '../../../../../data/services/vino.service';
import { PrecioService } from '../../../../../data/services/precio.service';

import { Precio, Vino } from '../../../../../data/models/api.models';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCartShopping, faEye } from '@fortawesome/free-solid-svg-icons';

import { signal, computed } from '@angular/core';
import { input } from '@angular/core';

import { CartItem, CartService } from '../../../../../core/services/cart.service';

export interface InternalProduct {
  id: number;
  flavor: string;
  flavorId: number;
  category: string;
  categoryId: number;
  name: string;
  description: string;
  volumen: string;
  volumen_ml: number;
  botellas_por_caja: number;
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

  filterType = input<'todos' | 'mixtos' | 'promociones' | 'sabor' | 'dulzor'>('todos');
  filterSaborId = input<number | undefined>();
  filterDulzorId = input<number | undefined>();
  @Input() filterSaborNombre?: string;
  @Input() customTitle?: string;

  private cartService = inject(CartService);

  icons = {
    faEye,
    faCartShopping
  }

  private vinoService = inject(VinoService);
  private precioService = inject(PrecioService);

  allProducts = signal<InternalProduct[]>([]);

  filteredProducts = computed(() => {
    const products = this.allProducts();
    const type = this.filterType();
    const saborId = this.filterSaborId();
    const dulzorId = this.filterDulzorId();

    console.log('COMPUTED RUN', { products, type, saborId });

    if (!products.length) return [];

    let result = products.filter(p => p.state === 'Disponible');

    if (type === 'sabor' && saborId !== undefined) {
      result = result.filter(p => p.flavorId === saborId);
    }

    if (type === 'dulzor' && dulzorId !== undefined) {
      result = result.filter(p => p.categoryId === dulzorId);
    }

    return result;
  });

  ngOnInit(): void {
    this.loadVinosYPrecios();
  }

  private loadVinosYPrecios(): void {
    this.vinoService.getAll().subscribe({
      next: (vinos: Vino[]) => {
        this.precioService.getAll().subscribe({
          next: (precios: Precio[]) => {
            this.allProducts.set(this.mapProducts(vinos, precios));
          }
        });
      }
    });
  }

  private capitalizeFirstLetter(nombre: string): string {
    if (!nombre || nombre === 'Desconocido') return nombre;

    const lowerName = nombre.toLowerCase();
    return lowerName.charAt(0).toUpperCase() + lowerName.slice(1);
  }

private mapProducts(vinos: Vino[], precios: Precio[]): InternalProduct[] {
  return vinos.map(vino => {
    const rawFlavorName = vino.Sabor?.nombre ?? 'Desconocido';
    const rawCategoryName = vino.Dulzor?.nombre ?? 'Desconocido';

    const flavorName = this.capitalizeFirstLetter(rawFlavorName);
    const categoryName = this.capitalizeFirstLetter(rawCategoryName);

    const volumenMl = vino.Presentacion?.volumen_ml ?? 0;
    const botellasPorCaja = vino.Presentacion?.botellas_por_caja ?? 12;

    const preciosDelVino = precios.filter(p => p.id_vino === vino.id_vino);

    return {
      id: vino.id_vino,
      flavor: flavorName,
      flavorId: vino.id_sabor,
      category: categoryName,
      categoryId: vino.id_dulzor,
      name: vino.nombre,
      description: vino.descripcion,
      volumen: `${volumenMl} ml`,
      volumen_ml: volumenMl,
      botellas_por_caja: botellasPorCaja,
      state: vino.estado === 'D' ? 'Disponible' : 'No disponible',
      image: vino.url_img_principal,
      prices: preciosDelVino,
      iconoCategory: this.getCategoryIcon(rawCategoryName),
      iconoFlavor: this.getFlavorIcon(rawFlavorName),
    };
  });
}

  private getCategoryIcon(category: string): string {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('dulce')) return '/img/store/icons/droplet-fill.svg';
    if (lowerCat.includes('semiseco')) return '/img/store/icons/droplet-half.svg';
    if (lowerCat.includes('seco')) return '/img/store/icons/droplet.svg';
    return '/img/store/icons/droplet.svg';
  }

  private getFlavorIcon(flavor: string): string {
    const lowerFlavor = flavor.toLowerCase();
    if (lowerFlavor.includes('frambuesa')) return '/img/store/icons/baya.svg';
    if (lowerFlavor.includes('zarzamora')) return '/img/store/icons/mora-de-los-pantanos.svg';
    if (lowerFlavor.includes('arandano')) return '/img/store/icons/arandanos.svg';
    return '/img/store/icons/baya.svg';
  }

  getMainPrice(prices: Precio[] | undefined): Precio | null {
    if (!prices || prices.length === 0) {
      return null;
    }

    const unitPrice = prices.find(p => p.cantidad_minima === 1);
    return unitPrice || prices[0];
  }

  addToCart(wine: InternalProduct) {
    const mainPrice = this.getMainPrice(wine.prices);
    if (!mainPrice) return;

    const preciosOrdenados = (wine.prices || [])
      .sort((a, b) => a.cantidad_minima - b.cantidad_minima)
      .map(p => ({
        cantidad: p.cantidad_minima,
        precio: parseFloat(p.precio as unknown as string)
      }));

    const precioBase = preciosOrdenados.find(p => p.cantidad === 1)?.precio || 0;

    const cartItem: CartItem = {
      id_vino: wine.id,
      nombre: wine.name,
      cantidad: 1,  
      presentacion: `1 botella`,
      volumen_ml: wine.volumen_ml,
      url_img_principal: wine.image,
      precio_base: precioBase,
      precios_por_cantidad: preciosOrdenados,
      botellas_por_caja: wine.botellas_por_caja,
      esCaja: false
    };

    this.cartService.addToCart(cartItem);
  }

  trackById(index: number, item: InternalProduct) {
    return item.id;
  }

  generarSlug(texto: string): string {
    return texto
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  getTitle(): string {
    if (this.customTitle) return this.customTitle;

    switch (this.filterType()) {
      case 'todos': return 'Todos los Vinos';
      case 'mixtos': return 'Vinos Mixtos';
      case 'promociones': return 'Vinos en Promoción';
      default: return 'Lista de Vinos';
    }
  }
}
