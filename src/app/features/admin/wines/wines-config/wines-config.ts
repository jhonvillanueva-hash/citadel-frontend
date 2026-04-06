import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { SaborService } from '../../../../data/services/sabor.service';
import { DulzorService } from '../../../../data/services/dulzor.service';
import { PresentacionService } from '../../../../data/services/presentacion.service';
import { Dulzor, Presentacion, Sabor } from '../../../../data/models/api.models';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ConfirmDialogService } from '../../../../shared/components/confirm-dialog/confirm-dialog.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faPlus, faEdit, faTrash, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-wines-config',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FontAwesomeModule],
  templateUrl: './wines-config.html',
})
export class WinesConfigComponent implements OnInit {
  private flavorService = inject(SaborService);
  private sweetService = inject(DulzorService);
  private presentationService = inject(PresentacionService);
  private toastService = inject(ToastService);
  private fb = inject(FormBuilder);
  confirmDialogService = inject(ConfirmDialogService);

  flavors = signal<Sabor[]>([]);
  sweets = signal<Dulzor[]>([]);
  presentations = signal<Presentacion[]>([]);
  isLoading = signal(false);

  flavorForm = this.fb.group({
    id_sabor: [null as number | null],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
  });

  sweetForm = this.fb.group({
    id_dulzor: [null as number | null],
    nombre: ['', [Validators.required, Validators.minLength(2)]],
  });

  presentationForm = this.fb.group({
    id_presentacion: [null as number | null],
    volumen_ml: [null as number | null, [Validators.required, Validators.min(1)]],
    botellas_por_caja: [null as number | null, [Validators.required, Validators.min(1)]],
  });

  editingFlavorId = signal<number | null>(null);
  editingSweetId = signal<number | null>(null);
  editingPresentationId = signal<number | null>(null);

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

  private isDuplicate<T>(
    list: T[],
    value: string,
    getField: (item: T) => string,
    currentId?: number,
    getId?: (item: T) => number
  ): boolean {
    const normalized = value.trim().toLowerCase();

    return list.some(item =>
      getField(item).toLowerCase() === normalized &&
      (!currentId || (getId && getId(item) !== currentId))
    );
  }

  saveFlavor() {
    if (this.flavorForm.invalid) return;
    const formValue = this.flavorForm.getRawValue();

    const isDuplicate = this.isDuplicate(
      this.flavors(),
      formValue.nombre!,
      f => f.nombre,
      formValue.id_sabor!,
      f => f.id_sabor
    );

    if (isDuplicate) {
      this.toastService.showWarning('Ya existe un sabor con ese nombre');
      return;
    }

    const isEdit = !!formValue.id_sabor;

    const obs = isEdit
      ? this.flavorService.update(formValue.id_sabor!, { nombre: formValue.nombre! })
      : this.flavorService.create({ nombre: formValue.nombre! });

    obs.subscribe({
      next: () => {
        this.toastService.showSuccess(`Sabor ${isEdit ? 'actualizado' : 'creado'}`);
        this.resetFlavorForm();
        this.loadData();
      },
      error: (err) => this.toastService.showError('Error al guardar sabor', err)
    });
  }

  editFlavor(flavor: Sabor) {
    this.editingFlavorId.set(flavor.id_sabor);
    this.flavorForm.patchValue({
      id_sabor: flavor.id_sabor,
      nombre: flavor.nombre
    });
  }

  async deleteFlavor(id: number) {
    const ok = await this.confirmDialogService.confirm('¿Está seguro de eliminar este sabor?');
    if (ok) {
      this.flavorService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Sabor eliminado');
          this.loadData();
        },
        error: (err) => this.toastService.showError('Error al eliminar sabor', err)
      });
    }
  }

  resetFlavorForm() {
    this.editingFlavorId.set(null);
    this.flavorForm.reset();
  }

  saveSweet() {
    if (this.sweetForm.invalid) return;
    const formValue = this.sweetForm.getRawValue();

    const isDuplicate = this.isDuplicate(
      this.sweets(),
      formValue.nombre!,
      s => s.nombre,
      formValue.id_dulzor!,
      s => s.id_dulzor
    );

    if (isDuplicate) {
      this.toastService.showWarning('Ya existe un dulzor con ese nombre');
      return;
    }

    const isEdit = !!formValue.id_dulzor;

    const obs = isEdit
      ? this.sweetService.update(formValue.id_dulzor!, { nombre: formValue.nombre! })
      : this.sweetService.create({ nombre: formValue.nombre! });

    obs.subscribe({
      next: () => {
        this.toastService.showSuccess(`Dulzor ${isEdit ? 'actualizado' : 'creado'}`);
        this.resetSweetForm();
        this.loadData();
      },
      error: (err) => this.toastService.showError('Error al guardar dulzor', err)
    });
  }

  editSweet(sweet: Dulzor) {
    this.editingSweetId.set(sweet.id_dulzor);
    this.sweetForm.patchValue({
      id_dulzor: sweet.id_dulzor,
      nombre: sweet.nombre
    });
  }

  async deleteSweet(id: number) {
    const ok = await this.confirmDialogService.confirm('¿Está seguro de eliminar esta dulzura?');
    if (ok) {
      this.sweetService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Dulzor eliminado');
          this.loadData();
        },
        error: (err) => this.toastService.showError('Error al eliminar dulzor', err)
      });
    }
  }

  resetSweetForm() {
    this.editingSweetId.set(null);
    this.sweetForm.reset();
  }

  savePresentation() {
    if (this.presentationForm.invalid) return;
    const formValue = this.presentationForm.getRawValue();

    const isDuplicate = this.presentations().some(p =>
      p.volumen_ml === formValue.volumen_ml &&
      p.botellas_por_caja === formValue.botellas_por_caja &&
      p.id_presentacion !== formValue.id_presentacion
    );

    if (isDuplicate) {
      this.toastService.showError('Ya existe una presentación con esos valores');
      return;
    }

    const isEdit = !!formValue.id_presentacion;

    const data: Partial<Presentacion> = {
      volumen_ml: formValue.volumen_ml!,
      botellas_por_caja: formValue.botellas_por_caja!
    };

    const obs = isEdit
      ? this.presentationService.update(formValue.id_presentacion!, data)
      : this.presentationService.create(data);

    obs.subscribe({
      next: () => {
        this.toastService.showSuccess(`Presentación ${isEdit ? 'actualizada' : 'creada'}`);
        this.resetPresentationForm();
        this.loadData();
      },
      error: (err) => this.toastService.showError('Error al guardar presentación', err)
    });
  }

  editPresentation(p: Presentacion) {
    this.editingPresentationId.set(p.id_presentacion);
    this.presentationForm.patchValue({
      id_presentacion: p.id_presentacion,
      volumen_ml: p.volumen_ml,
      botellas_por_caja: p.botellas_por_caja
    });
  }

  async deletePresentation(id: number) {
    const ok = await this.confirmDialogService.confirm('¿Está seguro de eliminar esta presentación?');
    if (ok) {
      this.presentationService.delete(id).subscribe({
        next: () => {
          this.toastService.showSuccess('Presentación eliminada');
          this.loadData();
        },
        error: (err) => this.toastService.showError('Error al eliminar presentación', err)
      });
    }
  }

  resetPresentationForm() {
    this.editingPresentationId.set(null);
    this.presentationForm.reset();
  }

  icons = {
    faPlus,
    faEdit,
    faTrash,
    faTimes,
    faSave
  }
}