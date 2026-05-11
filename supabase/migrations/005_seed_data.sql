-- ============================================================
-- MIGRATION 005 — Seed: Focker 310 com roteiros
-- ============================================================
DO $$
DECLARE
  v_city_id    UUID;
  v_marina_id  UUID;
  v_owner_id   UUID;
  v_boat_id    UUID;
  v_route1_id  UUID;
  v_route2_id  UUID;
  v_route3_id  UUID;
BEGIN

  -- 1. Cidade
  INSERT INTO cities (name, state, slug, active)
  VALUES ('Cabo Frio', 'RJ', 'cabo-frio', true)
  ON CONFLICT (slug) DO UPDATE SET active = true
  RETURNING id INTO v_city_id;

  -- 2. Marina
  INSERT INTO marinas (city_id, name, address, lat, lng)
  VALUES (v_city_id, 'Marina Pier 98', 'Av. Julia Kubitscheck, 98 - Braga, Cabo Frio - RJ', -22.8784, -42.0178)
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_marina_id;

  -- Se já existia, busca o ID
  IF v_marina_id IS NULL THEN
    SELECT id INTO v_marina_id FROM marinas WHERE name = 'Marina Pier 98' LIMIT 1;
  END IF;

  -- 3. Usar o primeiro perfil existente como proprietário demo
  --    (será substituído pelo perfil real do dono após cadastro)
  SELECT id INTO v_owner_id FROM profiles ORDER BY created_at LIMIT 1;
  IF v_owner_id IS NULL THEN
    RAISE EXCEPTION 'Nenhum perfil encontrado. Faça cadastro primeiro em /cadastro.';
  END IF;
  -- Garante que esse perfil tem role owner
  UPDATE profiles SET role = 'owner' WHERE id = v_owner_id;

  -- 4. Embarcação
  INSERT INTO boats (
    owner_id, city_id, marina_id, name, slug, category,
    description, capacity, size_ft, status, base_price, price_per_extra_person,
    amenities
  ) VALUES (
    v_owner_id, v_city_id, v_marina_id,
    'Focker 310', 'focker-310', 'lancha',
    'A Focker 310 é uma lancha espaçosa e confortável, ideal para passeios em família ou grupos de amigos. Com deck solar amplo, som de qualidade e churrasqueira a bordo, você terá tudo para um dia perfeito no mar de Cabo Frio.',
    10, 22, 'active', 800, 50,
    '{"marinheiro":true,"churrasqueira":true,"cooler":true,"banheiro":false,"ducha":false,"som":true,"wifi":false,"toldo":true,"ancora":true}'
  )
  ON CONFLICT (slug) DO UPDATE SET status = 'active'
  RETURNING id INTO v_boat_id;

  -- 5. Roteiros
  INSERT INTO routes (city_id, name, slug, description, duration_hours, difficulty, ideal_for)
  VALUES (v_city_id, 'Ilha do Japonês', 'ilha-do-japones', 'Mergulho e snorkel nas águas cristalinas.', 4, 'calm', 'all')
  ON CONFLICT (slug) DO UPDATE SET city_id = v_city_id
  RETURNING id INTO v_route1_id;

  INSERT INTO routes (city_id, name, slug, description, duration_hours, difficulty, ideal_for)
  VALUES (v_city_id, 'Praia das Conchas', 'praia-das-conchas', 'Areia branca e água transparente.', 3, 'calm', 'family')
  ON CONFLICT (slug) DO UPDATE SET city_id = v_city_id
  RETURNING id INTO v_route2_id;

  INSERT INTO routes (city_id, name, slug, description, duration_hours, difficulty, ideal_for)
  VALUES (v_city_id, 'Arraial do Cabo', 'arraial-do-cabo', 'O Caribe brasileiro. Lagoa Azul e Praia do Farol.', 8, 'moderate', 'group')
  ON CONFLICT (slug) DO UPDATE SET city_id = v_city_id
  RETURNING id INTO v_route3_id;

  -- 6. Boat routes (com preços por faixa de passageiros)
  INSERT INTO boat_routes (boat_id, route_id, base_price, base_passengers, price_per_extra, max_passengers)
  VALUES
    (v_boat_id, v_route1_id, 800,  4, 50, 10),
    (v_boat_id, v_route2_id, 600,  4, 40, 10),
    (v_boat_id, v_route3_id, 1200, 6, 80, 10)
  ON CONFLICT (boat_id, route_id) DO NOTHING;

  -- 7. Fotos
  INSERT INTO boat_photos (boat_id, url, position, is_cover)
  VALUES
    (v_boat_id, 'https://images.unsplash.com/photo-1605281317010-fe5ffe798166?q=80&w=1200', 0, true),
    (v_boat_id, 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?q=80&w=800',  1, false),
    (v_boat_id, 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800',    2, false)
  ON CONFLICT DO NOTHING;

  RAISE NOTICE 'Seed concluído! city=% marina=% boat=%', v_city_id, v_marina_id, v_boat_id;
END $$;
