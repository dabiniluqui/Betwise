import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Partido } from '../../core/models/partido.model';

interface Mensaje {
  rol: 'usuario' | 'asistente';
  texto: string;
}

const FUTBOT_URL = `${environment.apiUrl}/futbot`;

@Component({
  selector: 'app-futbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón flotante -->
    <button
      class="fb-fab"
      (click)="toggleChat()"
      [attr.aria-label]="abierto() ? 'Cerrar FutBot' : 'Abrir FutBot'"
      title="Experto en fútbol">
      <span *ngIf="!abierto()" class="fb-fab__label">⚽ FutBot</span>
      <span *ngIf="abierto()">✕</span>
    </button>

    <!-- Panel -->
    <div class="fb-panel" [class.fb-panel--visible]="abierto()">
      <div class="fb-header">
        <span class="fb-header__icono">⚽</span>
        <div class="fb-header__info">
          <strong>FutBot</strong>
          <small>Experto en historia y estadísticas</small>
        </div>
        <span class="fb-live-badge" *ngIf="partidos.length > 0">
          {{ partidos.length }} en vivo
        </span>
      </div>

      <div class="fb-mensajes" #scrollRef>
        <div class="fb-burbuja fb-burbuja--asistente" *ngIf="mensajes().length === 0">
          <p>¡Hola! Soy FutBot ⚽ Conocí toda la historia del fútbol y tengo acceso a los
            <strong>{{ partidos.length }} partido{{ partidos.length !== 1 ? 's' : '' }} en vivo</strong>
            ahora mismo. ¿Qué querés saber?
          </p>
        </div>

        <div
          *ngFor="let msg of mensajes()"
          class="fb-burbuja"
          [class.fb-burbuja--usuario]="msg.rol === 'usuario'"
          [class.fb-burbuja--asistente]="msg.rol === 'asistente'">
          <p [innerHTML]="formatear(msg.texto)"></p>
        </div>

        <div class="fb-burbuja fb-burbuja--asistente fb-cargando" *ngIf="cargando()">
          <span></span><span></span><span></span>
        </div>
      </div>

      <form class="fb-input-area" (ngSubmit)="enviar()" autocomplete="off">
        <input
          class="fb-input"
          type="text"
          [(ngModel)]="mensajeActual"
          name="msg"
          placeholder="Preguntá sobre historia, stats, partidos..."
          [disabled]="cargando()"
          maxlength="500"
          autocomplete="off" />
        <button
          type="submit"
          class="fb-enviar"
          [disabled]="!mensajeActual.trim() || cargando()">
          ➤
        </button>
      </form>
    </div>
  `,
  styles: [`
    .fb-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      height: 48px;
      min-width: 48px;
      padding: 0 20px;
      border-radius: 30px;
      background: linear-gradient(135deg, #1a4a7a, #3498db);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 20px rgba(52, 152, 219, 0.45);
      z-index: 1000;
      transition: transform 0.2s, box-shadow 0.2s;
      color: #fff;
      white-space: nowrap;
    }
    .fb-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 28px rgba(52, 152, 219, 0.6);
    }
    .fb-fab__label {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .fb-panel {
      position: fixed;
      bottom: 90px;
      right: 28px;
      width: 370px;
      max-height: 540px;
      background: #0f1923;
      border: 1px solid #1e2f4a;
      border-radius: 16px;
      display: flex;
      flex-direction: column;
      box-shadow: 0 12px 48px rgba(0, 0, 0, 0.6);
      z-index: 999;
      opacity: 0;
      transform: translateY(20px) scale(0.96);
      pointer-events: none;
      transition: opacity 0.22s ease, transform 0.22s ease;
      overflow: hidden;
    }
    .fb-panel--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    .fb-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #1a4a7a, #0f3460);
    }
    .fb-header__icono { font-size: 1.4rem; }
    .fb-header__info  { display: flex; flex-direction: column; flex: 1; }
    .fb-header__info strong { color: #fff; font-size: 0.95rem; }
    .fb-header__info small  { color: #a8c8e6; font-size: 0.72rem; }
    .fb-live-badge {
      font-size: 0.65rem;
      font-weight: 700;
      background: #e74c3c;
      color: #fff;
      padding: 3px 8px;
      border-radius: 100px;
      white-space: nowrap;
      animation: pulsar 1.5s ease-in-out infinite;
    }
    @keyframes pulsar { 0%,100%{opacity:1} 50%{opacity:0.6} }

    .fb-mensajes {
      flex: 1;
      overflow-y: auto;
      padding: 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: #1e2f4a transparent;
    }

    .fb-burbuja {
      max-width: 86%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .fb-burbuja p { margin: 0; }
    .fb-burbuja--usuario {
      align-self: flex-end;
      background: #1a4a7a;
      color: #e8f0f5;
      border-bottom-right-radius: 4px;
    }
    .fb-burbuja--asistente {
      align-self: flex-start;
      background: #172033;
      color: #d4e6ed;
      border-bottom-left-radius: 4px;
      border: 1px solid #1e2f4a;
    }

    .fb-cargando {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 16px;
    }
    .fb-cargando span {
      width: 7px;
      height: 7px;
      background: #3498db;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .fb-cargando span:nth-child(2) { animation-delay: 0.2s; }
    .fb-cargando span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40%           { transform: scale(1);   opacity: 1;   }
    }

    .fb-input-area {
      display: flex;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid #1e2f4a;
      background: #0f1923;
    }
    .fb-input {
      flex: 1;
      background: #172033;
      border: 1px solid #1e2f4a;
      border-radius: 10px;
      padding: 9px 12px;
      color: #e8f0f5;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .fb-input:focus { border-color: #3498db; }
    .fb-input::placeholder { color: #4a6a7a; }
    .fb-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .fb-enviar {
      background: linear-gradient(135deg, #1a4a7a, #3498db);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 1.1rem;
      padding: 0 14px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .fb-enviar:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
    .fb-enviar:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 480px) {
      .fb-panel { width: calc(100vw - 24px); right: 12px; bottom: 90px; }
      .fb-fab   { bottom: 20px; right: 16px; }
    }
  `],
})
export class FutbotComponent {
  @Input() partidos: Partido[] = [];

  private http = inject(HttpClient);

  abierto  = signal(false);
  mensajes = signal<Mensaje[]>([]);
  cargando = signal(false);
  mensajeActual = '';

  toggleChat() { this.abierto.update(v => !v); }

  enviar() {
    const texto = this.mensajeActual.trim();
    if (!texto || this.cargando()) return;

    this.mensajeActual = '';
    this.mensajes.update(msgs => [...msgs, { rol: 'usuario', texto }]);
    this.cargando.set(true);

    const historial = this.mensajes().slice(-10).map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.texto,
    }));

    const resumenPartidos = this.partidos.map(p => ({
      liga:            p.liga.nombre,
      local:           p.equipoLocal.nombre,
      goles_local:     p.equipoLocal.goles,
      visitante:       p.equipoVisitante.nombre,
      goles_visitante: p.equipoVisitante.goles,
      minuto:          p.minuto,
      estado:          p.estado,
    }));

    const body = {
      messages:    historial,
      partidos:    resumenPartidos,
      temperature: 0.7,
      max_tokens:  1000,
    };

    this.http.post<any>(FUTBOT_URL, body).subscribe({
      next: (res) => {
        const respuesta = res?.choices?.[0]?.message?.content
          ?? 'No pude obtener respuesta. Intentá de nuevo.';
        this.mensajes.update(msgs => [...msgs, { rol: 'asistente', texto: respuesta }]);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('FutBot error:', err);
        this.mensajes.update(msgs => [...msgs, {
          rol: 'asistente',
          texto: 'Hubo un error al conectar con FutBot. Revisá la consola.',
        }]);
        this.cargando.set(false);
      },
    });
  }

  formatear(texto: string): string {
    return texto
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }
}
