import { Component, inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CuponService } from '../../../../data/services/cupon.service';
import { CommonModule } from '@angular/common';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-coupons-create',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './coupons-create.html'
})
export class CouponsCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  couponService = inject(CuponService);
  toastService = inject(ToastService);
  private router = inject(Router);

  form = this.fb.nonNullable.group({
    codigo: [123456, [Validators.required, Validators.min(1)]],
    tipo_descuento: ['F' as 'F' | 'P', [Validators.required]],
    descuento: [1, [Validators.required, Validators.min(1)]],
    monto_minimo: [1, [Validators.required, Validators.min(1)]],
    fecha_inicio: [this.getToday(), [Validators.required]],
    fecha_fin: ['', [Validators.required]],
    activo: [true],
  }, { validators: this.dateValidator });

  ngOnInit() {
    this.form.get('tipo_descuento')?.valueChanges.subscribe(tipo => {
      const descuentoControl = this.form.get('descuento');

      if (!descuentoControl) return;

      if (tipo === 'P') {
        descuentoControl.setValidators([
          Validators.required,
          Validators.min(1),
          Validators.max(99)
        ]);
      } else {
        descuentoControl.setValidators([
          Validators.required,
          Validators.min(1)
        ]);
      }

      descuentoControl.updateValueAndValidity();
    });
  }

  dateValidator(control: AbstractControl): ValidationErrors | null {
    const inicio = control.get('fecha_inicio')?.value;
    const fin = control.get('fecha_fin')?.value;

    if (inicio && fin && new Date(fin) < new Date(inicio)) {
      return { fechaInvalida: true };
    }
    return null;
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastService.showError('Formulario incompleto', 'Corrija los campos marcados');
      return;
    }

    const value = this.form.getRawValue();

    const payload = {
      ...value,
      fecha_inicio: new Date(value.fecha_inicio),
      fecha_fin: new Date(value.fecha_fin),
    };

    this.couponService.create(payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Cupon creado correctamente.');
        this.form.reset({ tipo_descuento: 'F', activo: true, monto_minimo: 1, descuento: 1 });
        this.router.navigate(['/admin/coupons']);
      },
      error: (err) => {
        const e = err.error;

        switch (e.code) {
          case 'DUPLICATE_VALUE':
            this.toastService.showError('El código ya existe', 'Intente con uno diferente');
            break;

          case 'VALIDATION_ERROR':
            this.toastService.showError('Datos inválidos', 'Revise los campos');
            break;

          default:
            this.toastService.showError('Error inesperado', e);
        }
      }
    });
  }

  get isPorcentaje() {
    return this.form.get('tipo_descuento')?.value === 'P';
  }

  private getToday(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  generateCodigo() {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.form.get('codigo')?.setValue(random);
  }

  icons = {
    faWandMagicSparkles,
  }

}