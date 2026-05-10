-- ============================================================
-- MIGRATION 001 — Schema inicial completo
-- Plataforma Náutica Premium — Lancha em Cabo Frio
-- ============================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- ENUM TYPES
-- ============================================================

CREATE TYPE user_role AS ENUM ('client', 'owner', 'admin');
CREATE TYPE boat_category AS ENUM ('lancha', 'jetski', 'barco', 'veleiro', 'catamara');
CREATE TYPE boat_status AS ENUM ('pending', 'active', 'inactive', 'rejected');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'refunded');
CREATE TYPE availability_status AS ENUM ('available', 'blocked', 'reserved');
CREATE TYPE payment_provider AS ENUM ('mercadopago', 'stripe');
CREATE TYPE payment_status AS ENUM ('pending', 'approved', 'rejected', 'refunded');
CREATE TYPE route_difficulty AS ENUM ('calm', 'moderate', 'rough');
CREATE TYPE route_ideal_for AS ENUM ('family', 'couple', 'group', 'all');
CREATE TYPE extra_unit AS ENUM ('unit', 'kg', 'liter', 'person');
CREATE TYPE extra_category AS ENUM ('food', 'drink', 'decoration', 'activity', 'other');

-- ============================================================
-- TABELA: cities (cidades — multi-cidade desde o início)
-- ============================================================

