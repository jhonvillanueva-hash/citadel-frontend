import { Component, effect, inject, signal, PLATFORM_ID } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { VinoService } from '../../../data/services/models/vino.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformServer } from '@angular/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  private vinoService = inject(VinoService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  public isServer = isPlatformServer(this.platformId);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  publicData = signal<any>(null);
  currentUser = this.authService.currentUser;
  loginForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    contrasena: ['', [Validators.required, Validators.minLength(6)]]
  });

  constructor() {
    effect(() => {
      if (this.currentUser() && !this.isLoading()) {
        const url = this.authService.getRedirectUrl();
        this.router.navigate([url]);
      }
    });
  }

  get hasLocalSession(): boolean {
    return this.authService.hasLoggedInFlag();
  }

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
