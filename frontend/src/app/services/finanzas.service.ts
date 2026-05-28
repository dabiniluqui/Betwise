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
import { environment } from '../../environments/environment';

const API = environment.apiUrl;

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

  eliminarEntrada(indice: number): Observable<{ registro: RegistroMensual; progreso: ProgresoMensual }> {
    return this.http
      .delete<any>(`${API}/finanzas/registro/entrada/${indice}`)
      .pipe(map((res) => ({ registro: res.registro, progreso: res.progreso })));
  }

  editarEntrada(indice: number, monto: number, descripcion: string): Observable<{ registro: RegistroMensual; progreso: ProgresoMensual }> {
    return this.http
      .put<any>(`${API}/finanzas/registro/entrada/${indice}`, { monto, descripcion })
      .pipe(map((res) => ({ registro: res.registro, progreso: res.progreso })));
  }

  obtenerHistorial(): Observable<RegistroMensual[]> {
    return this.http
      .get<{ ok: boolean; registros: RegistroMensual[] }>(`${API}/finanzas/historial`)
      .pipe(map((res) => res.registros));
  }

  actualizarResultado(registroId: string, indice: number, resultado: string, ganancia_neta: number): Observable<RegistroMensual> {
    return this.http
      .patch<any>(`${API}/finanzas/registro/${registroId}/entrada/${indice}/resultado`, { resultado, ganancia_neta })
      .pipe(map((res) => res.registro));
  }
}