CREATE TABLE cities (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  state       VARCHAR(2) NOT NULL,
  active      BOOLEAN NOT NULL DEFAULT false,
  image_url   TEXT,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: profiles (usuários — clientes, proprietários, admins)
-- ============================================================

CREATE TABLE profiles (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role NOT NULL DEFAULT 'client',
  full_name   TEXT NOT NULL DEFAULT '',
  phone       TEXT,
  avatar_url  TEXT,
  verified_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: marinas
-- ============================================================

CREATE TABLE marinas (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id    UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  address    TEXT NOT NULL,
  lat        DOUBLE PRECISION NOT NULL DEFAULT 0,
  lng        DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: boats (embarcações)
-- ============================================================

CREATE TABLE boats (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id                UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  city_id                 UUID NOT NULL REFERENCES cities(id),
  marina_id               UUID REFERENCES marinas(id),
  name                    TEXT NOT NULL,
  slug                    TEXT NOT NULL UNIQUE,
  category                boat_category NOT NULL DEFAULT 'lancha',
  description             TEXT NOT NULL DEFAULT '',
  capacity                INTEGER NOT NULL DEFAULT 10,
  size_ft                 INTEGER NOT NULL DEFAULT 20,
  status                  boat_status NOT NULL DEFAULT 'pending',
  amenities               JSONB NOT NULL DEFAULT '{
    "marinheiro": false,
    "churrasqueira": false,
    "cooler": false,
    "banheiro": false,
    "ducha": false,
    "som": false,
    "wifi": false,
    "toldo": false,
    "ancora": false
  }'::jsonb,
  base_price              NUMERIC(10,2) NOT NULL DEFAULT 0,
  price_per_extra_person  NUMERIC(10,2) NOT NULL DEFAULT 0,
  rules                   TEXT,
  cover_photo             TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: boat_photos
-- ============================================================

CREATE TABLE boat_photos (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id    UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  url        TEXT NOT NULL,
  "order"    INTEGER NOT NULL DEFAULT 0,
  is_cover   BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: routes (roteiros)
-- ============================================================

CREATE TABLE routes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id        UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name           TEXT NOT NULL,
  slug           TEXT NOT NULL UNIQUE,
  description    TEXT NOT NULL DEFAULT '',
  duration_hours NUMERIC(4,1) NOT NULL DEFAULT 4,
  difficulty     route_difficulty NOT NULL DEFAULT 'calm',
  ideal_for      route_ideal_for NOT NULL DEFAULT 'all',
  image_url      TEXT,
  map_url        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: boat_routes (roteiros por embarcação)
-- ============================================================

CREATE TABLE boat_routes (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id        UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  route_id       UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
  price_override NUMERIC(10,2),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(boat_id, route_id)
);

-- ============================================================
-- TABELA: extras (opcionais)
-- ============================================================

CREATE TABLE extras (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name     TEXT NOT NULL,
  unit     extra_unit NOT NULL DEFAULT 'unit',
  price    NUMERIC(10,2) NOT NULL DEFAULT 0,
  icon     TEXT,
  category extra_category NOT NULL DEFAULT 'other',
  active   BOOLEAN NOT NULL DEFAULT true
);

-- ============================================================
-- TABELA: availabilities (disponibilidade por data)
-- ============================================================

CREATE TABLE availabilities (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  date    DATE NOT NULL,
  status  availability_status NOT NULL DEFAULT 'available',
  UNIQUE(boat_id, date)
);

-- ============================================================
-- TABELA: bookings (reservas)
-- ============================================================

CREATE TABLE bookings (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id          UUID NOT NULL REFERENCES boats(id),
  client_id        UUID NOT NULL REFERENCES profiles(id),
  route_id         UUID REFERENCES routes(id),
  date             DATE NOT NULL,
  start_time       TIME NOT NULL DEFAULT '09:00',
  passenger_count  INTEGER NOT NULL DEFAULT 1,
  status           booking_status NOT NULL DEFAULT 'pending',
  base_price       NUMERIC(10,2) NOT NULL DEFAULT 0,
  extras_total     NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee     NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount     NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_id       UUID,
  notes            TEXT,
  booking_code     TEXT UNIQUE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: booking_extras (opcionais da reserva)
-- ============================================================

CREATE TABLE booking_extras (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  extra_id   UUID NOT NULL REFERENCES extras(id),
  quantity   NUMERIC(10,2) NOT NULL DEFAULT 1,
  price      NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- ============================================================
-- TABELA: payments (pagamentos)
-- ============================================================

CREATE TABLE payments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id  UUID NOT NULL REFERENCES bookings(id),
  provider    payment_provider NOT NULL DEFAULT 'mercadopago',
  external_id TEXT,
  status      payment_status NOT NULL DEFAULT 'pending',
  amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  fee         NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Adicionar FK de bookings → payments
ALTER TABLE bookings
  ADD CONSTRAINT fk_bookings_payment
  FOREIGN KEY (payment_id) REFERENCES payments(id);

-- ============================================================
-- TABELA: reviews (avaliações)
-- ============================================================

CREATE TABLE reviews (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id       UUID NOT NULL UNIQUE REFERENCES bookings(id),
  boat_id          UUID NOT NULL REFERENCES boats(id),
  client_id        UUID NOT NULL REFERENCES profiles(id),
  rating_overall   NUMERIC(2,1) NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_boat      NUMERIC(2,1) NOT NULL CHECK (rating_boat BETWEEN 1 AND 5),
  rating_captain   NUMERIC(2,1) NOT NULL CHECK (rating_captain BETWEEN 1 AND 5),
  comment          TEXT,
  photos           TEXT[] DEFAULT '{}',
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- TABELA: favorites (favoritos)
-- ============================================================

CREATE TABLE favorites (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  boat_id    UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, boat_id)
);

-- ============================================================
-- ÍNDICES para performance
-- ============================================================

CREATE INDEX idx_boats_city_id        ON boats(city_id);
CREATE INDEX idx_boats_owner_id       ON boats(owner_id);
CREATE INDEX idx_boats_status         ON boats(status);
CREATE INDEX idx_boats_category       ON boats(category);
CREATE INDEX idx_boat_photos_boat_id  ON boat_photos(boat_id);
CREATE INDEX idx_boat_routes_boat_id  ON boat_routes(boat_id);
CREATE INDEX idx_boat_routes_route_id ON boat_routes(route_id);
CREATE INDEX idx_routes_city_id       ON routes(city_id);
CREATE INDEX idx_availabilities_boat_date ON availabilities(boat_id, date);
CREATE INDEX idx_bookings_boat_id     ON bookings(boat_id);
CREATE INDEX idx_bookings_client_id   ON bookings(client_id);
CREATE INDEX idx_bookings_date        ON bookings(date);
CREATE INDEX idx_bookings_status      ON bookings(status);
CREATE INDEX idx_reviews_boat_id      ON reviews(boat_id);
CREATE INDEX idx_favorites_user_id    ON favorites(user_id);

-- ============================================================
-- FUNÇÃO: updated_at automático
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_cities
  BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_boats
  BEFORE UPDATE ON boats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_routes
  BEFORE UPDATE ON routes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_bookings
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_payments
  BEFORE UPDATE ON payments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- FUNÇÃO: criar profile automaticamente ao registrar usuário
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- FUNÇÃO: gerar booking_code único
-- ============================================================

CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_code = 'LCF-' || UPPER(TO_HEX(EXTRACT(EPOCH FROM NOW())::BIGINT));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_booking_code
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL)
  EXECUTE FUNCTION generate_booking_code();

-- ============================================================
-- VIEW: boats_with_rating (embarcações com média de avaliações)
-- ============================================================

CREATE VIEW boats_with_rating AS
SELECT
  b.*,
  COALESCE(AVG(r.rating_overall), 0) AS avg_rating,
  COUNT(r.id) AS total_reviews
FROM boats b
LEFT JOIN reviews r ON r.boat_id = b.id
GROUP BY b.id;
