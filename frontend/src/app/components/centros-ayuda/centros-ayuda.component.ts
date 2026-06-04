import {
  Component,
  AfterViewInit,
  OnDestroy,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as L from 'leaflet';

interface Centro {
  nombre: string;
  direccion: string;
  telefono: string;
  lat: number;
  lon: number;
}

const CENTROS: Centro[] = [
  {
    nombre: 'Centro Avellaneda',
    direccion: 'Av. Mitre 2071 P.A., Crucecita, Prov. de Buenos Aires',
    telefono: '+54 11 4265-0080 / 4203-2161',
    lat: -34.6616,
    lon: -58.3654,
  },
  {
    nombre: 'Centro Bahía Blanca',
    direccion: 'Lavalle N° 229, Bahía Blanca, Prov. de Buenos Aires',
    telefono: '(291) 5767117',
    lat: -38.7183,
    lon: -62.2663,
  },
  {
    nombre: 'Centro Mar del Plata',
    direccion: '9 de Julio 3475 P.A., Mar del Plata, Prov. de Buenos Aires',
    telefono: '(0223) 476-1241',
    lat: -37.9907,
    lon: -57.6052,
  },
  {
    nombre: 'Centro Morón',
    direccion: 'Mendoza N° 372, Morón, Prov. de Buenos Aires',
    telefono: '(011) 4483-6173',
    lat: -34.6505,
    lon: -58.6199,
  },
  {
    nombre: 'Centro La Plata',
    direccion: 'Diagonal 74 N° 1627, La Plata, Prov. de Buenos Aires',
    telefono: '(0221) 427-1657',
    lat: -34.9139,
    lon: -57.9448,
  },
  {
    nombre: 'Centro Necochea',
    direccion: 'Calle 56 N° 3159, Necochea, Prov. de Buenos Aires',
    telefono: '(02262) 420-085',
    lat: -38.5527,
    lon: -58.7434,
  },
  {
    nombre: 'Centro Olavarría',
    direccion: 'Hornos 2992, Olavarría, Prov. de Buenos Aires',
    telefono: '(02284) 410-102',
    lat: -36.8947,
    lon: -60.3222,
  },
  {
    nombre: 'Centro Pergamino',
    direccion: 'Estrada N° 1939, Pergamino, Prov. de Buenos Aires',
    telefono: '(02477) 41-4554/55',
    lat: -33.8903,
    lon: -60.5611,
  },
  {
    nombre: 'Centro Tandil',
    direccion: 'Colombia N° 620, Depto. 2, Tandil, Prov. de Buenos Aires',
    telefono: '(0249) 443-1836',
    lat: -37.3204,
    lon: -59.1385,
  },
  {
    nombre: 'Centro Vicente López',
    direccion: 'Dr. Nicolás Repetto N° 4237 (Olivos), Prov. de Buenos Aires',
    telefono: '(011) 4836-0320',
    lat: -34.5137,
    lon: -58.4988,
  },
];

@Component({
  selector: 'app-centros-ayuda',
  standalone: true,
  template: `
    <section class="centros-ayuda">
      <div class="centros-ayuda__header">
        <span class="etiqueta-pill etiqueta-pill--roja">🎗️ Centros de Ayuda</span>
        <h2 class="centros-ayuda__titulo">Centros de Ayuda</h2>
        <p class="centros-ayuda__desc">
          Si sentís que las apuestas dejaron de ser entretenimiento, buscar ayuda también es una decisión inteligente.
          Encontrá centros de asistencia y prevención cerca tuyo.
        </p>
      </div>
      <div #mapContainer class="centros-ayuda__mapa"></div>
      <p class="centros-ayuda__disclaimer">
        BetWise no se encuentra afiliado oficialmente a las instituciones listadas.
      </p>
    </section>
  `,
  styles: [`
    .centros-ayuda {
      background: var(--color-superficie);
      border: 1px solid var(--color-borde);
      border-radius: 20px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .centros-ayuda__header {
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 680px;
    }

    .centros-ayuda__titulo {
      font-family: var(--fuente-display);
      font-size: 1.5rem;
      font-weight: 800;
      color: var(--color-texto);
      margin: 0;
    }

    .centros-ayuda__desc {
      font-size: 0.95rem;
      color: var(--color-texto-suave);
      line-height: 1.65;
      margin: 0;
    }

    .centros-ayuda__mapa {
      height: 420px;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid var(--color-borde);
    }

    .centros-ayuda__disclaimer {
      font-size: 0.75rem;
      color: var(--color-texto-muy-suave);
      margin: 0;
      text-align: center;
    }

    @media (max-width: 520px) {
      .centros-ayuda {
        padding: 24px 16px;
      }
      .centros-ayuda__mapa {
        height: 280px;
      }
    }
  `],
})
export class CentrosAyudaComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;
  private map: L.Map | null = null;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    this.map?.remove();
    this.map = null;
  }

  private initMap(): void {
    this.map = L.map(this.mapContainer.nativeElement, {
      center: [-36.6, -60.0],
      zoom: 7,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(this.map);

    for (const centro of CENTROS) {
      const marker = L.circleMarker([centro.lat, centro.lon], {
        radius: 10,
        fillColor: '#00e5a0',
        color: '#00e5a0',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.75,
      });

      marker.bindPopup(`
        <div style="
          font-family: 'DM Sans', sans-serif;
          min-width: 200px;
          padding: 4px 2px;
        ">
          <strong style="
            font-size: 0.9rem;
            color: #0a0c10;
            display: block;
            margin-bottom: 6px;
          ">${centro.nombre}</strong>
          <p style="
            font-size: 0.78rem;
            color: #444;
            margin: 0 0 4px;
            line-height: 1.4;
          ">📍 ${centro.direccion}</p>
          <p style="
            font-size: 0.78rem;
            color: #444;
            margin: 0;
          ">📞 ${centro.telefono}</p>
        </div>
      `, { maxWidth: 280 });

      marker.addTo(this.map!);
    }
  }
}
