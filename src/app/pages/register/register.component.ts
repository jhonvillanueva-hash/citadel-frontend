import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="container">
      <h2>Registro</h2>
      
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div>
          <label>Nombres:</label>
          <input type="text" formControlName="nombres">
        </div>
        
        <div>
          <label>Apellidos:</label>
          <input type="text" formControlName="apellidos">
        </div>

        <div>
          <label>Email:</label>
          <input type="email" formControlName="email">
        </div>
        
        <div>
          <label>Contraseña:</label>
          <input type="password" formControlName="hash_contrasena">
        </div>

        @if (errorMessage(); as message) {
          <div class="error">
            {{ message }}
          </div>
        }

        <button type="submit" [disabled]="registerForm.invalid || isLoading()">
          {{ isLoading() ? 'Registrando...' : 'Crear Cuenta' }}
        </button>
      </form>
      
      <p>¿Ya tienes cuenta? <a routerLink="/login">Ingresa aquí</a></p>
    </div>
  `,
  styles: [`
    .container { max-width: 400px; margin: 2rem auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    div { margin-bottom: 10px; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #28a745; color: white; border: none; cursor: pointer; }
    .error { color: red; }
  `]
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  registerForm = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    hash_contrasena: ['', Validators.required]
  });

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);

  onSubmit() {
    if (this.registerForm.invalid) return;

    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora inicia sesión.');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar usuario.');
      }
    });
  }
}