// ============================================================
// core/guards/auth.guard.ts — Clase 4: Autorización
// Protege rutas que requieren sesión activa.
// Si no hay token, redirige al login.
// ============================================================

import { inject }          from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService }     from '../../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  if (authService.estaLogueado()) {
    return true;
  }

  // Guardar la URL a la que intentaba acceder para redirigir después del login
  router.navigate(['/login']);
  return false;
};
