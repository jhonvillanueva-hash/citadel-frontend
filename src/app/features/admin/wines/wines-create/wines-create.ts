import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Sabor, Dulzor, Presentacion } from '../../../../data/models/api.models';
import { forkJoin } from 'rxjs';
import { DulzorService } from '../../../../data/services/dulzor.service';
import { PresentacionService } from '../../../../data/services/presentacion.service';
import { SaborService } from '../../../../data/services/sabor.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { VinoService } from '../../../../data/services/vino.service';
import { VinoForm } from '../../../../data/models/forms.models';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleXmark, faPlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-wines-create',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './wines-create.html',
  styles: [''],
})
export class WinesCreateComponent implements OnInit {
  private flavorService = inject(SaborService);
  private sweetService = inject(DulzorService);
  private presentationService = inject(PresentacionService);
  private wineService = inject(VinoService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  flavors = signal<Sabor[]>([]);
  sweets = signal<Dulzor[]>([]);
  presentations = signal<Presentacion[]>([]);
  isLoading = signal(false);
  isAddingFlavor = signal(false);
  newFlavorName = signal('');
  isAddingSweet = signal(false);
  newSweetName = signal('');
  isAddingPresentation = signal(false);
  imgPrincipal = signal<File | null>(null);
  principalImagePreview = signal<string | null>(null);
  imgsAdicionales = signal<(File | null)[]>([null]);
  additionalImagesPreviews = signal<(string | null)[]>([null]);

  precioBase = 12;
  precios = [
    { cantidad: null as number | null, precio: null as number | null }
  ];
  newPresentation = { volumen_ml: 0, botellas_por_caja: 0 };
  
  wineData: VinoForm = {
    sku: '',
    nombre: '',
    descripcion: '',
    stock: 0,
    estado: 'D',
    id_sabor: null,
    id_dulzor: null,
    id_presentacion: null
  };

  ngOnInit(): void {
    this.loadData();
  }

  loadData() {
    this.isLoading.set(true);
    forkJoin({
      flavors: this.flavorService.getAll(),
      sweets: this.sweetService.getAll(),
      presentations: this.presentationService.getAll(),
    }).subscribe({
      next: ({ flavors, sweets, presentations }) => {
        this.flavors.set(flavors);
        this.sweets.set(sweets);
        this.presentations.set(presentations);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.toastService.showError('Error cargando configuraciones', err);
        this.isLoading.set(false);
      }
    });
  }

  onPrincipalFileChange(event: any) {
    const file = event.target.files?.[0];
    if (!file) return;

    this.imgPrincipal.set(file);

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.principalImagePreview.set(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  onAdditionalFileChange(event: any, index: number) {
    const file = event.target.files?.[0];
    if (!file) return;

    const imgs = [...this.imgsAdicionales()];
    const previews = [...this.additionalImagesPreviews()];

    imgs[index] = file;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      previews[index] = e.target.result;
      this.additionalImagesPreviews.set([...previews]);
    };
    reader.readAsDataURL(file);

    if (index === imgs.length - 1) {
      imgs.push(null);
      previews.push(null);
    }

    this.imgsAdicionales.set(imgs);
  }

  removeAdditionalImage(index: number): void {
    this.additionalImagesPreviews()[index] = null;
    this.imgsAdicionales()[index] = null;
  }

  removeAdditionalImageRow(index: number): void {
    this.imgsAdicionales().splice(index, 1);
    this.additionalImagesPreviews().splice(index, 1);
  }

  saveNewFlavor() {
    if (!this.newFlavorName()) return;
    this.flavorService.create({ nombre: this.newFlavorName() }).subscribe({
      next: (flavor) => {
        this.flavors.update(prev => [...prev, flavor]);
        this.wineData.id_sabor = flavor.id_sabor;
        this.isAddingFlavor.set(false);
        this.newFlavorName.set('');
        this.toastService.showSuccess('Sabor añadido');
      },
      error: (err) => this.toastService.showError('Error al añadir sabor', err.message)
    });
  }

  saveNewSweet() {
    if (!this.newSweetName()) return;
    this.sweetService.create({ nombre: this.newSweetName() }).subscribe({
      next: (sweet) => {
        this.sweets.update(prev => [...prev, sweet]);
        this.wineData.id_dulzor = sweet.id_dulzor;
        this.isAddingSweet.set(false);
        this.newSweetName.set('');
        this.toastService.showSuccess('Dulzor añadido');
      },
      error: (err) => this.toastService.showError('Error al añadir dulzor', err.message)
    });
  }

  saveNewPresentation() {
    if (!this.newPresentation.volumen_ml || !this.newPresentation.botellas_por_caja) return;
    this.presentationService.create(this.newPresentation).subscribe({
      next: (presentation) => {
        this.presentations.update(prev => [...prev, presentation]);
        this.wineData.id_presentacion = presentation.id_presentacion;
        this.isAddingPresentation.set(false);
        this.newPresentation = { volumen_ml: 0, botellas_por_caja: 0 };
        this.toastService.showSuccess('Presentación añadida');
      },
      error: (err) => this.toastService.showError('Error al añadir presentación', err.message)
    });
  }

  agregarFilaPrecio() {
    const ultima = this.precios[this.precios.length - 1];
    if (!ultima.cantidad || !ultima.precio) {
      this.toastService.showWarning('Completa la última fila antes de añadir otra');
      return;
    }
    this.precios.push({ cantidad: null, precio: null });
  }

  onSubmit() {
    if (!this.wineData.sku || !this.wineData.nombre || !this.imgPrincipal()) {
      this.toastService.showError('Error', 'Por favor, completa todos los campos');
      return;
    }

    const formData = new FormData();
    formData.append('sku', this.wineData.sku);
    formData.append('nombre', this.wineData.nombre);
    formData.append('descripcion', this.wineData.descripcion);
    formData.append('stock', this.wineData.stock.toString());
    formData.append('estado', this.wineData.estado);
    formData.append('id_sabor', this.wineData.id_sabor?.toString() || '');
    formData.append('id_dulzor', this.wineData.id_dulzor?.toString() || '');
    formData.append('id_presentacion', this.wineData.id_presentacion?.toString() || '');
    formData.append('url_img_principal', this.imgPrincipal()!);
    this.imgsAdicionales()
      .filter((file): file is File => file !== null)
      .forEach((file) => {
        formData.append('imagen_adicionales', file);
      });

    const selectedPresentation = this.presentations().find(p => p.id_presentacion == this.wineData.id_presentacion);
    const bottlesPerBox = selectedPresentation?.botellas_por_caja || 1;

    const preciosBackend = [
      { cantidad_minima: 1, precio: this.precioBase },
      ...this.precios
        .filter(p => p.cantidad !== null && p.precio !== null)
        .map(p => ({ 
          cantidad_minima: p.cantidad! * bottlesPerBox, 
          precio: p.precio! 
        }))
    ];
    formData.append('precios', JSON.stringify(preciosBackend));

    this.isLoading.set(true);
    this.wineService.createWithImage(formData).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.toastService.showSuccess('Vino registrado correctamente');
        this.router.navigate(['/admin/wines/create']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.toastService.showError('Error al registrar el vino', err.message);
      }
    });
  }

  icons = {
    faPlus,
    faCircleXmark
  }
}