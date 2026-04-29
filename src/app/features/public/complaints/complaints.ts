import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReclamoService } from '../../../data/services/reclamo.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-complaints',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
  <div class="min-h-screen bg-[#0d1b22] text-white flex items-center justify-center px-4 py-10">

    <div class="absolute inset-0 opacity-30 pointer-events-none">
      <div class="w-full h-full bg-gradient-to-br from-[#11212a] via-[#0d1b22] to-[#12242d]"></div>
    </div>

    <div class="relative w-full max-w-2xl bg-[#12242d] border border-[#162b36] rounded-2xl shadow-2xl p-8">

      <div class="text-center mb-8">
        <img src="/img/logo.png" class="h-10 mx-auto mb-3" />
        <h1 class="text-2xl font-semibold">Libro de Reclamaciones</h1>
        <p class="text-sm text-gray-400 mt-1">
          Registra tu solicitud de forma rápida y segura
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div class="md:col-span-2 flex items-center gap-3">
            <label class="text-sm text-gray-300">
              Código de pedido (opcional)
            </label>

            <input
              type="text"
              formControlName="id_pedido"
              maxlength="4"
              inputmode="numeric"
              class="w-24 bg-[#0d1b22] border border-[#162b36] rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
            >
          </div>

          <div>
            <label class="text-sm text-gray-300">DNI</label>
            <input formControlName="dni" (blur)="markTouched('dni')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('dni')">
          </div>

          <div>
            <label class="text-sm text-gray-300">Teléfono</label>
            <input formControlName="telefono" (blur)="markTouched('telefono')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('telefono')">
          </div>

          <div>
            <label class="text-sm text-gray-300">Nombres</label>
            <input formControlName="nombres" (blur)="markTouched('nombres')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('nombres')">
          </div>

          <div>
            <label class="text-sm text-gray-300">Apellidos</label>
            <input formControlName="apellidos" (blur)="markTouched('apellidos')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('apellidos')">
          </div>

          <div class="md:col-span-2">
            <label class="text-sm text-gray-300">Email</label>
            <input formControlName="email" (blur)="markTouched('email')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('email')">
          </div>

          <div>
            <label class="text-sm text-gray-300">Tipo</label>
            <select formControlName="tipo" (blur)="markTouched('tipo')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('tipo')">
              <option value="">Seleccione</option>
              <option value="R">Reclamo</option>
              <option value="Q">Queja</option>
            </select>
          </div>

          <div>
            <label class="text-sm text-gray-300">Motivo</label>
            <input formControlName="motivo" (blur)="markTouched('motivo')"
              class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-2.5
              focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
              [ngClass]="inputClass('motivo')">
          </div>

        </div>

        <div>
          <label class="text-sm text-gray-300">Detalles</label>
          <textarea rows="4" formControlName="detalles" (blur)="markTouched('detalles')"
            class="mt-1 w-full bg-[#0d1b22] border rounded-xl px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-[#c35b64]"
            [ngClass]="inputClass('detalles')"></textarea>
        </div>

        <button type="submit" [disabled]="form.invalid"
          class="w-full bg-[#c35b64] hover:bg-[#a94e56] transition
          text-white py-3 rounded-xl font-medium disabled:opacity-40">
          Enviar reclamo
        </button>

      </form>
    </div>
  </div>
  `
})
export class ComplaintsComponent {

  complaintService = inject(ReclamoService);
  toastService = inject(ToastService);
  private router = inject(Router);

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      id_pedido: [null],
      dni: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8)]],
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      tipo: ['', Validators.required],
      motivo: ['', Validators.required],
      detalles: ['', Validators.required]
    });
  }

  isInvalid(field: string) {
    const c = this.form.get(field);
    return c && c.invalid && c.touched;
  }

  markTouched(field: string) {
    this.form.get(field)?.markAsTouched();
  }

  inputClass(field: string) {
    const c = this.form.get(field);
    return {
      'border-[#162b36]': !c?.touched,
      'border-red-500': c?.invalid && c?.touched,
      'border-green-500': c?.valid && c?.touched
    };
  }

  onSubmit() {
    if (this.form.valid) {
      this.complaintService.create(this.form.value).subscribe({
        next: () => {
          this.toastService.showSuccess('Reclamo enviado correctamente');
          this.form.reset();
          setTimeout(() => this.router.navigate(['/']), 3000);
        },
        error: () => this.toastService.showError('Error al enviar el reclamo')
      });
    } else {
      this.toastService.showError('Complete los campos obligatorios');
      this.form.markAllAsTouched();
    }
  }
}