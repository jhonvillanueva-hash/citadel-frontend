import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollAnimationService } from '../../../core/services/scroll-animation.service';

interface Benefit {
  label: string;
  desc: string;
  svgPath: string;
}

interface Product {
  type: string;
  name: string;
  desc: string;
  price: string;
  img: string;
}

interface Collection {
  count: string;
  name: string;
  desc: string;
  img: string;
}

@Component({
  selector: 'app-info-landing',
  standalone: true,
  templateUrl: './info-landing.html',
  imports: [RouterLink]
})
export class InfoLanding  {

  readonly benefits: Benefit[] = [
    {
      label: 'Berries Seleccionados',
      desc: 'Frutos cultivados cuidadosamente en campos del norte del Perú.',
      svgPath: 'M11.109 14.546C11 14.7599 11 15.0399 11 15.6V17.4C11 17.9601 11 18.2401 11.109 18.454C11.2049 18.6422 11.3578 18.7951 11.546 18.891C11.7599 19 12.0399 19 12.6 19H14.4C14.9601 19 15.2401 19 15.454 18.891C15.6422 18.7951 15.7951 18.6422 15.891 18.454C16 18.2401 16 17.9601 16 17.4V15.6C16 15.0399 16 14.7599 15.891 14.546C15.7951 14.3578 15.6422 14.2049 15.454 14.109C15.2401 14 14.9601 14 14.4 14H12.6C12.0399 14 11.7599 14 11.546 14.109C11.3578 14.2049 11.2049 14.3578 11.109 14.546ZM11.109 14.546L7.7386 9.67415M8 7.5H16M4.6 10H6.4C6.96005 10 7.24008 10 7.45399 9.89101C7.64215 9.79513 7.79513 9.64215 7.89101 9.45399C8 9.24008 8 8.96005 8 8.4V6.6C8 6.03995 8 5.75992 7.89101 5.54601C7.79513 5.35785 7.64215 5.20487 7.45399 5.10899C7.24008 5 6.96005 5 6.4 5H4.6C4.03995 5 3.75992 5 3.54601 5.10899C3.35785 5.20487 3.20487 5.35785 3.10899 5.54601C3 5.75992 3 6.03995 3 6.6V8.4C3 8.96005 3 9.24008 3.10899 9.45399C3.20487 9.64215 3.35785 9.79513 3.54601 9.89101C3.75992 10 4.03995 10 4.6 10ZM17.6 10H19.4C19.9601 10 20.2401 10 20.454 9.89101C20.6422 9.79513 20.7951 9.64215 20.891 9.45399C21 9.24008 21 8.96005 21 8.4V6.6C21 6.03995 21 5.75992 20.891 5.54601C20.7951 5.35785 20.6422 5.20487 20.454 5.10899C20.2401 5 19.9601 5 19.4 5H17.6C17.0399 5 16.7599 5 16.546 5.10899C16.3578 5.20487 16.2049 5.35785 16.109 5.54601C16 5.75992 16 6.03995 16 6.6V8.4C16 8.96005 16 9.24008 16.109 9.45399C16.2049 9.64215 16.3578 9.79513 16.546 9.89101C16.7599 10 17.0399 10 17.6 10Z'
    },
    {
      label: 'Calidad Artesanal',
      desc: 'Procesos cuidados que garantizan sabor, aroma y autenticidad.',
      svgPath: 'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z'
    },
    {
      label: 'Producción Responsable',
      desc: 'Elaboración cuidadosa que conserva la frescura de cada botella.',
      svgPath: 'M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12'
    },
    {
      label: 'Sabores Únicos',
      desc: 'Vinos de berries creados para experiencias diferentes y naturales.',
      svgPath: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z'
    }
  ];

  readonly featuredProducts: Product[] = [
    {
      type: 'SEMISECO',
      name: 'Arándano – 750 ml',
      desc: 'Vino de arándanos con notas frescas y frutales, equilibrio suave y un final agradable al paladar.',
      price: 'S/ 25.00',
      img: '/img/landing/info/products/1.png'
    },
    {
      type: 'SECO',
      name: 'Zarzamora – 750 ml',
      desc: 'Vino de carácter intenso, con sabor profundo a zarzamora y un perfil seco ideal para carnes y quesos.',
      price: 'S/ 25.00',
      img: '/img/landing/info/products/2.png'
    },
    {
      type: 'DULCE',
      name: 'Frambuesa – 750 ml',
      desc: 'Vino dulce y aromático, con notas suaves de frambuesa y una textura ligera y refrescante.',
      price: 'S/ 25.00',
      img: '/img/landing/info/products/3.png'
    },
    {
      type: 'SEMISECO',
      name: 'Berry Mix',
      desc: 'Mezcla equilibrada de arándano, zarzamora y frambuesa, ideal para compartir en cualquier ocasión.',
      price: 'S/ 25.00',
      img: '/img/landing/info/products/4.png'
    }
  ];

  readonly collections: Collection[] = [
    {
      count: '8 Productos',
      name: 'Dulces',
      desc: 'Suaves, frutales y fáciles de disfrutar.',
      img: '/img/landing/hero/carousel/1-fondo.webp'
    },
    {
      count: '10 Productos',
      name: 'Semisecos',
      desc: 'Equilibrio perfecto entre dulzor y frescura.',
      img: '/img/landing/hero/carousel/2-fondo.webp'
    },
    {
      count: '6 Productos',
      name: 'Secos',
      desc: 'Intensos, con carácter y personalidad.',
      img: '/img/landing/hero/carousel/3-fondo.webp'
    },
    {
      count: '5 Productos',
      name: 'Mix & Especiales',
      desc: 'Combinaciones únicas para experiencias diferentes.',
      img: '/img/landing/hero/carousel/4-fondo.webp'
    }
  ];

  readonly delays = ['delay-100', 'delay-200', 'delay-300', 'delay-400'];
}
