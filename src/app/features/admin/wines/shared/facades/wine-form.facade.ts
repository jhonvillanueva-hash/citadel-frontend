import { Injectable, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';
import { Vino } from '../../../../../data/models/api.models';
import { VinoForm } from '../../../../../data/models/forms.models';
import { VinoService } from '../../../../../data/services/vino.service';
import { WineImage, PriceRow } from '../models/wine-form.models';
import { formatPricesForBackend, mapBackendToPriceRows } from '../utils/price.utils';

@Injectable({ providedIn: 'root' })
export class WineFormFacade {
  private wineService = inject(VinoService);

  wineId = signal<number | null>(null);
  wineData = signal<VinoForm>(this.initialForm());
  principalImage = signal<WineImage>({ file: null, preview: null });
  additionalImages = signal<WineImage[]>([{ file: null, preview: null }]);
  basePrice = signal(12);
  priceRows = signal<PriceRow[]>([{ cantidad: null, precio: null }]);
  isLoading = signal(false);

  resetForCreate() {
    this.wineId.set(null);
    this.wineData.set(this.initialForm());
    this.principalImage.set({ file: null, preview: null });
    this.additionalImages.set([{ file: null, preview: null }]);
    this.basePrice.set(12);
    this.priceRows.set([{ cantidad: null, precio: null }]);
  }

  initializeForEdit(wine: Vino) {
    this.wineId.set(wine.id_vino);
    this._mapBasicData(wine);
    this._mapImages(wine);
    this._mapPrices(wine);
  }

  private _mapBasicData(wine: Vino) {
    this.wineData.set({
      sku: wine.sku,
      nombre: wine.nombre,
      descripcion: wine.descripcion,
      stock: wine.stock,
      estado: wine.estado,
      id_sabor: wine.id_sabor,
      id_dulzor: wine.id_dulzor,
      id_presentacion: wine.id_presentacion
    });
  }

  private _mapImages(wine: Vino) {
    this.principalImage.set({
      file: null,
      preview: wine.url_img_principal,
      url: wine.url_img_principal
    });

    const additional: WineImage[] = (wine.ImagenAdicionalVinos || []).map(img => ({
      file: null,
      preview: img.url_img,
      url: img.url_img
    }));
    this.additionalImages.set([...additional, { file: null, preview: null }]);
  }

  private _mapPrices(wine: Vino) {
    const bottlesPerBox = wine.Presentacion?.botellas_por_caja || 1;
    const base = wine.Precios?.find(p => p.cantidad_minima === 1)?.precio || 12;
    this.basePrice.set(base);
    this.priceRows.set(mapBackendToPriceRows(wine.Precios, bottlesPerBox));
  }

  validatePriceRows(): string | null {
    const rows = this.priceRows();
    const cantidades = new Set<number>();
    const precios = new Set<number>();
    const basePrice = Number(this.basePrice());

    for (const row of rows) {
      const cantidad = Number(row.cantidad);
      const precio = Number(row.precio);
      if (
        cantidad == null || cantidad <= 0 ||
        precio == null || precio <= 0
      ) {
        return 'Todas las filas deben tener valores mayores a 0';
      }
      if (precio === basePrice) {
        return `El precio ${precio} ya corresponde al precio base`;
      }
      if (cantidades.has(cantidad)) {
        return `La cantidad ${cantidad} ya existe`;
      }
      if (precios.has(precio)) {
        return `El precio ${precio} ya existe`;
      }
      cantidades.add(cantidad);
      precios.add(precio);
    }
    return null;
  }

  updateField<K extends keyof VinoForm>(field: K, value: VinoForm[K]) {
    this.wineData.update(prev => ({ ...prev, [field]: value }));
  }

  setPrincipalImage(img: WineImage) {
    this.principalImage.set(img);
  }

  addAdditionalImage(img: WineImage, index: number) {
    this.additionalImages.update(list => {
      const newList = [...list];
      newList[index] = img;
      if (index === list.length - 1) newList.push({ file: null, preview: null });
      return newList;
    });
  }

  removeImageRow(index: number) {
    this.additionalImages.update(list => list.filter((_, i) => i !== index));
  }

  submit(bottlesPerBox: number) {
    this.isLoading.set(true);
    const formData = this.buildFormData(bottlesPerBox);
    const id = this.wineId();

    const request = id
      ? this.wineService.updateWithImage(id, formData)
      : this.wineService.createWithImage(formData);

    return request.pipe(finalize(() => this.isLoading.set(false)));
  }

  private buildFormData(bottlesPerBox: number): FormData {
    const data = this.wineData();
    const formData = new FormData();

    Object.entries(data).forEach(([key, val]) => {
      if (val !== null && val !== undefined) formData.append(key, val.toString());
    });

    if (this.principalImage().file) {
      formData.append('url_img_principal', this.principalImage().file!);
    } else if (this.principalImage().url) {
      formData.append('url_img_principal', this.principalImage().url!);
    }

    this.additionalImages().filter(img => img.file).forEach(img => {
      formData.append('imagen_adicionales', img.file!);
    });

    const existingUrls = this.additionalImages()
      .filter(img => img.url && !img.file)
      .map(img => ({ url_img: img.url }));

    if (this.wineId()) {
      formData.append(
        'imagen_adicionales',
        JSON.stringify(existingUrls)
      );
    }

    const prices = formatPricesForBackend(this.basePrice(), this.priceRows(), bottlesPerBox);
    formData.append('precios', JSON.stringify(prices));

    return formData;
  }

  private initialForm(): VinoForm {
    return {
      sku: '', nombre: '', descripcion: '', stock: 0,
      estado: 'D', id_sabor: null, id_dulzor: null, id_presentacion: null
    };
  }
}
