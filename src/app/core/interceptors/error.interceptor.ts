import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../../components/error/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {

  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((error) => {
      if (error.status === 0) {
        toast.showError('Error de conexión', error);
      } else if (error.status >= 500) {
        toast.showError('Error interno del servidor', error);
      } else if (error.status >= 400) {
        toast.showWarning('Solicitud inválida', error?.error?.message);
      }

      return throwError(() => error);
    })
  );
};
