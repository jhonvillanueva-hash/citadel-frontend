import { Component, inject, PLATFORM_ID, signal, AfterViewInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule, isPlatformServer } from '@angular/common';
import { environment } from '../../../../environments/environment';
import { UsuarioLoggedService } from '../../../data/services/usuarioLogged.service';
import { switchMap, finalize } from 'rxjs';

declare const google: any;

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './register.html'
})
export class RegisterComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  public authService = inject(AuthService);
  currentUser = this.authService.currentUser;
  private router = inject(Router);
  private usuarioLoggedService = inject(UsuarioLoggedService);
  errorMessage = signal<string | null>(null);
  isLoading = signal(false);
  private platformId = inject(PLATFORM_ID);
  public isServer = isPlatformServer(this.platformId);

  registerForm = this.fb.group({
    nombres: ['', Validators.required],
    apellidos: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    hash_contrasena: ['', [Validators.required, Validators.minLength(6)]],
    termsAccepted: [false, Validators.requiredTrue]
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
      : 'border-gray-300 focus:ring-[#0e0d12] focus:border-[#0e0d12]';
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    if (!this.registerForm.get('termsAccepted')?.value) {
      this.errorMessage.set(
        'Debes aceptar los términos y condiciones para registrarte'
      );
      return;
    }

    this.isLoading.set(true);
    this.authService.register(this.registerForm.getRawValue()).pipe(
      switchMap(() => {
        const formValue = this.registerForm.getRawValue();
        const email = formValue.email || '';
        const hash_contrasena = formValue.hash_contrasena || '';
        return this.authService.login({ email, contrasena: hash_contrasena });
      }),
      switchMap(() => this.usuarioLoggedService.loadProfile()),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: () => {
        const url = this.authService.getRedirectUrl();
        this.router.navigate([url]);
      },
      error: (err) => {
        if (err.status === 409 && err.error?.code === 'EMAIL_EXISTS') {
          this.errorMessage.set('Este correo electrónico ya está registrado.');
          return;
        }
        this.errorMessage.set('Error al registrar usuario.');
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

    this.authService.loginWithGoogle(idToken)
      .pipe(
        switchMap(() => this.usuarioLoggedService.loadProfile()),
        finalize(() => this.isLoading.set(false))
      )
      .subscribe({
        next: () => {
          const url = this.authService.getRedirectUrl();
          this.router.navigate([url]);
        },
        error: (err) => {
          this.errorMessage.set('Error con Google login');
          console.error(err);
        }
      });
  }

  handleCredentialResponse(response: any) {
    const idToken = response.credential;
    this.sendTokenToBackend(idToken);
  }
}
