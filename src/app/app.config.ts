import { ApplicationConfig, provideZonelessChangeDetection } from '@angular/core';
import { withInMemoryScrolling } from '@angular/router';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors, withNoXsrfProtection } from '@angular/common/http';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
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
    provideRouter(
      routes,
      withInMemoryScrolling({
        anchorScrolling: 'enabled',
        scrollPositionRestoration: 'enabled'
      })
    ),
    provideHttpClient(
      withInterceptors([errorInterceptor, authInterceptor]),
      withNoXsrfProtection(),
      withFetch(),
    ),
    provideAppInitializer(() => initializeApp())
  ]
};
