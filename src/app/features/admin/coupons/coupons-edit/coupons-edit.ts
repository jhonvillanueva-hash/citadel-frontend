import { Component, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CuponService } from '../../../../data/services/cupon.service';
import { CommonModule } from '@angular/common';
import { faWandMagicSparkles } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-admin-coupons-edit',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, FontAwesomeModule],
  templateUrl: './coupons-edit.html'
})
export class CouponsEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  couponService = inject(CuponService);
  toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  idCupon: string | null = null;

  form = this.fb.nonNullable.group({
    codigo: [{ value: 0, disabled: true }, [Validators.required, Validators.min(1)]],
    tipo_descuento: ['F' as 'F' | 'P', [Validators.required]],
    descuento: [0, [Validators.required, Validators.min(1)]],
    monto_minimo: [0, [Validators.required, Validators.min(1)]],
    fecha_inicio: ['', [Validators.required]],
    fecha_fin: ['', [Validators.required]],
    activo: [true],
  }, { validators: this.dateValidator });

  ngOnInit() {
    this.idCupon = this.route.snapshot.paramMap.get('id');
    if (this.idCupon) {
      this.loadCoupon(this.idCupon);
    }

    this.form.get('tipo_descuento')?.valueChanges.subscribe(tipo => {
      this.updateDescuentoValidators(tipo);
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

  loadCoupon(id: string) {
    this.loading.set(true);
    this.couponService.getById(id).subscribe({
      next: (coupon) => {
        this.form.patchValue({
          codigo: coupon.codigo,
          tipo_descuento: coupon.tipo_descuento,
          descuento: coupon.descuento,
          monto_minimo: coupon.monto_minimo,
          fecha_inicio: this.formatDate(coupon.fecha_inicio),
          fecha_fin: this.formatDate(coupon.fecha_fin),
          activo: coupon.activo,
        });
        this.updateDescuentoValidators(coupon.tipo_descuento);
        this.loading.set(false);
      },
      error: (err) => {
        this.toastService.showError('Error al cargar el cupón', err);
        this.router.navigate(['/admin/coupons']);
      }
    });
  }

  updateDescuentoValidators(tipo: 'F' | 'P') {
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
  }

  onSubmit() {
    if (this.form.invalid || !this.idCupon) {
      this.form.markAllAsTouched();
      this.toastService.showError('Formulario incompleto', 'Corrija los campos marcados');
      return;
    }

    // Get all values including disabled ones if needed, but we explicitly want to exclude 'codigo'
    const { codigo, ...updateData } = this.form.getRawValue();
    
    const payload = {
      ...updateData,
      fecha_inicio: new Date(updateData.fecha_inicio),
      fecha_fin: new Date(updateData.fecha_fin),
    };

    this.couponService.patch(this.idCupon, payload).subscribe({
      next: () => {
        this.toastService.showSuccess('Cupón actualizado correctamente.');
        this.router.navigate(['/admin/coupons']);
      },
      error: (err) => {
        const e = err.error;
        this.toastService.showError('Error al actualizar', e?.message || 'Error inesperado');
      }
    });
  }

  get isPorcentaje() {
    return this.form.get('tipo_descuento')?.value === 'P';
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  generateCodigo() {
    const random = Math.floor(100000 + Math.random() * 900000);
    this.form.get('codigo')?.setValue(random);
  }

  goBack() {
    this.router.navigate(['/admin/coupons']);
  }

  icons = {
    faWandMagicSparkles,
  }
}