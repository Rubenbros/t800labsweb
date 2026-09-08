-- Esquema de t800labsweb en Cloud SQL (PostgreSQL 17).
-- Idempotente: se puede aplicar tantas veces como haga falta.
-- Aplicar con: npm run db:schema   (necesita DATABASE_URL)

-- Contadores del panel HAL 9000. Un valor escalar por clave:
--   shutdowns   nº total de apagados
--   visitors    nº total de visitas
--   avg_time    media móvil del tiempo de apagado (segundos)
--   fastest     mejor tiempo (segundos)
--   last_24h    contador de la ventana de 24 h
--   last_reset  epoch en milisegundos del último reinicio de la ventana
--   seeded      1 cuando ya se han sembrado los valores iniciales
CREATE TABLE IF NOT EXISTS hal_stats (
  key        text PRIMARY KEY,
  value      double precision NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Negocios de las demos creadas dinámicamente (Lead Hunter).
-- Esta tabla NO es caché: es la única persistencia de esas fichas.
CREATE TABLE IF NOT EXISTS demo_businesses (
  slug       text PRIMARY KEY,
  data       jsonb NOT NULL,
  visits     integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
