-- ============================================================
-- MIGRATION 002 — Row Level Security (RLS)
-- Segurança: quem pode ler/escrever o quê
-- ============================================================

-- Habilitar RLS em todas as tabelas
ALTER TABLE cities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE marinas       ENABLE ROW LEVEL SECURITY;
ALTER TABLE boats         ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_photos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE boat_routes   ENABLE ROW LEVEL SECURITY;
ALTER TABLE extras        ENABLE ROW LEVEL SECURITY;
ALTER TABLE availabilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings      ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments      ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews       ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites     ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- HELPER: verificar role do usuário logado
-- ============================================================

CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_profile_id()
RETURNS UUID AS $$
  SELECT id FROM profiles WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: cities
-- ============================================================

-- Qualquer um pode ver cidades ativas
CREATE POLICY "cities_select_public"
  ON cities FOR SELECT
  USING (active = true);

-- Admin pode ver todas
CREATE POLICY "cities_select_admin"
  ON cities FOR SELECT
  USING (get_user_role() = 'admin');

-- Admin pode inserir/atualizar
CREATE POLICY "cities_insert_admin"
  ON cities FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "cities_update_admin"
  ON cities FOR UPDATE
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: profiles
-- ============================================================

-- Usuário vê apenas o próprio perfil
CREATE POLICY "profiles_select_own"
  ON profiles FOR SELECT
  USING (user_id = auth.uid() OR get_user_role() = 'admin');

-- Usuário atualiza apenas o próprio perfil
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

-- Admin pode ver todos os perfis
CREATE POLICY "profiles_select_admin"
  ON profiles FOR SELECT
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: marinas
-- ============================================================

-- Qualquer um pode ver marinas
CREATE POLICY "marinas_select_public"
  ON marinas FOR SELECT
  USING (true);

-- Admin pode inserir/atualizar
CREATE POLICY "marinas_insert_admin"
  ON marinas FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "marinas_update_admin"
  ON marinas FOR UPDATE
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: boats
-- ============================================================

-- Qualquer um pode ver embarcações ativas
CREATE POLICY "boats_select_active"
  ON boats FOR SELECT
  USING (status = 'active');

-- Proprietário vê as próprias embarcações (qualquer status)
CREATE POLICY "boats_select_owner"
  ON boats FOR SELECT
  USING (owner_id = get_profile_id());

-- Admin vê todas
CREATE POLICY "boats_select_admin"
  ON boats FOR SELECT
  USING (get_user_role() = 'admin');

-- Proprietário cria embarcações
CREATE POLICY "boats_insert_owner"
  ON boats FOR INSERT
  WITH CHECK (
    owner_id = get_profile_id()
    AND get_user_role() IN ('owner', 'admin')
  );

-- Proprietário atualiza as próprias (exceto status — só admin muda)
CREATE POLICY "boats_update_owner"
  ON boats FOR UPDATE
  USING (owner_id = get_profile_id() AND get_user_role() = 'owner');

-- Admin atualiza qualquer embarcação (inclusive status)
CREATE POLICY "boats_update_admin"
  ON boats FOR UPDATE
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: boat_photos
-- ============================================================

-- Qualquer um pode ver fotos de embarcações ativas
CREATE POLICY "boat_photos_select_public"
  ON boat_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats WHERE id = boat_photos.boat_id AND status = 'active'
    )
  );

-- Proprietário gerencia fotos das próprias embarcações
CREATE POLICY "boat_photos_insert_owner"
  ON boat_photos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = boat_photos.boat_id
      AND owner_id = get_profile_id()
    )
  );

CREATE POLICY "boat_photos_delete_owner"
  ON boat_photos FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = boat_photos.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- ============================================================
-- POLICIES: routes
-- ============================================================

-- Qualquer um pode ver roteiros
CREATE POLICY "routes_select_public"
  ON routes FOR SELECT
  USING (true);

-- Admin gerencia roteiros
CREATE POLICY "routes_insert_admin"
  ON routes FOR INSERT
  WITH CHECK (get_user_role() = 'admin');

