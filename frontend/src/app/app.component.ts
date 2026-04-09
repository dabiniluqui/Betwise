// ============================================================
// app.component.ts — Componente raíz
// Contiene la navbar global y el router-outlet.
// ============================================================

import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService }  from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="navbar">
      <div class="navbar__contenedor">
        <a routerLink="/" class="navbar__logo">
          <span class="navbar__logo-icono">⚡</span>
          Bet<span class="navbar__logo-acento">Wise</span>
        </a>

        <nav class="navbar__menu" aria-label="Navegación principal">
          <a routerLink="/"                 routerLinkActive="activo" [routerLinkActiveOptions]="{exact:true}">En Vivo</a>
          <a routerLink="/salud-financiera" routerLinkActive="activo" *ngIf="authService.estaLogueado()">Mi Salud Financiera</a>
          <a routerLink="/dashboard"        routerLinkActive="activo" *ngIf="authService.estaLogueado()">Mi Panel</a>
        </nav>

        <div class="navbar__acciones">
          <ng-container *ngIf="!authService.estaLogueado(); else logueado">
            <a routerLink="/login"    class="btn btn--ghost">Ingresar</a>
            <a routerLink="/register" class="btn btn--primario">Registrarse</a>
          </ng-container>
          <ng-template #logueado>
            <span class="navbar__bienvenida">Hola, {{ authService.usuario()?.nombre || 'usuario' }}</span>
            <button class="btn btn--ghost" (click)="authService.logout()">Salir</button>
          </ng-template>
        </div>
      </div>
    </header>

    <main>
      <router-outlet />
    </main>

    <footer class="footer">
      <div class="footer__contenedor">
        <p class="footer__legal">
          🎗️ <strong>Juego Responsable:</strong> Las apuestas son solo para mayores de 18 años.
          Si necesitás ayuda llamá al <strong>0800-XXX-XXXX</strong> (gratuito 24/7).
        </p>
        <p class="footer__copy">© {{ anio }} BetWise Argentina · Datos por API-Football</p>
      </div>
    </footer>
  `,
})
export class AppComponent {
  authService = inject(AuthService);
  anio = new Date().getFullYear();
}
