// ============================================================
// services/noticias.service.ts — Clase 9: Web Scraping
// Consume el endpoint de noticias scrapeadas del backend.
// ============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient }          from '@angular/common/http';
import { Observable }          from 'rxjs';
import { map }                 from 'rxjs/operators';
import { Noticia }             from '../core/models/partido.model';
import { environment }        from '../../environments/environment';

const API = environment.apiUrl;

@Injectable({ providedIn: 'root' })
export class NoticiasService {
  private http = inject(HttpClient);

  obtener(limite = 6): Observable<Noticia[]> {
    return this.http
      .get<{ ok: boolean; noticias: Noticia[] }>(`${API}/scraping/noticias?limite=${limite}`)
      .pipe(map((res) => res.noticias));
  }
}
