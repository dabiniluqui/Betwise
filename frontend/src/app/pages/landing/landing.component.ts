// ============================================================
// pages/landing/landing.component.ts
// Página principal: Salud Financiera arriba, partidos en vivo
// abajo, noticias al final. WebSocket actualiza partidos live.
// ============================================================

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { RouterLink }       from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Subscription }     from 'rxjs';

import { FinanzasService }  from '../../services/finanzas.service';
import { PartidosService }  from '../../services/partidos.service';
import { SocketService }    from '../../services/socket.service';
import { NoticiasService }  from '../../services/noticias.service';
import { AuthService }      from '../../services/auth.service';

import { Partido, Noticia }         from '../../core/models/partido.model';
import { ResultadoFinanciero }      from '../../core/models/usuario.model';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.css'],
})
export class LandingComponent implements OnInit, OnDestroy {
  private fb             = inject(FormBuilder);
  private finanzasSvc    = inject(FinanzasService);
  private partidosSvc    = inject(PartidosService);
  private socketSvc      = inject(SocketService);
  private noticiasSvc    = inject(NoticiasService);
  authService            = inject(AuthService);

  // ── Estado de la calculadora ─────────────────────────────
  resultadoFinanciero = signal<ResultadoFinanciero | null>(null);
  calculandoFinanzas  = signal(false);
  errorFinanzas       = signal<string | null>(null);

  formularioFinanciero = this.fb.group({
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

  // ── Estado de partidos ───────────────────────────────────
  partidos        = signal<Partido[]>([]);
  cargandoPartidos = signal(true);
  ultimaActualizacion = signal<string | null>(null);

  // ── Estado de noticias ───────────────────────────────────
  noticias        = signal<Noticia[]>([]);
  cargandoNoticias = signal(true);

  private subs = new Subscription();

  ngOnInit(): void {
    this.cargarPartidosIniciales();
    this.escucharSocketPartidos();
    this.cargarNoticias();
  }

  // ── Calculadora financiera ───────────────────────────────
  calcularSalud(): void {
    if (this.formularioFinanciero.invalid) return;

    this.calculandoFinanzas.set(true);
    this.errorFinanzas.set(null);

    const sub = this.finanzasSvc.calcular(this.formularioFinanciero.value as any).subscribe({
      next: (resultado) => {
        this.resultadoFinanciero.set(resultado);
        this.calculandoFinanzas.set(false);
      },
      error: () => {
        this.errorFinanzas.set('Error al calcular. Intentá de nuevo.');
        this.calculandoFinanzas.set(false);
      },
    });

    this.subs.add(sub);
  }

  resetearCalculadora(): void {
    this.formularioFinanciero.reset({ nivel_ahorro: 'recomendado_20' });
    this.resultadoFinanciero.set(null);
  }

  // ── Helpers para el template ─────────────────────────────
  formatearPeso(valor: number): string {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
    }).format(valor);
  }

  colorEstado(estado: string): string {
    const map: Record<string, string> = {
      'Excelente': 'estado--excelente',
      'Bueno':     'estado--bueno',
      'Regular':   'estado--regular',
      'Crítico':   'estado--critico',
    };
    return map[estado] || '';
  }

  colorAlerta(alerta: string): string {
    const map: Record<string, string> = {
      'dentro_del_limite':  'alerta--verde',
      'mitad_alcanzada':    'alerta--amarilla',
      'limite_proximo':     'alerta--naranja',
      'limite_superado':    'alerta--roja',
    };
    return map[alerta] || '';
  }

  // ── Partidos en vivo ─────────────────────────────────────
  private cargarPartidosIniciales(): void {
    const sub = this.partidosSvc.obtenerEnVivo().subscribe({
      next: (partidos) => {
        this.partidos.set(partidos);
        this.cargandoPartidos.set(false);
        this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-AR'));
      },
      error: () => this.cargandoPartidos.set(false),
    });
    this.subs.add(sub);
  }

  private escucharSocketPartidos(): void {
    const sub = this.socketSvc.escucharPartidos().subscribe((data) => {
      this.partidos.set(data.partidos as any);
      this.ultimaActualizacion.set(new Date().toLocaleTimeString('es-AR'));
    });
    this.subs.add(sub);
  }

  private cargarNoticias(): void {
    const sub = this.noticiasSvc.obtener(6).subscribe({
      next: (noticias) => {
        this.noticias.set(noticias);
        this.cargandoNoticias.set(false);
      },
      error: () => this.cargandoNoticias.set(false),
    });
    this.subs.add(sub);
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
