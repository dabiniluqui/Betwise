import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cuestionario-riesgo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="cuest-wrapper">

      <!-- Cabecera -->
      <div class="cuest-header">
        <span class="cuest-pill">📊 Autoevaluación</span>
        <h2 class="cuest-titulo">¿Cómo es tu relación con las apuestas?</h2>
        <p class="cuest-subtitulo">
          Respondé con honestidad las 10 preguntas. No hay respuestas correctas ni incorrectas.
          El resultado es personal y confidencial.
        </p>
      </div>

      <!-- Cuestionario -->
      <ng-container *ngIf="!completado()">
        <div class="cuest-progreso">
          <span class="cuest-progreso__texto">{{ respondidas() }} de 10 respondidas</span>
          <div class="cuest-progreso__barra">
            <div class="cuest-progreso__relleno" [style.width.%]="respondidas() * 10"></div>
          </div>
        </div>

        <ol class="cuest-lista">
          <li *ngFor="let pregunta of preguntas; let i = index" class="cuest-item">
            <div class="cuest-item__enunciado">
              <span class="cuest-item__num">{{ i + 1 }}</span>
              <p class="cuest-item__texto">{{ pregunta }}</p>
            </div>
            <div class="cuest-opciones">
              <button
                *ngFor="let op of opciones; let j = index"
                class="cuest-opcion"
                [class.cuest-opcion--activa]="respuestas()[i] === j"
                (click)="seleccionar(i, j)">
                {{ op }}
              </button>
            </div>
          </li>
        </ol>

        <div class="cuest-pie">
          <p class="cuest-pie__aviso" *ngIf="!todasRespondidas()">
            Respondé todas las preguntas para ver tu resultado.
          </p>
          <button
            class="btn btn--primario cuest-btn"
            [disabled]="!todasRespondidas()"
            (click)="calcular()">
            Ver mi resultado →
          </button>
        </div>
      </ng-container>

      <!-- Resultado -->
      <div *ngIf="completado()" class="cuest-resultado" [ngClass]="'cuest-resultado--' + nivel()">
        <div class="resultado-icono">{{ iconoNivel() }}</div>
        <h3 class="resultado-nivel">{{ etiquetaNivel() }}</h3>
        <p class="resultado-desc">{{ descripcionNivel() }}</p>

        <div class="resultado-puntaje">
          <span class="puntaje-num">{{ puntuacion() }}</span>
          <span class="puntaje-de">/ 30 puntos</span>
        </div>
        <div class="resultado-barra-wrap">
          <div class="resultado-barra-relleno" [style.width.%]="porcentaje()"></div>
        </div>

        <div class="resultado-recursos" *ngIf="nivel() !== 'bajo'">
          <p class="recursos-titulo">Recursos de ayuda gratuitos:</p>
          <ul class="recursos-lista">
            <li>📞 Línea de asistencia: <strong>0800-999-0101</strong> (gratuita 24/7)</li>
            <li>🌐 Jugadores Anónimos Argentina: <strong>www.jugadoresanonimos.org.ar</strong></li>
            <li *ngIf="nivel() === 'alto'">🏥 Considerá hablar con un profesional de salud mental especializado.</li>
          </ul>
        </div>

        <button class="btn btn--ghost cuest-btn" (click)="reiniciar()">
          Volver a responder
        </button>
      </div>

    </section>
  `,
  styles: [`
    .cuest-wrapper {
      background: rgba(255, 193, 69, 0.04);
      border: 1px solid rgba(255, 193, 69, 0.18);
      border-radius: 20px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 36px;
    }

    /* Cabecera */
    .cuest-header {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cuest-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 14px;
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      background: rgba(255, 193, 69, 0.1);
      border: 1px solid rgba(255, 193, 69, 0.3);
      color: #ffc145;
      width: fit-content;
    }

    .cuest-titulo {
      font-family: var(--fuente-display);
      font-size: 1.45rem;
      font-weight: 800;
      color: var(--color-texto);
      margin: 0;
    }

    .cuest-subtitulo {
      font-size: 0.95rem;
      color: var(--color-texto-suave);
      line-height: 1.7;
      margin: 0;
      max-width: 580px;
    }

    /* Progreso */
    .cuest-progreso {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .cuest-progreso__texto {
      font-size: 0.82rem;
      color: var(--color-texto-suave);
    }

    .cuest-progreso__barra {
      height: 4px;
      background: var(--color-borde);
      border-radius: 4px;
      overflow: hidden;
    }

    .cuest-progreso__relleno {
      height: 100%;
      background: #ffc145;
      border-radius: 4px;
      transition: width 0.25s ease;
    }

    /* Lista de preguntas */
    .cuest-lista {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 28px;
    }

    .cuest-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .cuest-item__enunciado {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .cuest-item__num {
      flex-shrink: 0;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: rgba(255, 193, 69, 0.1);
      border: 1px solid rgba(255, 193, 69, 0.25);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 700;
      color: #ffc145;
    }

    .cuest-item__texto {
      font-size: 0.95rem;
      color: var(--color-texto);
      line-height: 1.55;
      margin: 0;
      padding-top: 4px;
    }

    /* Opciones */
    .cuest-opciones {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding-left: 40px;
    }

    .cuest-opcion {
      padding: 7px 16px;
      border-radius: 100px;
      border: 1px solid var(--color-borde);
      background: transparent;
      color: var(--color-texto-suave);
      font-size: 0.82rem;
      font-family: var(--fuente-cuerpo);
      cursor: pointer;
      transition: all 0.15s ease;
    }

    .cuest-opcion:hover {
      border-color: rgba(255, 193, 69, 0.45);
      color: #ffc145;
      background: rgba(255, 193, 69, 0.06);
    }

    .cuest-opcion--activa {
      background: rgba(255, 193, 69, 0.14);
      border-color: #ffc145;
      color: #ffc145;
      font-weight: 600;
    }

    /* Pie del formulario */
    .cuest-pie {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
      padding-top: 4px;
    }

    .cuest-pie__aviso {
      font-size: 0.82rem;
      color: var(--color-texto-suave);
      margin: 0;
    }

    .cuest-btn {
      min-width: 220px;
    }

    .cuest-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    /* Resultado */
    .cuest-resultado {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      padding: 36px 28px;
      border-radius: 16px;
      text-align: center;
    }

    .cuest-resultado--bajo {
      background: rgba(0, 229, 160, 0.06);
      border: 1px solid rgba(0, 229, 160, 0.22);
    }
    .cuest-resultado--moderado {
      background: rgba(255, 193, 69, 0.06);
      border: 1px solid rgba(255, 193, 69, 0.22);
    }
    .cuest-resultado--alto {
      background: rgba(255, 79, 109, 0.06);
      border: 1px solid rgba(255, 79, 109, 0.22);
    }

    .resultado-icono { font-size: 3rem; line-height: 1; }

    .resultado-nivel {
      font-family: var(--fuente-display);
      font-size: 1.5rem;
      font-weight: 800;
      margin: 0;
    }
    .cuest-resultado--bajo    .resultado-nivel { color: #00e5a0; }
    .cuest-resultado--moderado .resultado-nivel { color: #ffc145; }
    .cuest-resultado--alto    .resultado-nivel { color: #ff4f6d; }

    .resultado-desc {
      font-size: 0.95rem;
      color: var(--color-texto-suave);
      line-height: 1.7;
      max-width: 520px;
      margin: 0;
    }

    .resultado-puntaje {
      display: flex;
      align-items: baseline;
      gap: 6px;
    }

    .puntaje-num {
      font-family: var(--fuente-display);
      font-size: 2.8rem;
      font-weight: 800;
      color: var(--color-texto);
      line-height: 1;
    }

    .puntaje-de {
      font-size: 1rem;
      color: var(--color-texto-suave);
    }

    .resultado-barra-wrap {
      width: 100%;
      max-width: 420px;
      height: 8px;
      background: var(--color-borde);
      border-radius: 8px;
      overflow: hidden;
    }

    .resultado-barra-relleno {
      height: 100%;
      border-radius: 8px;
      transition: width 0.7s ease;
    }
    .cuest-resultado--bajo    .resultado-barra-relleno { background: #00e5a0; }
    .cuest-resultado--moderado .resultado-barra-relleno { background: #ffc145; }
    .cuest-resultado--alto    .resultado-barra-relleno { background: #ff4f6d; }

    /* Recursos */
    .resultado-recursos {
      background: rgba(0, 0, 0, 0.25);
      border-radius: 12px;
      padding: 18px 22px;
      text-align: left;
      width: 100%;
      max-width: 500px;
    }

    .recursos-titulo {
      font-size: 0.85rem;
      font-weight: 700;
      color: var(--color-texto);
      margin: 0 0 10px;
    }

    .recursos-lista {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .recursos-lista li {
      font-size: 0.85rem;
      color: var(--color-texto-suave);
      line-height: 1.5;
    }

    .recursos-lista li strong { color: var(--color-texto); }

    @media (max-width: 600px) {
      .cuest-wrapper { padding: 24px 18px; gap: 28px; }
      .cuest-opciones { padding-left: 0; }
      .cuest-resultado { padding: 24px 16px; }
    }
  `],
})
export class CuestionarioRiesgoComponent {
  readonly preguntas = [
    '¿Apostás más dinero del que planeabas originalmente?',
    '¿Intentaste recuperar pérdidas apostando más?',
    '¿Te resultó difícil dejar de apostar o reducir la frecuencia?',
    '¿Pensás frecuentemente en apuestas a lo largo del día?',
    '¿Ocultaste o mentiste sobre cuánto apostás o cuánto perdiste?',
    '¿Las apuestas afectaron negativamente tu estado de ánimo o tus emociones?',
    '¿Pediste dinero prestado o vendiste algo para poder apostar?',
    '¿Apostás para escapar de problemas, estrés o emociones negativas?',
    '¿Descuidaste el trabajo, estudio o la familia por apostar?',
    '¿Intentaste controlar o dejar de apostar pero no lo lograste?',
  ];

  readonly opciones = ['Nunca', 'A veces', 'Frecuentemente', 'Casi siempre'];

  respuestas = signal<number[]>(new Array(10).fill(-1));
  completado = signal(false);
  puntuacion = signal(0);

  respondidas   = computed(() => this.respuestas().filter(r => r !== -1).length);
  todasRespondidas = computed(() => this.respondidas() === 10);
  porcentaje    = computed(() => Math.round((this.puntuacion() / 30) * 100));

  nivel = computed<'bajo' | 'moderado' | 'alto'>(() => {
    const p = this.puntuacion();
    if (p <= 7)  return 'bajo';
    if (p <= 17) return 'moderado';
    return 'alto';
  });

  iconoNivel = computed(() =>
    ({ bajo: '✅', moderado: '⚠️', alto: '🚨' })[this.nivel()]
  );

  etiquetaNivel = computed(() =>
    ({ bajo: 'Riesgo bajo', moderado: 'Riesgo moderado', alto: 'Riesgo alto' })[this.nivel()]
  );

  descripcionNivel = computed(() => ({
    bajo:
      'Tus respuestas no muestran señales importantes de juego problemático. ' +
      'Seguí manteniendo hábitos saludables y recordá que las apuestas son solo entretenimiento.',
    moderado:
      'Algunas de tus respuestas podrían indicar hábitos de riesgo. ' +
      'Considerá establecer límites claros de tiempo y dinero, y reducir la frecuencia de tus apuestas.',
    alto:
      'Tus respuestas muestran posibles señales de juego compulsivo. ' +
      'Te recomendamos buscar orientación profesional o contactar un centro de asistencia especializado.',
  })[this.nivel()]);

  seleccionar(idx: number, valor: number) {
    const copia = [...this.respuestas()];
    copia[idx] = valor;
    this.respuestas.set(copia);
  }

  calcular() {
    this.puntuacion.set(this.respuestas().reduce((sum, r) => sum + r, 0));
    this.completado.set(true);
  }

  reiniciar() {
    this.respuestas.set(new Array(10).fill(-1));
    this.completado.set(false);
    this.puntuacion.set(0);
  }
}
