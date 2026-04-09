// ============================================================
// pages/login/login.component.ts
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink }      from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService }     from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-card__logo">⚡ BetWise</div>
        <h1 class="auth-card__titulo">Ingresá a tu cuenta</h1>
        <p class="auth-card__subtitulo">
          ¿No tenés cuenta? <a routerLink="/register">Registrate gratis</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="campo-grupo">
            <label class="campo-label" for="email">Email</label>
            <input id="email" type="email" class="campo-input-auth"
                   formControlName="email" placeholder="tu@email.com" />
          </div>

          <div class="campo-grupo">
            <label class="campo-label" for="password">Contraseña</label>
            <input id="password" type="password" class="campo-input-auth"
                   formControlName="password" placeholder="Tu contraseña" />
          </div>

          <p class="mensaje-error" *ngIf="error()">{{ error() }}</p>

          <button type="submit" class="btn btn--primario btn--completo"
                  [disabled]="cargando() || form.invalid">
            {{ cargando() ? 'Ingresando...' : 'Ingresar →' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper {
      min-height: calc(100vh - 68px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      background: var(--color-fondo);
    }
    .auth-card {
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: 20px;
      padding: 40px;
      width: 100%;
      max-width: 420px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .auth-card__logo {
      font-family: var(--fuente-display);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--color-acento);
    }
    .auth-card__titulo {
      font-family: var(--fuente-display);
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--color-texto);
      margin: 0;
    }
    .auth-card__subtitulo { font-size: 0.88rem; color: var(--color-texto-suave); margin: 0; }
    .auth-card__subtitulo a { color: var(--color-acento); }
    .campo-grupo { display: flex; flex-direction: column; gap: 6px; }
    .campo-label { font-size: 0.78rem; color: var(--color-texto-suave); font-weight: 500; }
    .campo-input-auth {
      background: rgba(255,255,255,0.04);
      border: 1px solid var(--color-borde);
      border-radius: 10px;
      color: var(--color-texto);
      font-family: var(--fuente-cuerpo);
      font-size: 0.9rem;
      padding: 12px 14px;
      outline: none;
      transition: border-color 0.2s;
      width: 100%;
    }
    .campo-input-auth:focus { border-color: var(--color-acento); }
    .mensaje-error {
      font-size: 0.82rem;
      color: var(--color-peligro);
      background: var(--color-peligro-suave);
      border: 1px solid rgba(255,79,109,0.2);
      border-radius: 8px;
      padding: 10px 14px;
    }
  `],
})
export class LoginComponent {
  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);

  cargando = signal(false);
  error    = signal<string | null>(null);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit() {
    if (this.form.invalid) return;
    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.form.value as any).subscribe({
      error: (err) => {
        this.error.set(err?.error?.mensaje || 'Credenciales inválidas');
        this.cargando.set(false);
      },
    });
  }
}
