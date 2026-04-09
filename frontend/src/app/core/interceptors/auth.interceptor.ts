// ============================================================
// core/interceptors/auth.interceptor.ts — Clase 4: Auth
// Intercepta CADA request HTTP saliente y adjunta el JWT
// automáticamente si el usuario está logueado.
// ============================================================

import { HttpInterceptorFn } from '@angular/common/http';
import { inject }            from '@angular/core';
import { AuthService }       from '../../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token       = authService.obtenerToken();

  if (token) {
    const reqConToken = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(reqConToken);
  }

  return next(req);
};
