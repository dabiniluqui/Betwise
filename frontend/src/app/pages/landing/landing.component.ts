// ============================================================
// pages/landing/landing.component.ts
// Página de inicio: descripción de la app + formulario de login.
// ============================================================

import { Component, inject, signal } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink }      from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService }     from '../../services/auth.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent {
  private fb  = inject(FormBuilder);
  authService = inject(AuthService);

  cargando = signal(false);
  error    = signal<string | null>(null);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.cargando.set(true);
    this.error.set(null);

    this.authService.login(this.form.value as any).subscribe({
      error: (err) => {
        const msg = err.status === 0
          ? 'No se puede conectar al servidor. Asegurate de que el backend esté corriendo.'
          : err?.error?.mensaje || 'Credenciales inválidas';
        this.error.set(msg);
        this.cargando.set(false);
      },
    });
  }
}
