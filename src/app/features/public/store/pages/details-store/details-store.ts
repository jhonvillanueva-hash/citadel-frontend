import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HeaderStore } from '../../components/header-store/header-store';

import { VinoService } from '../../../../../data/services/vino.service';
import { ImagenAdicionalVinoService } from '../../../../../data/services/imagen-adicional-vino.service';

import { Vino, ImagenAdicionalVino } from '../../../../../data/models/api.models';
import { CartItem, CartService } from '../../../../../core/services/cart.service';

export interface InternalWine {
  id_vino: number;
  nombre: string;
  descripcion: string;
  url_img_principal: string;
  imagenes_adicionales: string[];
  precio_base: number;
  dulzor: string;
  sabor: string;
  presentacion: {
    volumen_ml: number;
    botellas_por_caja: number;
  };
  precios_por_cantidad: Array<{
    cantidad: number;
    precio: number;
    ahorro: number;
  }>;
}

@Component({
  selector: 'app-details-store',
  standalone: true,
  imports: [CommonModule, HeaderStore],
  templateUrl: './details-store.html'
})

export class DetailsStore implements OnInit {

  private route = inject(ActivatedRoute);
  private vinoService = inject(VinoService);
  private imagenAdicionalService = inject(ImagenAdicionalVinoService);

