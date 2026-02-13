import { Component, inject, PLATFORM_ID, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  private router = inject(Router);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  private platformId = inject(PLATFORM_ID);
  public isServer = isPlatformServer(this.platformId);

  registerForm = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    hash_contrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  get hasLocalSession(): boolean {
    return this.authService.hasLoggedInFlag();
  }

  isInvalid(controlName: string): boolean {
    const control = this.registerForm.get(controlName);
    return !!(control && control.invalid && control.touched);
  }

  inputClasses(controlName: string) {
    return this.isInvalid(controlName)
      ? 'border-red-500 ring-1 ring-red-500 focus:ring-red-500'
      : 'border-gray-300 focus:ring-secondary focus:border-secondary';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        alert('Registro exitoso. Ahora inicia sesión.');
        this.router.navigate(['/login']);
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMessage.set('Error al registrar usuario.');
      }
    });
  }
}
