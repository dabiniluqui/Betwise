-- ============================================================
-- db/schema.sql — Clase 7: Base de datos
-- Ejecutar este script en el SQL Editor de Supabase
-- ============================================================

-- Tabla de usuarios registrados
CREATE TABLE IF NOT EXISTS usuarios (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email      TEXT UNIQUE NOT NULL,
  password   TEXT NOT NULL,          -- Hash bcrypt (Clase 10)
  nombre     TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tabla de perfil financiero (uno por usuario)
CREATE TABLE IF NOT EXISTS perfil_financiero (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id            UUID REFERENCES usuarios(id) ON DELETE CASCADE UNIQUE,
  sueldo_neto           NUMERIC NOT NULL DEFAULT 0,
  gasto_alquiler        NUMERIC NOT NULL DEFAULT 0,
  gasto_servicios       NUMERIC NOT NULL DEFAULT 0,
  gasto_transporte      NUMERIC NOT NULL DEFAULT 0,
  gasto_cuotas          NUMERIC NOT NULL DEFAULT 0,
  gasto_alimentacion    NUMERIC NOT NULL DEFAULT 0,
  gasto_entretenimiento NUMERIC NOT NULL DEFAULT 0,
  gasto_otros           NUMERIC NOT NULL DEFAULT 0,
  nivel_ahorro          TEXT NOT NULL DEFAULT 'recomendado_20',
  updated_at            TIMESTAMP DEFAULT NOW()
);

-- Tabla de registro mensual de gastos en apuestas
CREATE TABLE IF NOT EXISTS registro_mensual (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  mes              INTEGER NOT NULL CHECK (mes BETWEEN 1 AND 12),
  anio             INTEGER NOT NULL,
  limite_calculado NUMERIC NOT NULL DEFAULT 0,
  total_registrado NUMERIC NOT NULL DEFAULT 0,
  entradas         JSONB NOT NULL DEFAULT '[]',  -- Array de {monto, descripcion, fecha}
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, mes, anio)
);

-- Tabla de partidos guardados como favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id       UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  fixture_id       INTEGER NOT NULL,
  equipo_local     TEXT NOT NULL,
  equipo_visitante TEXT NOT NULL,
  liga             TEXT NOT NULL,
  created_at       TIMESTAMP DEFAULT NOW(),
  UNIQUE(usuario_id, fixture_id)
);

-- Tabla de log de actividad del usuario
CREATE TABLE IF NOT EXISTS actividad_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE CASCADE,
  accion     TEXT NOT NULL,    -- 'favorito_agregado', 'gasto_registrado', etc.
  detalle    JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
