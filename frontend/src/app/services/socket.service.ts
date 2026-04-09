// ============================================================
// services/socket.service.ts — Clase 8: WebSockets + PubSub
// Envuelve Socket.io en Observables RxJS para integrarse
// de forma idiomática con Angular.
// ============================================================

import { Injectable, OnDestroy } from '@angular/core';
import { Observable }            from 'rxjs';
import { io, Socket }            from 'socket.io-client';
import { Partido }               from '../core/models/partido.model';

const SOCKET_URL = 'http://localhost:3000';

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private socket: Socket;

  constructor() {
    this.socket = io(SOCKET_URL, { transports: ['websocket'] });
  }

  // ── Escuchar actualizaciones globales de partidos ────────
  escucharPartidos(): Observable<{ partidos: Partido[]; total: number; timestamp: string }> {
    return new Observable((observer) => {
      this.socket.on('partidos:actualizacion', (data) => observer.next(data));
      // Cleanup al desuscribirse
      return () => this.socket.off('partidos:actualizacion');
    });
  }

  // ── Suscribirse al Pulse de un partido específico ────────
  suscribirPartido(fixtureId: number): void {
    this.socket.emit('suscribir:partido', fixtureId);
  }

  desuscribirPartido(fixtureId: number): void {
    this.socket.emit('desuscribir:partido', fixtureId);
  }

  escucharPulse(): Observable<any> {
    return new Observable((observer) => {
      this.socket.on('pulse:actualizacion', (data) => observer.next(data));
      return () => this.socket.off('pulse:actualizacion');
    });
  }

  // ── Estado de conexión ───────────────────────────────────
  estaConectado(): boolean {
    return this.socket.connected;
  }

  ngOnDestroy(): void {
    this.socket.disconnect();
  }
}
