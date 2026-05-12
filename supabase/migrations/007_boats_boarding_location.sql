-- Adiciona campos de local de embarque às embarcações
ALTER TABLE boats
  ADD COLUMN IF NOT EXISTS boarding_name    TEXT,
  ADD COLUMN IF NOT EXISTS boarding_address TEXT,
  ADD COLUMN IF NOT EXISTS boarding_lat     DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS boarding_lng     DOUBLE PRECISION;

COMMENT ON COLUMN boats.boarding_name    IS 'Nome do ponto de embarque (ex: Marina Pier 98)';
COMMENT ON COLUMN boats.boarding_address IS 'Endereço completo do ponto de embarque';
COMMENT ON COLUMN boats.boarding_lat     IS 'Latitude do ponto de embarque';
COMMENT ON COLUMN boats.boarding_lng     IS 'Longitude do ponto de embarque';