CREATE POLICY "routes_update_admin"
  ON routes FOR UPDATE
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: boat_routes
-- ============================================================

CREATE POLICY "boat_routes_select_public"
  ON boat_routes FOR SELECT
  USING (true);

CREATE POLICY "boat_routes_insert_owner"
  ON boat_routes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = boat_routes.boat_id
      AND owner_id = get_profile_id()
    )
  );

CREATE POLICY "boat_routes_delete_owner"
  ON boat_routes FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = boat_routes.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- ============================================================
-- POLICIES: extras
-- ============================================================

CREATE POLICY "extras_select_public"
  ON extras FOR SELECT
  USING (active = true);

CREATE POLICY "extras_manage_admin"
  ON extras FOR ALL
  USING (get_user_role() = 'admin');

-- ============================================================
-- POLICIES: availabilities
-- ============================================================

-- Qualquer um pode ver disponibilidade
CREATE POLICY "availabilities_select_public"
  ON availabilities FOR SELECT
  USING (true);

-- Proprietário gerencia disponibilidade das próprias embarcações
CREATE POLICY "availabilities_manage_owner"
  ON availabilities FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = availabilities.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- ============================================================
-- POLICIES: bookings
-- ============================================================

-- Cliente vê as próprias reservas
CREATE POLICY "bookings_select_client"
  ON bookings FOR SELECT
  USING (client_id = get_profile_id());

-- Proprietário vê reservas das próprias embarcações
CREATE POLICY "bookings_select_owner"
  ON bookings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = bookings.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- Admin vê todas
CREATE POLICY "bookings_select_admin"
  ON bookings FOR SELECT
  USING (get_user_role() = 'admin');

-- Cliente cria reserva
CREATE POLICY "bookings_insert_client"
  ON bookings FOR INSERT
  WITH CHECK (client_id = get_profile_id());

-- Cliente cancela própria reserva (status → cancelled)
CREATE POLICY "bookings_update_client"
  ON bookings FOR UPDATE
  USING (client_id = get_profile_id());

-- Admin e proprietário atualizam status
CREATE POLICY "bookings_update_owner_admin"
  ON bookings FOR UPDATE
  USING (
    get_user_role() = 'admin'
    OR EXISTS (
      SELECT 1 FROM boats
      WHERE id = bookings.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- ============================================================
-- POLICIES: booking_extras
-- ============================================================

CREATE POLICY "booking_extras_select"
  ON booking_extras FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_extras.booking_id
      AND (client_id = get_profile_id() OR get_user_role() IN ('owner','admin'))
    )
  );

CREATE POLICY "booking_extras_insert"
  ON booking_extras FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = booking_extras.booking_id
      AND client_id = get_profile_id()
    )
  );

-- ============================================================
-- POLICIES: payments
-- ============================================================

CREATE POLICY "payments_select_own"
  ON payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE id = payments.booking_id
      AND client_id = get_profile_id()
    )
    OR get_user_role() = 'admin'
  );

-- ============================================================
-- POLICIES: reviews
-- ============================================================

-- Qualquer um pode ler avaliações
CREATE POLICY "reviews_select_public"
  ON reviews FOR SELECT
  USING (true);

-- Apenas cliente com reserva concluída pode avaliar
CREATE POLICY "reviews_insert_client"
  ON reviews FOR INSERT
  WITH CHECK (
    client_id = get_profile_id()
    AND EXISTS (
      SELECT 1 FROM bookings
      WHERE id = reviews.booking_id
      AND client_id = get_profile_id()
      AND status = 'completed'
    )
  );

-- ============================================================
-- POLICIES: favorites
-- ============================================================

CREATE POLICY "favorites_select_own"
  ON favorites FOR SELECT
  USING (user_id = get_profile_id());

CREATE POLICY "favorites_insert_own"
  ON favorites FOR INSERT
  WITH CHECK (user_id = get_profile_id());

CREATE POLICY "favorites_delete_own"
  ON favorites FOR DELETE
  USING (user_id = get_profile_id());
