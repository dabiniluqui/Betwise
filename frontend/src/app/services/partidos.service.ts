// ============================================================
// services/partidos.service.ts — Clase 2: HTTP / Clase 8: WebSockets
// Consume el backend para obtener partidos en vivo y Pulse Score.
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { Observable }          from 'rxjs';
import { map }                 from 'rxjs/operators';
import { Partido, PulsePartido } from '../core/models/partido.model';

const API = 'http://localhost:3000/api/v1';

@Injectable({ providedIn: 'root' })
export class PartidosService {
  private http = inject(HttpClient);

  obtenerEnVivo(): Observable<Partido[]> {
    return this.http
      .get<{ ok: boolean; partidos: Partido[] }>(`${API}/partidos/en-vivo`)
      .pipe(map((res) => res.partidos));
  }

  obtenerPulse(fixtureId: number): Observable<PulsePartido> {
    return this.http
      .get<{ ok: boolean } & PulsePartido>(`${API}/partidos/${fixtureId}/pulse`)
      .pipe(map((res) => ({ fixtureId: res.fixtureId, timestamp: res.timestamp, pulse: res.pulse })));
  }
}
