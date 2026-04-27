import { Component, effect, inject, signal, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformServer } from '@angular/common';
import { environment } from '../../../../environments/environment';

declare const google: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './login.html'
})
export class LoginComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
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

    ngAfterViewInit() {
    if (this.isServer) return;

    const waitForGoogle = setInterval(() => {
      if ((window as any).google && document.getElementById('googleBtn')) {
        clearInterval(waitForGoogle);

        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: this.handleCredentialResponse.bind(this)
        });

        google.accounts.id.renderButton(
          document.getElementById('googleBtn')!,
          {
            theme: 'outline',
            size: 'large',
            width: document.getElementById('googleBtn')!.offsetWidth,
          }
        );

        google.accounts.id.prompt();
      }
    }, 100);
  }

  sendTokenToBackend(idToken: string) {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        const url = this.authService.getRedirectUrl();
        this.router.navigate([url]);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('Error con Google login');
        console.error(err);
      },
      complete: () => {
        this.isLoading.set(false);
      }
    });
  }

  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    this.sendTokenToBackend(idToken);
  }
}
