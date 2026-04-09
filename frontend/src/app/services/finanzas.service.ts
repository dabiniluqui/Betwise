// ============================================================
// services/finanzas.service.ts — Módulo Salud Financiera
// Gestiona todas las llamadas HTTP al módulo de finanzas.
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { Observable }          from 'rxjs';
import { map }                 from 'rxjs/operators';
import {
  PerfilFinanciero,
  ResultadoFinanciero,
  RegistroMensual,
  ProgresoMensual,
} from '../core/models/usuario.model';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private http = inject(HttpClient);

  // Calculadora pública (sin login)
  calcular(datos: Partial<PerfilFinanciero>): Observable<ResultadoFinanciero> {
    return this.http
      .post<{ ok: boolean; resultado: ResultadoFinanciero }>(`${API}/finanzas/calcular`, datos)
      .pipe(map((res) => res.resultado));
  }

  // Perfil guardado del usuario logueado
  obtenerPerfil(): Observable<PerfilFinanciero | null> {
    return this.http
      .get<{ ok: boolean; perfil: PerfilFinanciero | null }>(`${API}/finanzas/perfil`)
      .pipe(map((res) => res.perfil));
  }

  guardarPerfil(datos: PerfilFinanciero): Observable<{ perfil: PerfilFinanciero; resultado: ResultadoFinanciero }> {
    return this.http
      .post<{ ok: boolean; perfil: PerfilFinanciero; resultado: ResultadoFinanciero }>(`${API}/finanzas/perfil`, datos)
      .pipe(map((res) => ({ perfil: res.perfil, resultado: res.resultado })));
  }

  // Registro mensual
  obtenerRegistroMensual(anio: number, mes: number): Observable<{ registro: RegistroMensual | null; progreso: ProgresoMensual | null }> {
    return this.http
      .get<any>(`${API}/finanzas/registro/${anio}/${mes}`)
      .pipe(map((res) => ({ registro: res.registro, progreso: res.progreso })));
  }

  agregarEntrada(monto: number, descripcion: string): Observable<{ registro: RegistroMensual; progreso: ProgresoMensual }> {
    return this.http
      .post<any>(`${API}/finanzas/registro/entrada`, { monto, descripcion })
      .pipe(map((res) => ({ registro: res.registro, progreso: res.progreso })));
  }
}
