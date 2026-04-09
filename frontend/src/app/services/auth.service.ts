// ============================================================
// services/auth.service.ts — Clase 4: Autenticación
// Gestiona login, registro, logout y estado de sesión.
// Usa signal() de Angular 17 para estado reactivo.
// ============================================================

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient }                  from '@angular/common/http';
import { Router }                      from '@angular/router';
import { tap }                         from 'rxjs/operators';
import { Usuario }                     from '../core/models/usuario.model';

const API = 'http://localhost:3000/api/v1';
const TOKEN_KEY   = 'bw_token';
const USUARIO_KEY = 'bw_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http   = inject(HttpClient);
  private router = inject(Router);

  // Signal reactivo: el resto de la app observa este estado
  usuario = signal<Usuario | null>(this.cargarUsuarioGuardado());

  register(datos: { email: string; password: string; nombre: string }) {
    return this.http.post<any>(`${API}/auth/register`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  login(datos: { email: string; password: string }) {
    return this.http.post<any>(`${API}/auth/login`, datos).pipe(
      tap((res) => this.guardarSesion(res))
    );
  }

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    this.usuario.set(null);
    this.router.navigate(['/']);
  }

  obtenerToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  estaLogueado(): boolean {
    return !!this.obtenerToken();
  }

  private guardarSesion(res: any) {
    localStorage.setItem(TOKEN_KEY,   res.token);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(res.usuario));
    this.usuario.set(res.usuario);
    this.router.navigate(['/dashboard']);
  }

  private cargarUsuarioGuardado(): Usuario | null {
    const stored = localStorage.getItem(USUARIO_KEY);
    return stored ? JSON.parse(stored) : null;
  }
}
