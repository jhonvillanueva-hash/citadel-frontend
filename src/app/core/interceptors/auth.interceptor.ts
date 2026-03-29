import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn, HttpXsrfTokenExtractor } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, switchMap, throwError, filter, take } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const tokenExtractor = inject(HttpXsrfTokenExtractor);

  const isAuthPath = req.url.includes('/auth/login') || req.url.includes('/auth/refresh');
  let authReq = addToken(req, isAuthPath ? null : authService.accessToken, tokenExtractor.getToken());

  return next(authReq).pipe(
    catchError((error) => {
      if (error instanceof HttpErrorResponse) {
        if (req.url.includes('/auth/logout')) {
          authService.handleLogout();
          return throwError(() => error);
        }

        if (
          error.status === 401 &&
          !req.url.includes('/auth/login') &&
          !req.url.includes('/auth/refresh')
        ) {
          return handle401Error(req, next, authService, tokenExtractor);
        }
      }
      return throwError(() => error);
    })
  );
};

function addToken(request: HttpRequest<any>, authToken: string | null, xsrfToken: string | null) {
  let headers = request.headers;  
  if (authToken) {
    headers = headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (xsrfToken && request.method !== 'GET' && request.method !== 'HEAD') {
    const cleanToken = xsrfToken.split('.')[0];
    headers = headers.set('X-XSRF-TOKEN', cleanToken);
  }

  return request.clone({ headers, withCredentials: true });
}

function handle401Error(
  request: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  tokenExtractor: HttpXsrfTokenExtractor
) {
  if (!authService.isRefreshingToken) {
    authService.notifyRefreshTokenStart();

    return authService.refreshToken().pipe(
      switchMap((response) => {
        authService.notifyRefreshTokenSuccess(response.accessToken);
        const newXsrfToken = tokenExtractor.getToken();
        return next(addToken(request, response.accessToken, newXsrfToken));
      }),
      catchError((err) => {
        authService.notifyRefreshTokenError(err);
        return throwError(() => err);
      })
    );
  }

  else {
    return authService.refreshTokenStream$.pipe(
      filter(token => token !== null),
      take(1),
      switchMap(token => {
        const currentXsrfToken = tokenExtractor.getToken();
        return next(addToken(request, token!, currentXsrfToken));
      })
    );
  }
}