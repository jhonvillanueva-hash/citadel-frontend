import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs';

export const debugInterceptor: HttpInterceptorFn = (req, next) => {

  console.log("===== HTTP REQUEST =====");
  console.log("URL:", req.url);
  console.log("Method:", req.method);
  console.log("Headers:", req.headers.keys().map(k => ({ [k]: req.headers.get(k) })));
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("withCredentials:", req.withCredentials);

  if (req.body instanceof FormData) {
    console.log("---- FormData content ----");
    req.body.forEach((v: any, k: string) => console.log(k, v));
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          console.log("===== HTTP RESPONSE =====");
          console.log("Status:", event.status);
          console.log("Body:", event.body);
          console.log("Headers:", event.headers);
        }
      },
      error: (err) => {
        console.error("===== HTTP ERROR =====");
        console.error(err);
      }
    })
  );
};