// ============================================================
// services/favoritos.service.ts — Clase 7: Base de datos
// CRUD de favoritos del usuario logueado.
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { Observable }          from 'rxjs';
import { map }                 from 'rxjs/operators';

const API = 'http://localhost:3000/api/v1';

export interface Favorito {
  id:               string;
  fixture_id:       number;
  equipo_local:     string;
  equipo_visitante: string;
  liga:             string;
  created_at:       string;
}

@Injectable({ providedIn: 'root' })
export class FavoritosService {
  private http = inject(HttpClient);

  obtener(): Observable<Favorito[]> {
    return this.http
      .get<{ ok: boolean; favoritos: Favorito[] }>(`${API}/favoritos`)
      .pipe(map((res) => res.favoritos));
  }

  agregar(partido: { fixture_id: number; equipo_local: string; equipo_visitante: string; liga: string }): Observable<Favorito> {
    return this.http
      .post<{ ok: boolean; favorito: Favorito }>(`${API}/favoritos`, partido)
      .pipe(map((res) => res.favorito));
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${API}/favoritos/${id}`);
  }
}
