// ============================================================
// pages/salud-financiera/salud-financiera.component.ts
// Panel privado: perfil guardado + registro mensual completo
// ============================================================

import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule }    from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FinanzasService } from '../../services/finanzas.service';
import {
  PerfilFinanciero,
  ResultadoFinanciero,
  RegistroMensual,
  ProgresoMensual,
  EntradaMensual,
} from '../../core/models/usuario.model';

const EJEMPLOS: Record<string, Partial<PerfilFinanciero>> = {
  basico: {
    sueldo_neto: 400000, gasto_alquiler: 120000, gasto_servicios: 30000,
    gasto_transporte: 30000, gasto_cuotas: 0,
    gasto_alimentacion: 80000, gasto_entretenimiento: 15000, gasto_otros: 20000,
    nivel_ahorro: 'recomendado_20',
  },
  estandar: {
    sueldo_neto: 800000, gasto_alquiler: 250000, gasto_servicios: 50000,
    gasto_transporte: 50000, gasto_cuotas: 30000,
    gasto_alimentacion: 150000, gasto_entretenimiento: 40000, gasto_otros: 50000,
    nivel_ahorro: 'recomendado_20',
  },
  alto: {
    sueldo_neto: 1500000, gasto_alquiler: 450000, gasto_servicios: 80000,
    gasto_transporte: 80000, gasto_cuotas: 100000,
    gasto_alimentacion: 250000, gasto_entretenimiento: 80000, gasto_otros: 100000,
    nivel_ahorro: 'recomendado_20',
  },
};

@Component({
  selector: 'app-salud-financiera',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './salud-financiera.component.html',
  styleUrls: ['./salud-financiera.component.css'],
})
export class SaludFinancieraComponent implements OnInit {
  private fb            = inject(FormBuilder);
  private finanzasSvc   = inject(FinanzasService);
  private route         = inject(ActivatedRoute);
  private router        = inject(Router);

  modoConfiguracion = signal(false);

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

  // ── Estado de edición / eliminación ──────────────────────
  editandoIndice   = signal<number | null>(null);
  guardandoEdicion = signal(false);
  errorEdicion     = signal<string | null>(null);
  eliminandoIndice = signal<number | null>(null);

  // ── Historial de meses anteriores ────────────────────────
  historial        = signal<RegistroMensual[]>([]);

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

  // ── Formulario de edición de entrada ─────────────────────
  formEdicion = this.fb.group({
    monto:       [null as number | null, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.required],
  });

  // ── Formulario de nueva entrada ──────────────────────────
  formEntrada = this.fb.group({
    monto:       [null, [Validators.required, Validators.min(0.01)]],
    descripcion: ['', Validators.required],
  });

  ngOnInit(): void {
    if (this.route.snapshot.queryParams['configurar'] === 'true') {
      this.modoConfiguracion.set(true);
    }
    this.cargarPerfil();
    this.cargarRegistroMensual();
    this.cargarHistorial();
  }

  private cargarPerfil(): void {
    this.finanzasSvc.obtenerPerfil().subscribe({
      next: (perfil) => {
        if (perfil) {
          if (this.modoConfiguracion()) {
            this.router.navigate(['/dashboard']);
            return;
          }
          this.formPerfil.patchValue(perfil as any);
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
        if (this.modoConfiguracion()) {
          this.router.navigate(['/dashboard']);
          return;
        }
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

  // ── Eliminar entrada ─────────────────────────────────────
  eliminarEntrada(indice: number): void {
    if (this.eliminandoIndice() !== null) return;
    this.eliminandoIndice.set(indice);
    this.finanzasSvc.eliminarEntrada(indice).subscribe({
      next: ({ registro, progreso }) => {
        this.registro.set(registro);
        this.progreso.set(progreso);
        this.eliminandoIndice.set(null);
        if (this.editandoIndice() === indice) this.editandoIndice.set(null);
      },
      error: () => this.eliminandoIndice.set(null),
    });
  }

  // ── Editar entrada inline ────────────────────────────────
  iniciarEdicion(indice: number, entrada: EntradaMensual): void {
    this.editandoIndice.set(indice);
    this.errorEdicion.set(null);
    this.formEdicion.setValue({ monto: entrada.monto, descripcion: entrada.descripcion });
  }

  cancelarEdicion(): void {
    this.editandoIndice.set(null);
    this.errorEdicion.set(null);
    this.formEdicion.reset();
  }

  guardarEdicion(): void {
    if (this.formEdicion.invalid) return;
    const indice = this.editandoIndice();
    if (indice === null) return;
    this.guardandoEdicion.set(true);
    this.errorEdicion.set(null);
    const { monto, descripcion } = this.formEdicion.value;
    this.finanzasSvc.editarEntrada(indice, Number(monto), descripcion as string).subscribe({
      next: ({ registro, progreso }) => {
        this.registro.set(registro);
        this.progreso.set(progreso);
        this.editandoIndice.set(null);
        this.guardandoEdicion.set(false);
        this.formEdicion.reset();
      },
      error: () => {
        this.errorEdicion.set('Error al guardar. Intentá de nuevo.');
        this.guardandoEdicion.set(false);
      },
    });
  }

  // ── Historial ────────────────────────────────────────────
  private cargarHistorial(): void {
    this.finanzasSvc.obtenerHistorial().subscribe({
      next: (registros) => this.historial.set(registros),
      error: () => {},
    });
  }

  nombreMesAnio(mes: number, anio: number): string {
    return new Date(anio, mes - 1, 1).toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }

  porcentajeHistorial(r: RegistroMensual): number {
    return r.limite_calculado > 0
      ? Math.min(100, Math.round((r.total_registrado / r.limite_calculado) * 100))
      : 0;
  }

  alertaHistorial(r: RegistroMensual): string {
    const pct = this.porcentajeHistorial(r);
    if (pct >= 100) return 'alerta--roja';
    if (pct >= 80)  return 'alerta--naranja';
    if (pct >= 50)  return 'alerta--amarilla';
    return 'alerta--verde';
  }

  // ── Perfiles de ejemplo ──────────────────────────────────
  cargarEjemplo(tipo: 'basico' | 'estandar' | 'alto'): void {
    this.formPerfil.patchValue(EJEMPLOS[tipo] as any);
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

  colorPorEstadoSalud(estado: string): string {
    const map: Record<string, string> = {
      'Excelente': '#00e5a0',
      'Bueno':     '#4fc3f7',
      'Regular':   '#ffc145',
      'Crítico':   '#ff4f6d',
    };
    return map[estado] ?? '#00e5a0';
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
