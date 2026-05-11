-- ============================================================
-- MIGRATION 004 — Sistema de preços por rota e sazonalidade
-- ============================================================

-- 1. Atualizar boat_routes com preço próprio por rota e faixa de passageiros
ALTER TABLE boat_routes
  ADD COLUMN IF NOT EXISTS base_price          NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS base_passengers     INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS price_per_extra     NUMERIC(10,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS max_passengers      INTEGER;  -- NULL = usa o limite da embarcação

-- 2. Tabela de regras de preço sazonal
CREATE TABLE pricing_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  boat_id     UUID NOT NULL REFERENCES boats(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  type        TEXT NOT NULL CHECK (type IN ('weekend','holiday','high_season','low_season','custom')),
  multiplier  NUMERIC(4,2) NOT NULL DEFAULT 1.0,   -- 1.5 = +50%, 1.2 = +20%
  days_of_week INTEGER[],   -- [0,6] = Dom e Sab | [5,6] = Sex e Sab
  start_date  DATE,         -- para high_season e custom
  end_date    DATE,
  active      BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de feriados nacionais/locais
CREATE TABLE holidays (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  date       DATE NOT NULL,
  recurring  BOOLEAN NOT NULL DEFAULT true,  -- true = repete todo ano
  national   BOOLEAN NOT NULL DEFAULT true,
  city_id    UUID REFERENCES cities(id)      -- NULL = nacional
);

-- 4. Índices
CREATE INDEX idx_pricing_rules_boat_id ON pricing_rules(boat_id);
CREATE INDEX idx_pricing_rules_active  ON pricing_rules(active);
CREATE INDEX idx_holidays_date         ON holidays(date);

-- 5. RLS para pricing_rules
ALTER TABLE pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE holidays       ENABLE ROW LEVEL SECURITY;

-- Qualquer um pode ver regras de preço (necessário para calcular no front)
CREATE POLICY "pricing_rules_select_public"
  ON pricing_rules FOR SELECT USING (true);

-- Proprietário gerencia as próprias regras
CREATE POLICY "pricing_rules_manage_owner"
  ON pricing_rules FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM boats
      WHERE id = pricing_rules.boat_id
      AND owner_id = get_profile_id()
    )
  );

-- Admin gerencia tudo
CREATE POLICY "pricing_rules_manage_admin"
  ON pricing_rules FOR ALL
  USING (get_user_role() = 'admin');

-- Feriados são públicos
CREATE POLICY "holidays_select_public"
  ON holidays FOR SELECT USING (true);

CREATE POLICY "holidays_manage_admin"
  ON holidays FOR ALL
  USING (get_user_role() = 'admin');

-- 6. Feriados nacionais brasileiros
INSERT INTO holidays (name, date, recurring, national) VALUES
  ('Confraternização Universal',      '2025-01-01', true,  true),
  ('Carnaval',                        '2025-03-03', false, true),
  ('Carnaval',                        '2025-03-04', false, true),
  ('Sexta-feira Santa',               '2025-04-18', false, true),
  ('Tiradentes',                      '2025-04-21', true,  true),
  ('Dia do Trabalho',                 '2025-05-01', true,  true),
  ('Corpus Christi',                  '2025-06-19', false, true),
  ('Independência do Brasil',         '2025-09-07', true,  true),
  ('Nossa Sra. Aparecida',            '2025-10-12', true,  true),
  ('Finados',                         '2025-11-02', true,  true),
  ('Proclamação da República',        '2025-11-15', true,  true),
  ('Natal',                           '2025-12-25', true,  true),
  ('Véspera de Natal',                '2025-12-24', true,  true),
  ('Véspera de Ano Novo',             '2025-12-31', true,  true);

-- ============================================================
-- FUNÇÃO: calcular preço final de uma reserva
-- Retorna o preço total considerando:
--   - Preço base do roteiro para os passageiros base
--   - Preço adicional por passageiro excedente
--   - Multiplicador sazonal (fim de semana, feriado, alta temporada)
-- ============================================================

