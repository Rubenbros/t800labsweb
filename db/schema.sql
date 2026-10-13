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

-- Presupuesto por audio (demo T800 Labs, docs/adr/0002-presupuesto-por-audio.md).
-- Cupos diarios: una fila por día (hora de Madrid) y clave ('global', 'sujeto:tg:<chat>', 'sujeto:web').
CREATE TABLE IF NOT EXISTS presupuesto_uso_diario (
  dia   date    NOT NULL,
  clave text    NOT NULL,
  n     integer NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, clave)
);

-- Chats de Telegram dados de alta con /start <código>.
CREATE TABLE IF NOT EXISTS presupuesto_telegram_chats (
  chat_id bigint PRIMARY KEY,
  alta    timestamptz NOT NULL DEFAULT now()
);

-- Actualizaciones de Telegram ya atendidas (Telegram reintenta si tardamos).
CREATE TABLE IF NOT EXISTS presupuesto_telegram_updates (
  update_id bigint PRIMARY KEY,
  recibida  timestamptz NOT NULL DEFAULT now()
);

-- Un registro por borrador: tiempos y coste medidos (sin audio ni transcripción).
CREATE TABLE IF NOT EXISTS presupuesto_registro (
  id             bigserial PRIMARY KEY,
  creado         timestamptz NOT NULL DEFAULT now(),
  canal          text        NOT NULL,
  ok             boolean     NOT NULL,
  error          text,
  ms_total       integer     NOT NULL,
  ms_ia          integer,
  ms_pdf         integer,
  modelo         text,
  tokens_entrada integer,
  tokens_salida  integer,
  coste_usd      numeric(10, 6),
  lineas         integer,
  pendientes     integer
);
