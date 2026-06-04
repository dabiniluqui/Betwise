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

const SYSTEM_PROMPT = `Sos FinBot, un asistente financiero personal que trabaja en BetWise Argentina, una plataforma de control financiero.

Tu misión principal:
- Ayudar a las personas a mejorar su salud financiera
- DETECTAR cualquier señal de que alguien quiere apostar y DISUADIRLOS con empatía y datos reales
- Educar sobre por qué las apuestas son dañinas para las finanzas personales

SEÑALES DE INTENCIÓN DE APOSTAR (detectá estas y similares):
- Palabras como: apostar, apuesta, bet, cuota, casa de apuestas, quiniela, casino, ruleta, tragamonedas, "doblo mi dinero", "seguro gano", "voy a ganar", "cuánto pongo"
- Consultas sobre cuotas, probabilidades para ganar dinero, o "inversiones" en apuestas

CUANDO DETECTÁS INTENCIÓN DE APOSTAR:
1. No juzgues, respondé con comprensión ("Entiendo que parece tentador...")
2. Explicá la expectativa negativa: las casas de apuestas siempre tienen ventaja matemática (entre 5% y 20% del dinero apostado va a la casa)
3. Mencioná el efecto de pérdida y la falacia del jugador (creer que "ya tiene que salir")
4. Mostrá un ejemplo concreto: "Si apostás $10.000 al mes durante un año, estadísticamente perdés entre $6.000 y $24.000 en ese período"
5. Proponé alternativas: plazo fijo, fondo de emergencia, invertir en uno mismo (cursos, salud)
6. Recordá que BetWise tiene herramientas para visualizar cuánto se pierde apostando

TEMAS QUE PODÉS RESPONDER NORMALMENTE:
- Presupuesto personal y familiar
- Ahorro e inversión básica
- Manejo de deudas
- Conceptos financieros generales

REGLAS:
1. Respondé siempre en español rioplatense (usá "vos", sé cercano pero profesional)
2. Sé empático, nunca agresivo ni condescendiente
3. Usá datos y ejemplos concretos cuando expliques por qué apostar es dañino
4. Si el tema no es financiero ni de apuestas, respondé: "Mi especialidad son las finanzas personales. ¿Querés que te ayude con tu presupuesto o con cómo manejar mejor tu plata?"
5. Mantené respuestas concisas (máximo 4 párrafos)`;

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <!-- Botón flotante -->
    <button
      class="chat-fab"
      (click)="toggleChat()"
      [attr.aria-label]="abierto() ? 'Cerrar chat' : 'Abrir asistente financiero'"
      title="Asistente Financiero">
      <span *ngIf="!abierto()" class="chat-fab__label">💰 FinBot</span>
      <span *ngIf="abierto()">✕</span>
    </button>

    <!-- Panel del chat -->
    <div class="chat-panel" [class.chat-panel--visible]="abierto()">
      <div class="chat-header">
        <span class="chat-header__icono">💰</span>
        <div class="chat-header__info">
          <strong>FinBot</strong>
          <small>Asistente Financiero</small>
        </div>
      </div>

      <div class="chat-mensajes" #scrollContainer>
        <!-- Mensaje de bienvenida -->
        <div class="chat-burbuja chat-burbuja--asistente" *ngIf="mensajes().length === 0">
          <p>¡Hola! Soy FinBot 💰 Estoy acá para ayudarte a cuidar tu plata y mejorar tu salud financiera. ¿En qué te puedo ayudar hoy?</p>
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
          placeholder="Preguntame sobre finanzas personales..."
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
      height: 48px;
      min-width: 48px;
      padding: 0 20px;
      border-radius: 30px;
      background: linear-gradient(135deg, #00b87a, #00e5a0);
      border: none;
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      box-shadow: 0 4px 20px rgba(0, 229, 160, 0.45);
      z-index: 1000;
      transition: transform 0.2s, box-shadow 0.2s;
      color: #0a2e1c;
      white-space: nowrap;
    }
    .chat-fab:hover {
      transform: scale(1.05);
      box-shadow: 0 6px 28px rgba(0, 229, 160, 0.6);
    }
    .chat-fab__label {
      font-size: 0.95rem;
      font-weight: 700;
      letter-spacing: 0.02em;
    }

    .chat-panel {
      position: fixed;
      bottom: 100px;
      right: 28px;
      width: 360px;
      max-height: 520px;
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
      background: linear-gradient(135deg, #00916a, #00c48a);
      border-radius: 16px 16px 0 0;
    }
    .chat-header__icono { font-size: 1.5rem; }
    .chat-header__info { display: flex; flex-direction: column; }
    .chat-header__info strong { color: #fff; font-size: 0.95rem; }
    .chat-header__info small { color: #c8f5e6; font-size: 0.75rem; }

    .chat-mensajes {
      flex: 1;
      overflow-y: auto;
      padding: 16px 14px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      scrollbar-width: thin;
      scrollbar-color: #1e2f4a transparent;
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
      background: #1a4a7a;
      color: #e8f0f5;
      border-bottom-right-radius: 4px;
    }
    .chat-burbuja--asistente {
      align-self: flex-start;
      background: #172033;
      color: #d4e6ed;
      border-bottom-left-radius: 4px;
      border: 1px solid #1e2f4a;
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
      background: #00e5a0;
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
      border-top: 1px solid #1e2f4a;
      background: #0f1923;
    }
    .chat-input {
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
    .chat-input:focus { border-color: #00e5a0; }
    .chat-input::placeholder { color: #4a6a7a; }
    .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

    .chat-enviar {
      background: linear-gradient(135deg, #00916a, #00e5a0);
      border: none;
      border-radius: 10px;
      color: #0a2e1c;
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
      role: m.rol === 'usuario' ? 'user' : 'assistant',
      content: m.texto,
    }));

    const body = {
      messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...historial],
      temperature: 0.7,
      max_tokens: 800,
    };

    this.http.post<any>(CHATBOT_URL, body).subscribe({
      next: (res) => {
        const respuesta = res?.choices?.[0]?.message?.content ?? 'No pude obtener respuesta. Intentá de nuevo.';
        this.mensajes.update(msgs => [...msgs, { rol: 'asistente', texto: respuesta }]);
        this.cargando.set(false);
      },
      error: (err) => {
        console.error('FinBot error:', err);
        this.mensajes.update(msgs => [...msgs, { rol: 'asistente', texto: 'Hubo un error al conectar con el asistente. Revisá la consola para más detalles.' }]);
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