CREATE OR REPLACE FUNCTION calculate_booking_price(
  p_boat_route_id UUID,
  p_boat_id       UUID,
  p_date          DATE,
  p_passengers    INTEGER
)
RETURNS JSONB AS $$
DECLARE
  v_route         RECORD;
  v_base_price    NUMERIC;
  v_base_pax      INTEGER;
  v_extra_pax     INTEGER;
  v_extra_cost    NUMERIC;
  v_subtotal      NUMERIC;
  v_multiplier    NUMERIC := 1.0;
  v_rule_name     TEXT := NULL;
  v_is_weekend    BOOLEAN;
  v_is_holiday    BOOLEAN;
  v_max_pax       INTEGER;
BEGIN
  -- Buscar configuração do roteiro
  SELECT br.*, b.capacity, b.base_price AS boat_base_price, b.price_per_extra_person AS boat_extra
  INTO v_route
  FROM boat_routes br
  JOIN boats b ON b.id = br.boat_id
  WHERE br.id = p_boat_route_id;

  -- Preço base do roteiro (usa override ou preço da embarcação)
  v_base_price := COALESCE(v_route.base_price, v_route.price_override, v_route.boat_base_price);

  -- Passageiros base inclusos (padrão: capacidade total)
  v_base_pax := COALESCE(v_route.base_passengers, v_route.capacity);
  v_max_pax  := COALESCE(v_route.max_passengers, v_route.capacity);

  -- Validar limite de passageiros
  IF p_passengers > v_max_pax THEN
    RAISE EXCEPTION 'Número de passageiros (%) excede o limite máximo (%)', p_passengers, v_max_pax;
  END IF;

  -- Calcular passageiros extras e custo adicional
  v_extra_pax  := GREATEST(0, p_passengers - v_base_pax);
  v_extra_cost := v_extra_pax * COALESCE(v_route.price_per_extra, v_route.boat_extra, 0);
  v_subtotal   := v_base_price + v_extra_cost;

  -- Verificar se é fim de semana
  v_is_weekend := EXTRACT(DOW FROM p_date) IN (0, 6);  -- 0=Dom, 6=Sab

  -- Verificar se é feriado
  SELECT EXISTS(
    SELECT 1 FROM holidays
    WHERE (recurring = true AND EXTRACT(MONTH FROM date) = EXTRACT(MONTH FROM p_date)
                             AND EXTRACT(DAY   FROM date) = EXTRACT(DAY   FROM p_date))
       OR (recurring = false AND date = p_date)
  ) INTO v_is_holiday;

  -- Buscar regra de preço aplicável (prioridade: feriado > custom > alta temporada > fim de semana)
  SELECT multiplier, name INTO v_multiplier, v_rule_name
  FROM pricing_rules
  WHERE boat_id = p_boat_id
    AND active = true
    AND (
      -- Feriado
      (type = 'holiday' AND v_is_holiday)
      OR
      -- Fim de semana
      (type = 'weekend' AND v_is_weekend AND EXTRACT(DOW FROM p_date) = ANY(days_of_week))
      OR
      -- Alta temporada (range de datas)
      (type IN ('high_season','low_season','custom') AND p_date BETWEEN start_date AND end_date)
    )
  ORDER BY
    CASE type
      WHEN 'holiday'      THEN 1
      WHEN 'custom'       THEN 2
      WHEN 'high_season'  THEN 3
      WHEN 'low_season'   THEN 4
      WHEN 'weekend'      THEN 5
    END
  LIMIT 1;

  v_multiplier := COALESCE(v_multiplier, 1.0);

  RETURN jsonb_build_object(
    'base_price',       v_base_price,
    'base_passengers',  v_base_pax,
    'extra_passengers', v_extra_pax,
    'extra_cost',       v_extra_cost,
    'subtotal',         v_subtotal,
    'multiplier',       v_multiplier,
    'rule_applied',     v_rule_name,
    'is_weekend',       v_is_weekend,
    'is_holiday',       v_is_holiday,
    'total',            ROUND(v_subtotal * v_multiplier, 2),
    'max_passengers',   v_max_pax
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
