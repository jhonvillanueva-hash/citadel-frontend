import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SaborService } from '../../../../data/services/sabor.service';
import { PresentacionService } from '../../../../data/services/presentacion.service';
import { VinoService } from '../../../../data/services/vino.service';
import { PrecioService } from '../../../../data/services/precio.service';
import { Precio, Sabor } from '../../../../data/models/api.models';
import { Presentacion } from '../../../../data/models/api.models';

@Component({
  selector: 'app-admin-wines-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './wines-create.html',
  styles: [''],
})
export class WinesCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private vinoService = inject(VinoService);
  private saborService = inject(SaborService);
  private presentacionService = inject(PresentacionService);
  private precioService = inject(PrecioService);
  private cdr = inject(ChangeDetectorRef);

  sabores: Sabor[] = [];
  presentaciones: Presentacion[] = [];

  vinoForm!: FormGroup;

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  selectedFile: File | null = null;

  ngOnInit(): void {
    this.initForm();
    this.cargarSabores();
    this.cargarPresentaciones();
  }

  private initForm(): void {
    this.vinoForm = this.fb.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      volumen_ml: [750, [Validators.required, Validators.min(1)]],
      stock: [0, [Validators.required, Validators.min(0)]],
      estado: ['D', Validators.required],
      id_sabor: ['', Validators.required],
      id_presentacion: ['', Validators.required],
      precioMenor: this.fb.group({
        cantidad_minima: [1, [Validators.required, Validators.min(1)]],
        precio: ['', [Validators.required, Validators.min(0)]],
      }),
      precioMayor: this.fb.group({
        cantidad_minima: [24, [Validators.required, Validators.min(1)]],
        precio: ['', [Validators.required, Validators.min(0)]],
      }),
    });
  }

  private cargarSabores(): void {
    this.saborService.getAll().subscribe({
      next: (data) => (this.sabores = data),
      error: (err) => console.error('Error al cargar sabores', err),
    });
  }

  private cargarPresentaciones(): void {
    this.presentacionService.getAll().subscribe({
      next: (data) => (this.presentaciones = data),
      error: (err) => console.error('Error al cargar presentaciones', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  onSubmit(): void {
    if (this.vinoForm.invalid) {
      this.vinoForm.markAllAsTouched();
      return;
    }

    if (!this.selectedFile) {
      this.errorMessage = 'Debes seleccionar una imagen principal.';
      this.cdr.detectChanges();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formData = new FormData();
    formData.append('nombre', this.vinoForm.value.nombre);
    formData.append('descripcion', this.vinoForm.value.descripcion);
    formData.append('volumen_ml', this.vinoForm.value.volumen_ml.toString());
    formData.append('stock', this.vinoForm.value.stock.toString());
    formData.append('estado', this.vinoForm.value.estado);
    formData.append('id_sabor', this.vinoForm.value.id_sabor.toString());
    formData.append(
      'id_presentacion',
      this.vinoForm.value.id_presentacion.toString()
    );
    formData.append('url_img_principal', this.selectedFile);

    this.vinoService.createWithImage(formData).subscribe({
      next: (vinoCreado) => {
        const precioMenor: Partial<Precio> = {
          id_vino: vinoCreado.id_vino,
          tipo_venta: 'mn',
          cantidad_minima: this.vinoForm.value.precioMenor.cantidad_minima,
          precio: this.vinoForm.value.precioMenor.precio,
        };
        const precioMayor: Partial<Precio> = {
          id_vino: vinoCreado.id_vino,
          tipo_venta: 'my',
          cantidad_minima: this.vinoForm.value.precioMayor.cantidad_minima,
          precio: this.vinoForm.value.precioMayor.precio,
        };

        this.precioService.create(precioMenor).subscribe({
          next: () => {
            this.precioService.create(precioMayor).subscribe({
              next: () => {
                this.successMessage = 'Vino y precios registrados con éxito.';
                this.vinoForm.reset({
                  volumen_ml: 750,
                  stock: 0,
                  estado: 'D',
                  precioMenor: { cantidad_minima: 1, precio: 100 },
                  precioMayor: { cantidad_minima: 24, precio: 90 },
                });
                this.selectedFile = null;
                this.loading = false;
              },
              error: (err) => {
                this.errorMessage = 'Error al crear el precio al por mayor: ' + err.message;
                this.loading = false;
                this.cdr.detectChanges();
              },
            });
          },
          error: (err) => {
            this.errorMessage = 'Error al crear el precio al por menor: ' + err.message;
            this.loading = false;
            this.cdr.detectChanges();
          },
        });
      },
      error: (err) => {
        setTimeout(() => {
          this.errorMessage = 'Error al crear el vino: ' + err.message;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }
}