  id: number = 0;
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);

  selectedQuantity = signal<number>(1);
  selectedBoxType = signal<'boxes' | 'individual'>('individual');
  selectedBoxes = signal<number>(1);
  selectedMainImage = signal<string>('');

  wineData = signal<InternalWine | null>(null);

  private cartService = inject(CartService);

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadWineData();
  }

  private loadWineData(): void {
    this.isLoading.set(true);

    this.vinoService.getById(this.id).subscribe({
      next: (vino: Vino) => {
        this.imagenAdicionalService.getAll().subscribe({
          next: (imagenes: ImagenAdicionalVino[]) => {
            const imagenesDelVino = imagenes.filter(img => img.id_vino === vino.id_vino);

            const internalWine = this.mapToInternalWine(vino, imagenesDelVino);
            this.wineData.set(internalWine);
            this.selectedMainImage.set(internalWine.url_img_principal);
            this.isLoading.set(false);
          },
          error: () => {
            const internalWine = this.mapToInternalWine(vino, []);
            this.wineData.set(internalWine);
            this.selectedMainImage.set(internalWine.url_img_principal);
            this.isLoading.set(false);
          }
        });
      },
      error: (error) => {
        console.error('Error al cargar el vino:', error);
        this.errorMessage.set('No se pudo cargar la información del producto');
        this.isLoading.set(false);
      }
    });
  }

  private mapToInternalWine(vino: Vino, imagenesAdicionales: ImagenAdicionalVino[]): InternalWine {
    const precios = vino.Precios || [];
    const preciosOrdenados = [...precios].sort((a, b) => a.cantidad_minima - b.cantidad_minima);

    const precioBaseObj = preciosOrdenados.find(p => p.cantidad_minima === 1);
    const precioBase = precioBaseObj ? parseFloat(precioBaseObj.precio as unknown as string) : 0;

    const preciosPorCantidad = preciosOrdenados.map(p => ({
      cantidad: p.cantidad_minima,
      precio: parseFloat(p.precio as unknown as string),
      ahorro: precioBase - parseFloat(p.precio as unknown as string)
    }));

    const imagenesUrls = imagenesAdicionales.map(img => img.url_img);

    return {
      id_vino: vino.id_vino,
      nombre: vino.nombre,
      descripcion: vino.descripcion || 'Sin descripción disponible',
      url_img_principal: vino.url_img_principal,
      imagenes_adicionales: imagenesUrls,
      precio_base: precioBase,
      dulzor: vino.Dulzor?.nombre || 'Desconocido',
      sabor: vino.Sabor?.nombre || 'Desconocido',
      presentacion: {
        volumen_ml: vino.Presentacion?.volumen_ml || 0,
        botellas_por_caja: vino.Presentacion?.botellas_por_caja || 12
      },
      precios_por_cantidad: preciosPorCantidad
    };
  }

  changeMainImage(imageUrl: string) {
    this.selectedMainImage.set(imageUrl);
  }

  getPricePerBottle(totalBotellas: number): number {
    const wine = this.wineData();
    if (!wine) return 0;

    let priceConfig = wine.precios_por_cantidad[0];
    for (let config of wine.precios_por_cantidad) {
      if (totalBotellas >= config.cantidad) {
        priceConfig = config;
      }
    }
    return priceConfig.precio;
  }

  getCurrentPrice(): number {
    const wine = this.wineData();
    if (!wine) return 0;

    if (this.selectedBoxType() === 'individual') {
      const totalBotellas = this.selectedQuantity();
      return this.getPricePerBottle(totalBotellas);
    } else {
      const totalBotellas = this.selectedBoxes() * wine.presentacion.botellas_por_caja;
      return this.getPricePerBottle(totalBotellas);
    }
  }

  getSavingsPerBottle(): number {
    const wine = this.wineData();
    if (!wine) return 0;

    const currentPrice = this.getCurrentPrice();
    return parseFloat((wine.precio_base - currentPrice).toFixed(2));
  }

  getTotal(): number {
    const wine = this.wineData();
    if (!wine) return 0;

    if (this.selectedBoxType() === 'individual') {
      const totalBotellas = this.selectedQuantity();
      const pricePerBottle = this.getPricePerBottle(totalBotellas);
      return parseFloat((pricePerBottle * totalBotellas).toFixed(2));
    } else {
      const totalBotellas = this.selectedBoxes() * wine.presentacion.botellas_por_caja;
      const pricePerBottle = this.getPricePerBottle(totalBotellas);
      return parseFloat((pricePerBottle * totalBotellas).toFixed(2));
    }
  }

  getTotalSavings(): number {
    const wine = this.wineData();
    if (!wine) return 0;

    if (this.selectedBoxType() === 'individual') {
      const totalBotellas = this.selectedQuantity();
      const originalTotal = wine.precio_base * totalBotellas;
      const currentTotal = this.getTotal();
      return parseFloat((originalTotal - currentTotal).toFixed(2));
    } else {
      const totalBotellas = this.selectedBoxes() * wine.presentacion.botellas_por_caja;
      const originalTotal = wine.precio_base * totalBotellas;
      const currentTotal = this.getTotal();
      return parseFloat((originalTotal - currentTotal).toFixed(2));
    }
  }

  incrementQuantity() {
    this.selectedQuantity.update(val => val + 1);
  }

  decrementQuantity() {
    if (this.selectedQuantity() > 1) {
      this.selectedQuantity.update(val => val - 1);
    }
  }

  setBoxes(boxes: number) {
    this.selectedBoxes.set(boxes);
  }

  incrementBoxes() {
    this.selectedBoxes.update(val => val + 1);
  }

  decrementBoxes() {
    if (this.selectedBoxes() > 1) {
      this.selectedBoxes.update(val => val - 1);
    }
  }

  setIndividualMode() {
    this.selectedBoxType.set('individual');
  }

  setBoxesMode() {
    this.selectedBoxType.set('boxes');
  }

  addToCart() {
    const wine = this.wineData();
    if (!wine) return;

    let totalBotellas: number;
    let textoPresentacion: string;

    if (this.selectedBoxType() === 'individual') {
      totalBotellas = this.selectedQuantity();
      textoPresentacion = `${totalBotellas} ${totalBotellas === 1 ? 'botella' : 'botellas'}`;
    } else {
      const cajas = this.selectedBoxes();
      totalBotellas = cajas * wine.presentacion.botellas_por_caja;
      textoPresentacion = `${totalBotellas} ${totalBotellas === 1 ? 'botella' : 'botellas'}`;
    }

    const preciosPorCantidad = wine.precios_por_cantidad.map(p => ({
      cantidad: p.cantidad,
      precio: p.precio
    }));

    const precioUnitario = this.getPricePerBottle(totalBotellas);

    const cartItem: CartItem = {
      id_vino: wine.id_vino,
      nombre: wine.nombre,
      cantidad: totalBotellas,
      presentacion: textoPresentacion,
      volumen_ml: wine.presentacion.volumen_ml,
      url_img_principal: wine.url_img_principal,
      precio_base: wine.precio_base,
      precios_por_cantidad: preciosPorCantidad,
      botellas_por_caja: wine.presentacion.botellas_por_caja,
      esCaja: false
    };

    this.cartService.addToCart(cartItem);
    console.log('Añadido al carrito:', wine.nombre, `${totalBotellas} botellas`);
  }
}
