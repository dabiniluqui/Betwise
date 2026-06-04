// ============================================================
// pages/dashboard/dashboard.component.ts
// Panel del usuario: favoritos + Pulse Score en vivo
// ============================================================

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule }     from '@angular/common';
import { Subscription }     from 'rxjs';
import { FavoritosService, Favorito } from '../../services/favoritos.service';
import { PartidosService }  from '../../services/partidos.service';
import { SocketService }    from '../../services/socket.service';
import { AuthService }      from '../../services/auth.service';
import { Partido }          from '../../core/models/partido.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dash-wrapper">
      <div class="contenedor">

        <header class="dash-header">
          <h1 class="dash-header__titulo">
            Mi Panel · {{ authService.usuario()?.nombre || 'Usuario' }}
          </h1>
          <p class="dash-header__subtitulo">
            Partidos en vivo con Pulse Score ⚡ · Socket conectado
          </p>
        </header>

        <!-- Partidos en vivo con Pulse -->
        <section class="dash-seccion">
          <h2 class="dash-seccion__titulo">⚡ Partidos en vivo — Pulse Score</h2>

          <div class="estado-carga" *ngIf="cargando()">
            <div class="spinner"></div><p>Cargando partidos...</p>
          </div>

          <div class="estado-error" *ngIf="!cargando() && errorConexion()">
            <p>⚠️ {{ errorConexion() }}</p>
          </div>

          <div class="estado-vacio" *ngIf="!cargando() && !errorConexion() && partidos().length === 0">
            <p>🏟️ No hay partidos en vivo ahora mismo.</p>
          </div>

          <div class="partidos-lista" *ngIf="!cargando() && partidos().length > 0">
            <div class="partido-card" *ngFor="let p of partidos()">
              <span class="partido-card__liga">{{ p.liga.nombre }} · {{ p.liga.pais }}</span>

              <div class="partido-card__encuentro">
                <div class="partido-card__equipo">
                  <img class="partido-card__escudo"
                       [src]="p.equipoLocal.logo"
                       [alt]="p.equipoLocal.nombre"
                       (error)="onImgError($event)" />
                  <span class="partido-card__nombre">{{ p.equipoLocal.nombre }}</span>
                </div>

                <div class="partido-card__centro">
                  <div class="partido-card__score">
                    {{ p.equipoLocal.goles ?? '-' }} : {{ p.equipoVisitante.goles ?? '-' }}
                  </div>
                  <span class="badge-live">{{ p.minuto ? p.minuto + "'" : p.estado }}</span>
                </div>

                <div class="partido-card__equipo">
                  <img class="partido-card__escudo"
                       [src]="p.equipoVisitante.logo"
                       [alt]="p.equipoVisitante.nombre"
                       (error)="onImgError($event)" />
                  <span class="partido-card__nombre">{{ p.equipoVisitante.nombre }}</span>
                </div>
              </div>

              <div class="partido-card__acciones">
                <button class="btn btn--ghost btn--pequeño"
                        (click)="suscribirPulse(p)">
                  Ver Pulse ⚡
                </button>
                <button class="btn btn--ghost btn--pequeño"
                        (click)="agregarFavorito(p)">
                  ☆ Favorito
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Mis favoritos -->
        <section class="dash-seccion">
          <h2 class="dash-seccion__titulo">⭐ Mis partidos favoritos</h2>

          <div class="estado-vacio" *ngIf="favoritos().length === 0">
            <p>No tenés partidos favoritos guardados todavía.</p>
          </div>

          <div class="favoritos-lista">
            <div class="favorito-item" *ngFor="let f of favoritos()">
              <div class="favorito-item__info">
                <span class="favorito-item__liga">{{ f.liga }}</span>
                <span class="favorito-item__partido">{{ f.equipo_local }} vs {{ f.equipo_visitante }}</span>
              </div>
              <button class="btn btn--ghost btn--pequeño btn--peligro"
                      (click)="eliminarFavorito(f.id)">Eliminar</button>
            </div>
          </div>
        </section>

      </div>
    </div>
  `,
  styles: [`
    .dash-wrapper { padding: 60px 0; background: var(--color-fondo); min-height: 100vh; }
    .contenedor   { max-width: 1140px; margin: 0 auto; padding: 0 24px; }
    .dash-header  { margin-bottom: 40px; }
    .dash-header__titulo { font-family: var(--fuente-display); font-size: 2rem; font-weight: 800; color: var(--color-texto); margin: 0 0 6px; }
    .dash-header__subtitulo { font-size: 0.88rem; color: var(--color-texto-suave); }
    .dash-seccion { margin-bottom: 40px; }
    .dash-seccion__titulo { font-family: var(--fuente-display); font-size: 1.15rem; font-weight: 700; color: var(--color-texto); margin: 0 0 18px; padding-bottom: 12px; border-bottom: 1px solid var(--color-borde); }
    .partidos-lista, .favoritos-lista { display: flex; flex-direction: column; gap: 12px; }
    .partido-card {
      display: flex; flex-direction: column; gap: 14px;
      background: var(--color-superficie); border: 1px solid var(--color-borde);
      border-radius: 14px; padding: 16px 20px;
    }
    .partido-card__liga { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-texto-muy-suave); }
    .partido-card__encuentro {
      display: flex; align-items: center; justify-content: space-between; gap: 12px;
    }
    .partido-card__equipo {
      display: flex; flex-direction: column; align-items: center; gap: 8px;
      flex: 1; text-align: center;
    }
    .partido-card__escudo { width: 48px; height: 48px; object-fit: contain; }
    .partido-card__nombre { font-size: 0.85rem; font-weight: 600; color: var(--color-texto); }
    .partido-card__centro { display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .partido-card__score { font-family: var(--fuente-display); font-size: 1.8rem; font-weight: 800; color: var(--color-texto); }
    .partido-card__acciones { display: flex; gap: 8px; justify-content: flex-end; }
    .favorito-item {
      display: flex; justify-content: space-between; align-items: center;
      background: var(--color-superficie); border: 1px solid var(--color-borde);
      border-radius: 12px; padding: 14px 18px;
    }
    .favorito-item__info  { display: flex; flex-direction: column; gap: 3px; }
    .favorito-item__liga  { font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-texto-muy-suave); }
    .favorito-item__partido { font-size: 0.9rem; font-weight: 600; color: var(--color-texto); }
    .btn--peligro { color: var(--color-peligro) !important; border-color: rgba(255,79,109,0.3) !important; }
    .estado-carga { display: flex; flex-direction: column; align-items: center; gap: 12px; padding: 40px 0; color: var(--color-texto-suave); font-size: 0.9rem; }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--color-borde); border-top-color: var(--color-acento); border-radius: 50%; animation: girar 0.8s linear infinite; }
    @keyframes girar { to { transform: rotate(360deg); } }
    .estado-vacio { text-align: center; padding: 40px 0; font-size: 0.9rem; color: var(--color-texto-suave); }
    .estado-error { text-align: center; padding: 20px; font-size: 0.88rem; color: var(--color-peligro); background: var(--color-peligro-suave); border: 1px solid rgba(255,79,109,0.2); border-radius: 10px; }
    .badge-live { font-size: 0.62rem; font-weight: 700; background: var(--color-peligro); color: white; padding: 2px 7px; border-radius: 100px; text-transform: uppercase; width: fit-content; animation: pulsar 1.5s ease-in-out infinite; }
    @keyframes pulsar { 0%,100%{opacity:1}50%{opacity:0.6} }
  `],
})
export class DashboardComponent implements OnInit, OnDestroy {
  authService   = inject(AuthService);
  private favSvc    = inject(FavoritosService);
  private partSvc   = inject(PartidosService);
  private socketSvc = inject(SocketService);

  partidos  = signal<Partido[]>([]);
  favoritos = signal<Favorito[]>([]);
  cargando  = signal(true);
  errorConexion = signal<string | null>(null);

  private subs = new Subscription();

  ngOnInit(): void {
    this.cargarPartidos();
    this.cargarFavoritos();
    this.escucharSocket();
  }

  private cargarPartidos(): void {
    this.partSvc.obtenerEnVivo().subscribe({
      next: (p) => { this.partidos.set(p); this.cargando.set(false); },
      error: (err) => {
        const msg = err.status === 0
          ? 'No se puede conectar al servidor. Asegurate de que el backend esté corriendo en puerto 3000.'
          : 'Error al cargar los partidos. Intentá recargar la página.';
        this.errorConexion.set(msg);
        this.cargando.set(false);
      },
    });
  }

  private cargarFavoritos(): void {
    this.favSvc.obtener().subscribe((f) => this.favoritos.set(f));
  }

  private escucharSocket(): void {
    const sub = this.socketSvc.escucharPartidos().subscribe((data) => {
      this.partidos.set(data.partidos as any);
    });
    this.subs.add(sub);
  }

  suscribirPulse(partido: Partido): void {
    this.socketSvc.suscribirPartido(partido.id);
  }

  agregarFavorito(partido: Partido): void {
    this.favSvc.agregar({
      fixture_id:       partido.id,
      equipo_local:     partido.equipoLocal.nombre,
      equipo_visitante: partido.equipoVisitante.nombre,
      liga:             partido.liga.nombre,
    }).subscribe((f) => this.favoritos.update((prev) => [f, ...prev]));
  }

  eliminarFavorito(id: string): void {
    this.favSvc.eliminar(id).subscribe(() => {
      this.favoritos.update((prev) => prev.filter((f) => f.id !== id));
    });
  }

  onImgError(event: Event): void {
    (event.target as HTMLImageElement).style.visibility = 'hidden';
  }

  ngOnDestroy(): void { this.subs.unsubscribe(); }
}
