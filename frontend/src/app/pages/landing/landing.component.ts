// ============================================================
// pages/landing/landing.component.ts
// Página de bienvenida: muestra el Welcome Dashboard si el
// usuario está logueado, o el marketing + login si no lo está.
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { RouterLink }      from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { AuthService }     from '../../services/auth.service';
import { FinanzasService } from '../../services/finanzas.service';
import { ResultadoFinanciero } from '../../core/models/usuario.model';
import { CentrosAyudaComponent } from '../../components/centros-ayuda/centros-ayuda.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, CentrosAyudaComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit {
  private fb          = inject(FormBuilder);
  authService         = inject(AuthService);
  private finanzasSvc = inject(FinanzasService);

  cargando      = signal(false);
  error         = signal<string | null>(null);
  resultadoHome = signal<ResultadoFinanciero | null>(null);
  cargandoHome  = signal(false);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  ngOnInit(): void {
    if (!this.authService.estaLogueado()) return;
    this.cargandoHome.set(true);
    this.finanzasSvc.obtenerPerfil().subscribe({
      next: (perfil) => {
        if (perfil) {
          this.finanzasSvc.calcular(perfil).subscribe((r) => {
            this.resultadoHome.set(r);
            this.cargandoHome.set(false);
          });
        } else {
          this.cargandoHome.set(false);
        }
      },
      error: () => this.cargandoHome.set(false),
    });
  }

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

  colorPorSalud(estado: string): string {
    const map: Record<string, string> = {
      'Excelente': '#00e5a0',
      'Bueno':     '#4fc3f7',
      'Regular':   '#ffc145',
      'Crítico':   '#ff4f6d',
    };
    return map[estado] ?? '#00e5a0';
  }

  formatearPeso(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(valor);
  }
}
