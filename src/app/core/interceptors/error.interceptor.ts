import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../shared/components/toast/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (req.url.includes('/auth/logout')) {
        return throwError(() => error);
      }

      const mensaje = error.error?.message 
                   || error.message 
                   || JSON.stringify(error);

      if (error.status === 0) {
        toast.showError('Error de conexión', { message: mensaje });
      } else if (error.status >= 500) {
        toast.showError('Error interno del servidor', { message: mensaje });
      } else if (error.status >= 400) {
        toast.showWarning('Solicitud inválida', mensaje);
      }

      return throwError(() => error);
    })
  );
};
