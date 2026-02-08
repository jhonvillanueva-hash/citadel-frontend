import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { provideAppInitializer, inject } from '@angular/core';
import { AuthService } from './core/services/auth.service';
import { catchError, of } from 'rxjs';

function initializeApp() {
  const authService = inject(AuthService);

  if (authService.hasLoggedInFlag()) {
    return authService.refreshToken().pipe(
      catchError((err) => {
        console.error('Refresh falló: ', err);
        return of(null);
      })
    );
  }

  return of(null);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor]),
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withFetch(),
    ),
    provideAppInitializer(() => initializeApp()) 
  ]
};