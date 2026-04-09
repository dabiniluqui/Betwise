// ============================================================
// pages/salud-financiera/salud-financiera.component.ts
// Panel privado: perfil guardado + registro mensual completo
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { FinanzasService } from '../../services/finanzas.service';
import {
  PerfilFinanciero,
  ResultadoFinanciero,
  RegistroMensual,
  ProgresoMensual,
} from '../../core/models/usuario.model';

@Component({
  selector: 'app-salud-financiera',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './salud-financiera.component.html',
  styleUrls: ['./salud-financiera.component.css'],
})
export class SaludFinancieraComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private finanzasSvc   = inject(FinanzasService);

  // ── Estado del perfil ────────────────────────────────────
  resultado        = signal<ResultadoFinanciero | null>(null);
  guardandoPerfil  = signal(false);
  perfilGuardado   = signal(false);
  errorPerfil      = signal<string | null>(null);

  // ── Estado del registro mensual ──────────────────────────
  registro         = signal<RegistroMensual | null>(null);
  progreso         = signal<ProgresoMensual | null>(null);
  cargandoRegistro = signal(true);
  agregandoEntrada = signal(false);
  errorEntrada     = signal<string | null>(null);
  entradaExitosa   = signal(false);

  mesActual  = new Date().getMonth() + 1;
  anioActual = new Date().getFullYear();
  nombreMes  = new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  // ── Formulario de perfil ─────────────────────────────────
  formPerfil = this.fb.group({
    sueldo_neto:           [null, [Validators.required, Validators.min(1)]],
    gasto_alquiler:        [0],
    gasto_servicios:       [0],
    gasto_transporte:      [0],
    gasto_cuotas:          [0],
    gasto_alimentacion:    [0],
    gasto_entretenimiento: [0],
    gasto_otros:           [0],
    nivel_ahorro:          ['recomendado_20'],
  });

  // ── Formulario de nueva entrada ──────────────────────────
  formEntrada = this.fb.group({
    monto:       [null, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.required],
  });

  ngOnInit(): void {
    this.cargarPerfil();
    this.cargarRegistroMensual();
  }

  private cargarPerfil(): void {
    this.finanzasSvc.obtenerPerfil().subscribe({
      next: (perfil) => {
        if (perfil) {
          this.formPerfil.patchValue(perfil as any);
          // Calcular resultado con el perfil guardado
          this.finanzasSvc.calcular(perfil).subscribe((r) => this.resultado.set(r));
        }
      },
    });
  }

  private cargarRegistroMensual(): void {
    this.finanzasSvc.obtenerRegistroMensual(this.anioActual, this.mesActual).subscribe({
      next: ({ registro, progreso }) => {
        this.registro.set(registro);
        this.progreso.set(progreso);
        this.cargandoRegistro.set(false);
      },
      error: () => this.cargandoRegistro.set(false),
    });
  }

  guardarPerfil(): void {
    if (this.formPerfil.invalid) return;
    this.guardandoPerfil.set(true);
    this.errorPerfil.set(null);

    this.finanzasSvc.guardarPerfil(this.formPerfil.value as unknown as PerfilFinanciero).subscribe({
      next: ({ resultado }) => {
        this.resultado.set(resultado);
        this.perfilGuardado.set(true);
        this.guardandoPerfil.set(false);
        // Recargar registro con el nuevo límite
        this.cargarRegistroMensual();
        setTimeout(() => this.perfilGuardado.set(false), 3000);
      },
      error: () => {
        this.errorPerfil.set('Error al guardar. Intentá de nuevo.');
        this.guardandoPerfil.set(false);
      },
    });
  }

  agregarEntrada(): void {
    if (this.formEntrada.invalid) return;
    this.agregandoEntrada.set(true);
    this.errorEntrada.set(null);

    const { monto, descripcion } = this.formEntrada.value;

    this.finanzasSvc.agregarEntrada(Number(monto), descripcion as string).subscribe({
      next: ({ registro, progreso }) => {
        this.registro.set(registro);
        this.progreso.set(progreso);
        this.formEntrada.reset();
        this.entradaExitosa.set(true);
        this.agregandoEntrada.set(false);
        setTimeout(() => this.entradaExitosa.set(false), 3000);
      },
      error: () => {
        this.errorEntrada.set('Error al registrar. Intentá de nuevo.');
        this.agregandoEntrada.set(false);
      },
    });
  }

  // ── Helpers ──────────────────────────────────────────────
  formatearPeso(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(valor);
  }

  formatearFecha(iso: string): string {
    return new Date(iso).toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  colorAlerta(alerta: string): string {
    const map: Record<string, string> = {
      dentro_del_limite: 'alerta--verde',
      mitad_alcanzada:   'alerta--amarilla',
      limite_proximo:    'alerta--naranja',
      limite_superado:   'alerta--roja',
    };
    return map[alerta] || '';
  }

  mensajeAlerta(alerta: string): string {
    const map: Record<string, string> = {
      dentro_del_limite: '✅ Estás dentro de tu límite. ¡Seguí así!',
      mitad_alcanzada:   '⚠️ Ya usaste la mitad de tu límite mensual.',
      limite_proximo:    '🔶 Estás cerca del límite. Tené cuidado.',
      limite_superado:   '🚨 Superaste tu límite mensual recomendado.',
    };
    return map[alerta] || '';
  }
}
