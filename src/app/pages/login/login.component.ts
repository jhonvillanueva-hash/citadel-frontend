import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { VinoService } from '../../core/services/models/vino.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  template: `
    <div class="container">
      <h2>Iniciar Sesión</h2>
      
      <form [formGroup]="loginForm" (ngSubmit)="onSubmit()">
        <div>
          <label>Email:</label>
          <input type="email" formControlName="email" placeholder="correo@gmail.com">
        </div>
        
        <div>
          <label>Contraseña:</label>
          <input type="password" formControlName="contrasena" placeholder="****">
        </div>

        @if (errorMessage(); as message) {
          <div class="error">
            {{ message }}
          </div>
        }

        <button type="submit" [disabled]="loginForm.invalid || isLoading()">
          {{ isLoading() ? 'Cargando...' : 'Ingresar' }}
        </button>
      </form>

      <div class="test-zone" style="margin-top: 30px; border-top: 1px dashed #ccc; padding-top: 20px;">
        <h3>Test Público</h3>
        <button type="button" (click)="testPublicApi()" class="btn-secondary">
            Obtener Vinos (GET /public/vinos)
        </button>
        
        @if (publicData()) {
          <div style="background: #f0f0f0; padding: 10px; margin-top: 10px; border-radius: 4px;">
            <pre>{{ publicData() | json }}</pre>
          </div>
        }
      </div>
      
      <p>¿No tienes cuenta? <a routerLink="/register">Regístrate aquí</a></p>
    </div>
  `,
  styles: [`
    .container { max-width: 400px; margin: 2rem auto; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
    div { margin-bottom: 15px; }
    input { width: 100%; padding: 8px; box-sizing: border-box; }
    button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; cursor: pointer; }
    button:disabled { background: #ccc; }
    .error { color: red; margin-bottom: 10px; font-size: 0.9em; }
  `]
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private vinoService = inject(VinoService);
  private router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required]]
  });

  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  publicData = signal<any>(null);

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.login(this.loginForm.getRawValue() as any).subscribe({
      next: () => {
        const url = this.authService.getRedirectUrl();
        this.router.navigate([url]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Credenciales incorrectas');
        console.error(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  testPublicApi() {
    this.vinoService.getAll().subscribe({
      next: (data) => {
        this.publicData.set(data);
      },
      error: (err) => alert('Error obteniendo vinos públicos')
    });
  }
}
