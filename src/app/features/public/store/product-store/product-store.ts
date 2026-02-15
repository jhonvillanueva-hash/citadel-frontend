import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Flavor {
  id: number;
  name: string;
}

interface Category {
  id: number;
  name: string;
}

interface ProductWine {
  id: number;
  idFlavor: number;
  idCategory: number;
  name: string;
  description: string;
  volumen: string;
  state: string;
  image: string;
}

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
}

const flavors: Flavor[] = [
  { id: 1, name: 'Frambuesas' },
  { id: 2, name: 'Zarzamoras' },
  { id: 3, name: 'Arandanos' }
];

const categories: Category[] = [
  { id: 1, name: 'Dulce' },
  { id: 2, name: 'Seco' },
  { id: 3, name: 'Semiseco' }
];

const productsPullApi: ProductWine[] = [
  {id: 1, idFlavor: 1, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 2, idFlavor: 1, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 3, idFlavor: 1, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '550 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 4, idFlavor: 2, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 5, idFlavor: 3, idCategory: 1, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 6, idFlavor: 3, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '650 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 7, idFlavor: 2, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 8, idFlavor: 3, idCategory: 3, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '750 ml', state: 'Disponible', image: '/img/store/one.jpg'},
  {id: 9, idFlavor: 2, idCategory: 2, name: 'Vino Tinto', description: "Vinos deliciosos con notas de frutas rojas y especias.", volumen: '850 ml', state: 'Disponible', image: '/img/store/one.jpg'},
];

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './product-store.html',
  styles: ``
})
export class ProductStore {

  private flavorMap = new Map(flavors.map(f => [f.id, f.name]));
  private categoryMap = new Map(categories.map(c => [c.id, c.name]));

  products: InternalProduct[] = this.mapProducts(productsPullApi);

  private mapProducts(products: ProductWine[]): InternalProduct[] {
    return products.map(product => {

      const flavorName = this.flavorMap.get(product.idFlavor) ?? 'Desconocido';
      const categoryName = this.categoryMap.get(product.idCategory) ?? 'Desconocido';

      return {
        id: product.id,
        flavor: flavorName,
        category: categoryName,
        name: product.name,
        description: product.description,
        volumen: product.volumen,
        state: product.state,
        image: product.image,

        iconoCategory:
          categoryName.toLowerCase() === 'dulce'
            ? '/img/store/icons/droplet-fill.svg'
            : categoryName.toLowerCase() === 'seco'
            ? '/img/store/icons/droplet.svg'
            : categoryName.toLowerCase() === 'semiseco'
            ? '/img/store/icons/droplet-half.svg'
            : '',

        iconoFlavor:
          flavorName.toLowerCase() === 'frambuesas'
            ? '/img/store/icons/baya.svg'
            : flavorName.toLowerCase() === 'zarzamoras'
            ? '/img/store/icons/mora-de-los-pantanos.svg'
            : flavorName.toLowerCase() === 'arandanos'
            ? '/img/store/icons/arandanos.svg'
            : '',
      };
    });
  }

  trackById(index: number, item: InternalProduct) {
    return item.id;
  }
}
