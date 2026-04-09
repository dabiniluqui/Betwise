// ============================================================
// app.routes.ts — Rutas de BetWise Argentina
// Lazy loading por página para mejor performance.
// Las rutas privadas usan authGuard.
// ============================================================

import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/landing/landing.component').then((m) => m.LandingComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
  },
  {
    path: 'salud-financiera',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./pages/salud-financiera/salud-financiera.component').then(
        (m) => m.SaludFinancieraComponent
      ),
  },
  // Redirigir cualquier ruta desconocida al inicio
  { path: '**', redirectTo: '' },
];
