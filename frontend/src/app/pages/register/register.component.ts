// ============================================================
// pages/register/register.component.ts
// ============================================================

import { AfterViewInit, Component, ElementRef, inject, NgZone, signal, ViewChild } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink }      from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService }     from '../../services/auth.service';

declare const google: any;

const GOOGLE_CLIENT_ID = '713987670018-o7c6onu3a13t1u0ekvg0e0jh3surrgou.apps.googleusercontent.com';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="auth-wrapper">
      <div class="auth-card">
        <div class="auth-card__logo">⚡ BetWise</div>
        <h1 class="auth-card__titulo">Creá tu cuenta</h1>
        <p class="auth-card__subtitulo">
          ¿Ya tenés cuenta? <a routerLink="/login">Ingresá</a>
        </p>

        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="campo-grupo">
            <label class="campo-label" for="nombre">Nombre</label>
            <input id="nombre" type="text" class="campo-input-auth"
                   formControlName="nombre" placeholder="Tu nombre" />
          </div>

          <div class="campo-grupo">
            <label class="campo-label" for="email">Email</label>
            <input id="email" type="email" class="campo-input-auth"
                   formControlName="email" placeholder="tu@email.com" />
            <span class="campo-error"
                  *ngIf="form.get('email')?.invalid && form.get('email')?.touched">
              Email inválido
            </span>
          </div>

          <div class="campo-grupo">
            <label class="campo-label" for="password">Contraseña</label>
            <input id="password" type="password" class="campo-input-auth"
                   formControlName="password" placeholder="Mínimo 6 caracteres" />
            <span class="campo-error"
                  *ngIf="form.get('password')?.invalid && form.get('password')?.touched">
              Mínimo 6 caracteres
            </span>
          </div>

          <p class="mensaje-error" *ngIf="error()">{{ error() }}</p>

          <button type="submit" class="btn btn--primario btn--completo"
                  [disabled]="cargando() || form.invalid">
            {{ cargando() ? 'Creando cuenta...' : 'Crear cuenta gratis →' }}
          </button>
        </form>

        <div class="divisor"><span>o</span></div>

        <div #googleBtn class="google-btn-container"></div>

        <p class="auth-card__legal">
          Al registrarte aceptás nuestros
          <a href="/terminos-condiciones">Términos y Condiciones</a> y la
          <a href="/politica-privacidad">Política de Privacidad</a>.
          Debes ser mayor de 18 años.
        </p>
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
      gap: 18px;
    }
    .auth-card__logo { font-family: var(--fuente-display); font-size: 1.4rem; font-weight: 800; color: var(--color-acento); }
    .auth-card__titulo { font-family: var(--fuente-display); font-size: 1.6rem; font-weight: 800; color: var(--color-texto); margin: 0; }
    .auth-card__subtitulo { font-size: 0.88rem; color: var(--color-texto-suave); margin: 0; }
    .auth-card__subtitulo a { color: var(--color-acento); }
    .auth-card__legal { font-size: 0.72rem; color: var(--color-texto-muy-suave); line-height: 1.6; }
    .auth-card__legal a { color: var(--color-texto-suave); }
    .google-btn-container { width: 100%; display: flex; justify-content: center; }
    .divisor {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--color-texto-muy-suave);
      font-size: 0.78rem;
    }
    .divisor::before, .divisor::after {
      content: '';
      flex: 1;
      height: 1px;
      background: var(--color-borde);
    }
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
    .campo-error { font-size: 0.72rem; color: var(--color-peligro); }
    .mensaje-error {
      font-size: 0.82rem; color: var(--color-peligro);
      background: var(--color-peligro-suave);
      border: 1px solid rgba(255,79,109,0.2);
      border-radius: 8px; padding: 10px 14px;
    }
  `],
})
export class RegisterComponent implements AfterViewInit {
  @ViewChild('googleBtn') googleBtnRef!: ElementRef;

  private fb          = inject(FormBuilder);
  private authService = inject(AuthService);
  private ngZone      = inject(NgZone);

  cargando = signal(false);
  error    = signal<string | null>(null);

  form = this.fb.group({
    nombre:   [''],
    email:    ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngAfterViewInit() {
    this.initGoogleButton();
  }

  private initGoogleButton() {
    if (typeof (window as any)['google'] === 'undefined') {
      setTimeout(() => this.initGoogleButton(), 100);
      return;
    }
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: any) => this.ngZone.run(() => this.handleGoogleResponse(response)),
    });
    google.accounts.id.renderButton(this.googleBtnRef.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      text: 'signup_with',
      locale: 'es',
      width: 340,
    });
  }

  private handleGoogleResponse(response: any) {
    this.cargando.set(true);
    this.error.set(null);
    this.authService.loginConGoogle(response.credential).subscribe({
      error: (err) => {
        const msg = err.status === 0
          ? 'No se puede conectar al servidor.'
          : err?.error?.mensaje || 'Error al registrarse con Google';
        this.error.set(msg);
        this.cargando.set(false);
      },
    });
  }

  submit() {
    if (this.form.invalid) return;
    this.cargando.set(true);
    this.error.set(null);

    this.authService.register(this.form.value as any).subscribe({
      error: (err) => {
        const msg = err.status === 0
          ? 'No se puede conectar al servidor. Asegurate de que el backend esté corriendo.'
          : err?.error?.mensaje || 'Error al crear la cuenta';
        this.error.set(msg);
        this.cargando.set(false);
      },
    });
  }
}
