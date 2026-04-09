// ============================================================
// core/models/partido.model.ts
// Tipos TypeScript que mapean las respuestas del backend
// ============================================================

export interface Liga {
  id:     number;
  nombre: string;
  pais:   string;
  logo:   string;
}

export interface Equipo {
  id:     number;
  nombre: string;
  logo:   string;
  goles:  number | null;
}

export interface Partido {
  id:              number;
  estado:          string;
  minuto:          number | null;
  liga:            Liga;
  equipoLocal:     Equipo;
  equipoVisitante: Equipo;
}

export interface PulseScore {
  score:    number;
  momentum: string;
}

export interface PulsePartido {
  fixtureId: number;
  timestamp: string;
  pulse: {
    local:     PulseScore;
    visitante: PulseScore;
  };
}

export interface Noticia {
  titulo: string;
  url:    string;
  imagen: string | null;
  fecha:  string | null;
  fuente: string;
}
