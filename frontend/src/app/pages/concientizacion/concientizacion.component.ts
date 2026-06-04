// ============================================================
// pages/concientizacion/concientizacion.component.ts
// Sección de concientización sobre juego responsable.
// ============================================================

import { Component, inject } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { Router }            from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { AuthService }  from '../../services/auth.service';
import { CuestionarioRiesgoComponent } from '../../components/cuestionario-riesgo/cuestionario-riesgo.component';

@Component({
  selector: 'app-concientizacion',
  standalone: true,
  imports: [CommonModule, CuestionarioRiesgoComponent],
  template: `
    <div class="conc-wrapper">

      <!-- ── HERO ──────────────────────────────────────────── -->
      <section class="conc-hero">
        <div class="conc-contenedor">
          <span class="etiqueta-pill etiqueta-pill--roja">🎗️ Juego Responsable</span>
          <h1 class="conc-hero__titulo">Apostar con responsabilidad</h1>
          <p class="conc-hero__subtitulo">
            Las apuestas son entretenimiento. Tu bienestar siempre primero.
          </p>
        </div>
      </section>

      <div class="conc-contenedor conc-contenido">

        <!-- ── CUESTIONARIO DE RIESGO ────────────────────── -->
        <app-cuestionario-riesgo />

        <!-- ── VIDEO 1 ────────────────────────────────────── -->
        <div class="video-wrapper">
          <iframe
            [src]="videos[0]"
            title="Video de concientización sobre juego responsable"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <!-- ── TEXTO PRINCIPAL ────────────────────────────── -->
        <section class="conc-seccion">
          <p class="conc-parrafo">
            Las apuestas deben entenderse como una forma de entretenimiento y no como una fuente de ingresos ni una solución económica. Apostar de manera constante o impulsiva puede generar consecuencias negativas en la salud emocional, las relaciones personales y la estabilidad financiera.
          </p>
          <p class="conc-parrafo">
            Por eso, es importante establecer límites claros antes de jugar: definir cuánto dinero y cuánto tiempo se está dispuesto a utilizar, y respetar esos límites sin excepción. Nunca se recomienda apostar dinero destinado a gastos esenciales, estudios, ahorros o responsabilidades personales.
          </p>
        </section>

        <!-- ── VIDEO 2 ────────────────────────────────────── -->
        <div class="video-wrapper">
          <iframe
            [src]="videos[1]"
            title="Video de concientización sobre juego responsable"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <!-- ── SEÑALES DE ALERTA ──────────────────────────── -->
        <section class="conc-seccion conc-alertas">
          <h2 class="conc-seccion__titulo">
            <span class="conc-seccion__icono">⚠️</span>
            Señales de alerta
          </h2>
          <p class="conc-parrafo">
            También es fundamental reconocer ciertas señales de alerta:
          </p>
          <ul class="alertas-lista">
            <li class="alertas-item">
              <span class="alertas-item__dot"></span>
              Necesidad de apostar cada vez más dinero.
            </li>
            <li class="alertas-item">
              <span class="alertas-item__dot"></span>
              Intentar recuperar pérdidas apostando nuevamente.
            </li>
            <li class="alertas-item">
              <span class="alertas-item__dot"></span>
              Sentir ansiedad o enojo al no poder jugar.
            </li>
            <li class="alertas-item">
              <span class="alertas-item__dot"></span>
              Ocultar el tiempo o dinero destinado a las apuestas.
            </li>
            <li class="alertas-item">
              <span class="alertas-item__dot"></span>
              Descuidar estudios, trabajo o relaciones personales por apostar.
            </li>
          </ul>
        </section>

        <!-- ── VIDEO 3 ────────────────────────────────────── -->
        <div class="video-wrapper">
          <iframe
            [src]="videos[2]"
            title="Video de concientización sobre juego responsable"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen>
          </iframe>
        </div>

        <!-- ── CIERRE ─────────────────────────────────────── -->
        <section class="conc-seccion conc-cierre">
          <p class="conc-parrafo">
            El juego responsable implica mantener el control en todo momento. Si las apuestas dejan de ser una diversión y comienzan a generar preocupación, estrés o dependencia, es importante buscar ayuda y hablar con personas de confianza o profesionales especializados.
          </p>
          <p class="conc-parrafo">
            Nuestro objetivo es promover hábitos responsables y conscientes, priorizando siempre el bienestar personal por encima de cualquier apuesta.
          </p>
        </section>

        <!-- ── CTA ────────────────────────────────────────── -->
        <div class="conc-cta">
          <p class="conc-cta__texto">
            ¿Querés saber cuánto podés destinar responsablemente a apuestas cada mes?
          </p>
          <button (click)="irAlCalculador()" class="btn btn--primario">
            Calculá tu límite seguro →
          </button>
        </div>

      </div>
    </div>
  `,
  styles: [`
    .conc-wrapper {
      min-height: 100vh;
      background: var(--color-fondo);
    }

    .conc-contenedor {
      max-width: 860px;
      margin: 0 auto;
      padding: 0 24px;
    }

    /* Hero */
    .conc-hero {
      background: radial-gradient(ellipse at 50% 0%, rgba(255,79,109,0.1) 0%, transparent 60%),
                  linear-gradient(180deg, #0d1015 0%, var(--color-fondo) 100%);
      padding: 80px 0 60px;
      text-align: center;
    }

    .conc-hero__titulo {
      font-family: var(--fuente-display);
      font-size: clamp(2rem, 5vw, 3rem);
      font-weight: 800;
      color: var(--color-texto);
      margin: 20px 0 16px;
      letter-spacing: -0.02em;
    }

    .conc-hero__subtitulo {
      font-size: 1.05rem;
      color: var(--color-texto-suave);
      line-height: 1.6;
    }

    .etiqueta-pill--roja {
      background: rgba(255,79,109,0.12);
      color: var(--color-peligro);
      border: 1px solid rgba(255,79,109,0.25);
      display: inline-block;
      padding: 6px 14px;
      border-radius: 100px;
      font-size: 0.78rem;
      font-weight: 600;
      letter-spacing: 0.04em;
    }

    /* Contenido */
    .conc-contenido {
      display: flex;
      flex-direction: column;
      gap: 48px;
      padding-top: 60px;
      padding-bottom: 80px;
    }

    /* Videos */
    .video-wrapper {
      position: relative;
      width: 100%;
      padding-bottom: 56.25%; /* 16:9 */
      border-radius: 16px;
      overflow: hidden;
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
    }

    .video-wrapper iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
    }

    /* Secciones de texto */
    .conc-seccion {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .conc-seccion__titulo {
      font-family: var(--fuente-display);
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--color-texto);
      margin: 0;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .conc-seccion__icono { font-size: 1.4rem; }

    .conc-parrafo {
      font-size: 1rem;
      color: var(--color-texto-suave);
      line-height: 1.8;
      margin: 0;
    }

    /* Señales de alerta */
    .conc-alertas {
      background: rgba(255,79,109,0.05);
      border: 1px solid rgba(255,79,109,0.2);
      border-radius: 16px;
      padding: 28px 32px;
    }

    .alertas-lista {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .alertas-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      font-size: 0.95rem;
      color: var(--color-texto-suave);
      line-height: 1.5;
    }

    .alertas-item__dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--color-peligro);
      flex-shrink: 0;
      margin-top: 6px;
    }

    /* Cierre */
    .conc-cierre {
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: 16px;
      padding: 28px 32px;
    }

    /* CTA */
    .conc-cta {
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      padding: 40px;
      background: rgba(0,229,160,0.05);
      border: 1px solid rgba(0,229,160,0.2);
      border-radius: 16px;
    }

    .conc-cta__texto {
      font-size: 1.05rem;
      color: var(--color-texto-suave);
      max-width: 500px;
      line-height: 1.6;
      margin: 0;
    }

    @media (max-width: 600px) {
      .conc-alertas { padding: 20px; }
      .conc-cierre  { padding: 20px; }
      .conc-cta     { padding: 24px 20px; }
    }
  `],
})
export class ConcientizacionComponent {
  private sanitizer   = inject(DomSanitizer);
  private router      = inject(Router);
  private authService = inject(AuthService);

  irAlCalculador(): void {
    this.router.navigate(
      this.authService.estaLogueado() ? ['/salud-financiera'] : ['/']
    );
  }

  videos: SafeResourceUrl[] = [
    this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/9Y9i1qO5U2g'),
    this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/kv6k5U3SUEM'),
    this.sanitizer.bypassSecurityTrustResourceUrl('https://www.youtube.com/embed/vMA8VxB0NX0'),
  ];
}
