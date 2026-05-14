import { Component, signal, computed, ElementRef, ViewChild, AfterViewChecked, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

interface Mensaje {
  rol: 'usuario' | 'asistente';
  texto: string;
}

const CHATBOT_URL = `${environment.apiUrl}/chatbot`;

const SYSTEM_PROMPT = `Eres FutBot, un experto en fútbol argentino e internacional.
Tu conocimiento abarca:
- Historia del fútbol mundial y argentino (clubes, selecciones, competencias)
- Resultados de partidos, estadísticas y tablas de posiciones
- Jugadores legendarios y actuales
- Técnicas, tácticas y formaciones
- Copa del Mundo, Copa América, Champions League, Liga Profesional y todas las ligas del mundo

REGLAS ESTRICTAS:
1. SOLO responde preguntas relacionadas con fútbol.
2. Si el usuario pregunta algo que NO sea fútbol, responde exactamente: "Solo puedo responder preguntas sobre fútbol. ¿Tenés alguna duda del deporte rey?"
3. Responde siempre en español rioplatense (usá "vos", "che", "boludo" si es casual).
4. Sé apasionado y entusiasta cuando hables de fútbol.
5. Si no sabés un resultado exacto o dato muy reciente, acláralo pero aportá contexto histórico.`;

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón flotante -->
    <button
      class="chat-fab"
      (click)="toggleChat()"
      [attr.aria-label]="abierto() ? 'Cerrar chat' : 'Abrir chat de fútbol'"
      title="Chat de Fútbol">
      <span *ngIf="!abierto()">⚽</span>
      <span *ngIf="abierto()">✕</span>
    </button>

    <!-- Panel del chat -->
    <div class="chat-panel" [class.chat-panel--visible]="abierto()">
      <div class="chat-header">
        <span class="chat-header__icono">⚽</span>
        <div class="chat-header__info">
          <strong>FutBot</strong>
          <small>Experto en fútbol</small>
        </div>
      </div>

      <div class="chat-mensajes" #scrollContainer>
        <!-- Mensaje de bienvenida -->
        <div class="chat-burbuja chat-burbuja--asistente" *ngIf="mensajes().length === 0">
          <p>¡Hola! Soy FutBot 🎙️ Preguntame lo que quieras sobre fútbol: historia, resultados, jugadores, tácticas... ¡lo que se te ocurra, che!</p>
        </div>

        <div
          *ngFor="let msg of mensajes()"
          class="chat-burbuja"
          [class.chat-burbuja--usuario]="msg.rol === 'usuario'"
          [class.chat-burbuja--asistente]="msg.rol === 'asistente'">
          <p [innerHTML]="formatearTexto(msg.texto)"></p>
        </div>

        <div class="chat-burbuja chat-burbuja--asistente chat-cargando" *ngIf="cargando()">
          <span></span><span></span><span></span>
        </div>
      </div>

      <form class="chat-input-area" (ngSubmit)="enviarMensaje()" autocomplete="off">
        <input
          class="chat-input"
          type="text"
          [(ngModel)]="mensajeActual"
          name="mensaje"
          placeholder="Preguntá sobre fútbol..."
          [disabled]="cargando()"
          maxlength="500"
          autocomplete="off" />
        <button
          type="submit"
          class="chat-enviar"
          [disabled]="!mensajeActual.trim() || cargando()">
          ➤
        </button>
      </form>
    </div>
  `,
  styles: [`
    .chat-fab {
      position: fixed;
      bottom: 28px;
      right: 28px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: linear-gradient(135deg, #1a7a3c, #2ecc71);
      border: none;
      cursor: pointer;
      font-size: 1.7rem;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 20px rgba(46, 204, 113, 0.45);
      z-index: 1000;
      transition: transform 0.2s, box-shadow 0.2s;
      color: #fff;
    }
    .chat-fab:hover {
      transform: scale(1.1);
      box-shadow: 0 6px 28px rgba(46, 204, 113, 0.6);
    }

    .chat-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      max-height: 520px;
      background: #0f1923;
      border: 1px solid #1e3a2f;
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
    .chat-panel--visible {
      opacity: 1;
      transform: translateY(0) scale(1);
      pointer-events: all;
    }

    .chat-header {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 14px 18px;
      background: linear-gradient(135deg, #1a7a3c, #145f2e);
      border-radius: 16px 16px 0 0;
    }
    .chat-header__icono { font-size: 1.5rem; }
    .chat-header__info { display: flex; flex-direction: column; }
    .chat-header__info strong { color: #fff; font-size: 0.95rem; }
    .chat-header__info small { color: #a8e6c2; font-size: 0.75rem; }

    .chat-mensajes {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: #1e3a2f transparent;
    }

    .chat-burbuja {
      max-width: 85%;
      padding: 10px 14px;
      border-radius: 14px;
      font-size: 0.875rem;
      line-height: 1.5;
    }
    .chat-burbuja p { margin: 0; }
    .chat-burbuja--usuario {
      align-self: flex-end;
      background: #1a7a3c;
      color: #e8f5ee;
      border-bottom-right-radius: 4px;
    }
    .chat-burbuja--asistente {
      align-self: flex-start;
      background: #182b20;
      color: #d4edda;
      border-bottom-left-radius: 4px;
      border: 1px solid #1e3a2f;
    }

    .chat-cargando {
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 12px 16px;
    }
    .chat-cargando span {
      width: 7px;
      height: 7px;
      background: #2ecc71;
      border-radius: 50%;
      display: inline-block;
      animation: bounce 1.2s infinite ease-in-out;
    }
    .chat-cargando span:nth-child(2) { animation-delay: 0.2s; }
    .chat-cargando span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes bounce {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.5; }
      40% { transform: scale(1); opacity: 1; }
    }

    .chat-input-area {
      display: flex;
      gap: 8px;
      padding: 12px 14px;
      border-top: 1px solid #1e3a2f;
      background: #0f1923;
    }
    .chat-input {
      flex: 1;
      background: #182b20;
      border: 1px solid #1e3a2f;
      border-radius: 10px;
      padding: 9px 12px;
      color: #e8f5ee;
      font-size: 0.875rem;
      outline: none;
      transition: border-color 0.2s;
    }
    .chat-input:focus { border-color: #2ecc71; }
    .chat-input::placeholder { color: #4a7a5a; }
    .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .chat-enviar {
      background: linear-gradient(135deg, #1a7a3c, #2ecc71);
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 1.1rem;
      padding: 0 14px;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.15s;
    }
    .chat-enviar:hover:not(:disabled) { opacity: 0.9; transform: scale(1.05); }
    .chat-enviar:disabled { opacity: 0.4; cursor: not-allowed; }

    @media (max-width: 480px) {
      .chat-panel {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 90px;
      }
      .chat-fab { bottom: 20px; right: 16px; }
    }
  `],
})
export class ChatbotComponent implements AfterViewChecked {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef<HTMLDivElement>;

  private http = inject(HttpClient);

  abierto = signal(false);
  mensajes = signal<Mensaje[]>([]);
  cargando = signal(false);
  mensajeActual = '';

  toggleChat() {
    this.abierto.update(v => !v);
  }

  async enviarMensaje() {
    const texto = this.mensajeActual.trim();
    if (!texto || this.cargando()) return;

    this.mensajeActual = '';
    this.mensajes.update(msgs => [...msgs, { rol: 'usuario', texto }]);
    this.cargando.set(true);

    const historial = this.mensajes().slice(-10).map(m => ({
      role: m.rol === 'usuario' ? 'user' : 'model',
      parts: [{ text: m.texto }],
    }));

    const body = {
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: historial,
      generationConfig: { temperature: 0.8, maxOutputTokens: 800 },
    };

    this.http.post<any>(CHATBOT_URL, body).subscribe({
      next: (res) => {
        const respuesta = res?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No pude obtener respuesta. Intentá de nuevo.';
        this.mensajes.update(msgs => [...msgs, { rol: 'asistente', texto: respuesta }]);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('FutBot error:', err);
        this.mensajes.update(msgs => [...msgs, { rol: 'asistente', texto: 'Hubo un error al conectar con Gemini. Revisá la consola para más detalles.' }]);
        this.cargando.set(false);
      },
    });
  }

  formatearTexto(texto: string): string {
    return texto
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>');
  }

  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  private scrollToBottom() {
    try {
      const el = this.scrollContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }
}
