import { Component, signal, computed, effect, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { VinoService } from '../../../../../data/services/vino.service';
import { ImagenAdicionalVinoService } from '../../../../../data/services/imagen-adicional-vino.service';
import { CarritoProductoService } from '../../../../../data/services/carrito-producto.service';

import { Vino, ImagenAdicionalVino, Carrito } from '../../../../../data/models/api.models';
import { CartItem, CartService } from '../../../../../core/services/cart.service';

import { ToastService } from '../../../../../shared/components/toast/toast.service';
import { AiButtonComponent } from "../../../../../shared/components/ai-button/ai-button";
import { FabStackComponent } from "../../../../../shared/layouts/fab-stack/fab-stack";
import { AiChatWidgetComponent } from "../../../../../shared/layouts/ai-chat-widget/ai-chat-widget";
import { CarritoService as ApiCartService } from '../../../../../data/services/cart.service';
import { of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { faBottleDroplet, faBoxesStacked, faBoxOpen, faCalendarCheck, faCartArrowDown, faWineBottle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

export interface InternalWine {
  id_vino: number;
  nombre: string;
  descripcion: string;
  url_img_principal: string;
  imagenes_adicionales: string[];
  precio_base: number;
  stock: number;
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
  imports: [CommonModule, AiButtonComponent, FabStackComponent, AiChatWidgetComponent, FontAwesomeModule],
  templateUrl: './details-store.html',
  styles: `
    .no-spinner::-webkit-inner-spin-button,
    .no-spinner::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .no-spinner {
      -moz-appearance: textfield;
      appearance: textfield;
    }
  `,
})

export class DetailsStore implements OnInit {

  private route = inject(ActivatedRoute);
  private vinoService = inject(VinoService);
  private imagenAdicionalService = inject(ImagenAdicionalVinoService);
  private cartService = inject(CartService);
  private apiProductos = inject(CarritoProductoService);
  private toastService = inject(ToastService);
  private apiCartService = inject(ApiCartService);

  id: number = 0;
  isLoading = signal(true);
  errorMessage = signal<string | null>(null);
  selectedQuantity = signal<number>(1);
  selectedBoxType = signal<'boxes' | 'individual'>('individual');
  selectedBoxes = signal<number>(1);
  selectedMainImage = signal<string>('');
  wineData = signal<InternalWine | null>(null);
  addingToCart = signal(false);

  isOutOfStock = computed(() => this.stockDisponible() <= 0);
  aiOpen = false;

  toggleAi() {
    this.aiOpen = !this.aiOpen;
  }

  closeAi() {
    this.aiOpen = false;
  }
  stockDisponible = computed(() => {
    const wine = this.wineData();
    if (!wine) return 0;
    return this.cartService.getStockDisponible(wine.stock, wine.id_vino);
  });

  canShowBoxesMode = computed(() => {
    const wine = this.wineData();
    if (!wine) return false;
    return this.stockDisponible() >= wine.presentacion.botellas_por_caja;
  });

  canShowBox1 = computed(() => {
    const wine = this.wineData();
    if (!wine) return false;
    return this.stockDisponible() >= wine.presentacion.botellas_por_caja * 1;
  });

  canShowBox5 = computed(() => {
    const wine = this.wineData();
    if (!wine) return false;
    return this.stockDisponible() >= wine.presentacion.botellas_por_caja * 5;
  });

  canShowBox10 = computed(() => {
    const wine = this.wineData();
    if (!wine) return false;
    return this.stockDisponible() >= wine.presentacion.botellas_por_caja * 10;
  });

  private stockEffect = effect(() => {
    const wine = this.wineData();

    if (!wine) return;

    const stock = this.stockDisponible();

    if (this.selectedBoxType() === 'individual') {
      if (this.selectedQuantity() > stock) {
        this.selectedQuantity.set(stock);
      }
    }

    if (this.selectedBoxType() === 'boxes') {
      const maxBoxes = Math.floor(
        stock / wine.presentacion.botellas_por_caja
      );

      if (maxBoxes <= 0) {
        this.setIndividualMode();
        return;
      }

      if (this.selectedBoxes() > maxBoxes) {
        this.selectedBoxes.set(maxBoxes);
      }
    }
  });

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

    const preciosPorCantidad = preciosOrdenados.map((p, index) => ({
      cantidad: index === 0
        ? p.cantidad_minima
        : p.cantidad_minima + 1,
      precio: parseFloat(p.precio as unknown as string),
      ahorro: precioBase - parseFloat(p.precio as unknown as string)
    }));

    return {
      id_vino: vino.id_vino,
      nombre: vino.nombre,
      descripcion: vino.descripcion || 'Sin descripción disponible',
      url_img_principal: vino.url_img_principal,
      imagenes_adicionales: imagenesAdicionales.map(img => img.url_img),
      precio_base: precioBase,
      stock: vino.stock,
      dulzor: vino.Dulzor?.nombre || 'Desconocido',
      sabor: vino.Sabor?.nombre || 'Desconocido',
      presentacion: {
        volumen_ml: vino.Presentacion?.volumen_ml || 0,
        botellas_por_caja: vino.Presentacion?.botellas_por_caja || 12
      },
      precios_por_cantidad: preciosPorCantidad
    };
  }

  changeMainImage(imageUrl: string): void { this.selectedMainImage.set(imageUrl); }

  getPricePerBottle(totalBotellas: number): number {
    const wine = this.wineData();
    if (!wine) return 0;
    let priceConfig = wine.precios_por_cantidad[0];
    for (const config of wine.precios_por_cantidad) {
      if (totalBotellas >= config.cantidad) priceConfig = config;
    }
    return priceConfig.precio;
  }

  getCurrentPrice(): number {
    const wine = this.wineData();
    if (!wine) return 0;
    const total = this.selectedBoxType() === 'individual'
      ? this.selectedQuantity()
      : this.selectedBoxes() * wine.presentacion.botellas_por_caja;
    return this.getPricePerBottle(total);
  }

  getSavingsPerBottle(): number {
    const wine = this.wineData();
    if (!wine) return 0;
    return parseFloat((wine.precio_base - this.getCurrentPrice()).toFixed(2));
  }

  getTotal(): number {
    const wine = this.wineData();
    if (!wine) return 0;
    const total = this.selectedBoxType() === 'individual'
      ? this.selectedQuantity()
      : this.selectedBoxes() * wine.presentacion.botellas_por_caja;
    return parseFloat((this.getPricePerBottle(total) * total).toFixed(2));
  }

  getTotalSavings(): number {
    const wine = this.wineData();
    if (!wine) return 0;
    const total = this.selectedBoxType() === 'individual'
      ? this.selectedQuantity()
      : this.selectedBoxes() * wine.presentacion.botellas_por_caja;
    return parseFloat(((wine.precio_base * total) - this.getTotal()).toFixed(2));
  }

  incrementQuantity(): void {
    const stock = this.stockDisponible();
    if (this.selectedQuantity() >= stock) {
      return;
    }
    this.selectedQuantity.update(v => v + 1);
  }

  decrementQuantity(): void {
    if (this.selectedQuantity() > 1) this.selectedQuantity.update(v => v - 1);
  }

  onQuantityChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    if (isNaN(value) || value < 1) {
      value = 1;
    }

    if (value > this.stockDisponible()) {
      value = this.stockDisponible();
    }

    this.selectedQuantity.set(value);
  }

  setBoxes(boxes: number): void {
    const wine = this.wineData();
    if (!wine) return;
    const botellas = boxes * wine.presentacion.botellas_por_caja;
    if (botellas > this.stockDisponible()) {
      return;
    }
    this.selectedBoxes.set(boxes);
  }

  incrementBoxes(): void {
    const wine = this.wineData();
    if (!wine) return;
    const nuevasCajas = this.selectedBoxes() + 1;
    const botellas = nuevasCajas * wine.presentacion.botellas_por_caja;
    if (botellas > this.stockDisponible()) {
      return;
    }
    this.selectedBoxes.update(v => v + 1);
  }

  decrementBoxes(): void {
    if (this.selectedBoxes() > 1) this.selectedBoxes.update(v => v - 1);
  }

  maxBoxes(): number {
    const wine = this.wineData();
    if (!wine) {
      return 0;
    }
    return Math.floor(
      this.stockDisponible() / wine.presentacion.botellas_por_caja
    );
  }

  onBoxesChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = Number(input.value);

    if (isNaN(value) || value < 1) {
      value = 1;
    }

    const max = this.maxBoxes();

    if (value > max) {
      value = max;
    }

    this.selectedBoxes.set(value);
  }

  setIndividualMode(): void {
    this.selectedBoxType.set('individual');
    this.selectedQuantity.set(1);
  }

  setBoxesMode(): void {
    if (!this.canShowBoxesMode()) {
      return;
    }
    this.selectedBoxType.set('boxes');
    this.selectedBoxes.set(1);
  }

  addToCart(): void {
    if (this.addingToCart()) return;

    const wine = this.wineData();
    if (!wine) return;

    const stock = this.stockDisponible();

    const totalBotellas = this.selectedBoxType() === 'individual'
      ? this.selectedQuantity()
      : this.selectedBoxes() * wine.presentacion.botellas_por_caja;

    if (totalBotellas > stock) {
      return;
    }

    const presentationText = totalBotellas === 1
      ? '1 botella'
      : `${totalBotellas} botellas`;

    this.addingToCart.set(true);

    if (this.cartService.isLogged()) {

      this.apiCartService.getAll().pipe(
        switchMap((carritos: Carrito[]) => {
          const carritoActivo = carritos.find(c => c.estado === 'E');

          if (carritoActivo) {
            return of(carritoActivo);
          }

          return this.apiCartService.create({
            estado: 'E'
          });
        }),
        switchMap((carrito: Carrito) =>
          this.apiProductos.addOrUpdate({
            id_carrito: carrito.id_carrito,
            id_vino: wine.id_vino,
            cantidad: totalBotellas
          })
        )
      ).subscribe({
        next: () => {
          this.cartService.loadCart();

          this.toastService.showSuccess(
            'Producto añadido al carrito',
            `${wine.nombre} · ${presentationText}`
          );

          this.addingToCart.set(false);
        },
        error: (err) => {
          console.error('addToCart API error', err);
          this.addingToCart.set(false);
        }
      });

      return;
    }

    const cartItem: CartItem = {
      id_vino: wine.id_vino,
      nombre: wine.nombre,
      cantidad: totalBotellas,
      stock: wine.stock,
      presentacion: presentationText,
      volumen_ml: wine.presentacion.volumen_ml,
      url_img_principal: wine.url_img_principal,
      precio_base: wine.precio_base,
      precios_por_cantidad: wine.precios_por_cantidad.map(p => ({
        cantidad: p.cantidad,
        precio: p.precio
      })),
      botellas_por_caja: wine.presentacion.botellas_por_caja,
      esCaja: false
    };

    this.cartService.addToCart(cartItem);

    this.toastService.showSuccess(
      'Producto añadido al carrito',
      `${wine.nombre} · ${presentationText}`
    );

    setTimeout(() => {
      this.addingToCart.set(false);
    }, 400);
  }

  getDeliveryRange(): string {
    const today = new Date();

    const startDate = new Date(today);
    startDate.setDate(today.getDate() + 5);

    const endDate = new Date(today);
    endDate.setDate(today.getDate() + 10);

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long'
    };

    const start = this.capitalize(
      startDate.toLocaleDateString('es-ES', options)
    );

    const end = this.capitalize(
      endDate.toLocaleDateString('es-ES', options)
    );

    return `
      Entrega entre el
      <span class="font-semibold underline decoration-[#6B1F2A] underline-offset-2">${start}</span>
      y
      <span class="font-semibold underline decoration-[#6B1F2A] underline-offset-2">${end}</span>
    `;
  }

  private capitalize(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  getCategoryIcon(category: string): string {
    const lowerCat = category.toLowerCase();
    if (lowerCat.includes('dulce')) return '/img/store/icons/droplet-fill.svg';
    if (lowerCat.includes('semiseco')) return '/img/store/icons/droplet-half.svg';
    if (lowerCat.includes('seco')) return '/img/store/icons/droplet.svg';
    return '/img/store/icons/droplet.svg';
  }

  getFlavorIcon(flavor: string): string {
    const lowerFlavor = flavor.toLowerCase();
    if (lowerFlavor.includes('frambuesa')) return '/img/store/icons/baya.svg';
    if (lowerFlavor.includes('zarzamora')) return '/img/store/icons/mora-de-los-pantanos.svg';
    if (lowerFlavor.includes('arandano')) return '/img/store/icons/arandanos.svg';
    return '/img/store/icons/baya.svg';
  }

  icons = {
    faCartArrowDown,
    faCalendarCheck,
    faWineBottle,
    faBottleDroplet,
    faBoxesStacked,
    faBoxOpen,
  }
}
