-- ============================================================
-- MIGRATION 003 — Dados iniciais (seed)
-- Cidades, Marinas, Roteiros e Extras de Cabo Frio
-- ============================================================

-- ============================================================
-- CIDADES
-- ============================================================

INSERT INTO cities (name, slug, state, active, description) VALUES
('Cabo Frio',       'cabo-frio',       'RJ', true,  'A Cidade do Sol, famosa pelas praias de águas cristalinas e lagoas.'),
('Búzios',          'buzios',          'RJ', false, 'Península paradisíaca com 23 praias e vida noturna agitada.'),
('Arraial do Cabo', 'arraial-do-cabo', 'RJ', false, 'O Caribe brasileiro, com águas de tom azul-turquesa únicas.'),
('Angra dos Reis',  'angra-dos-reis',  'RJ', false, 'Baía com mais de 300 ilhas, perfeita para passeios de barco.'),
('Paraty',          'paraty',          'RJ', false, 'Centro histórico e natureza exuberante na Costa Verde.'),
('Florianópolis',   'florianopolis',   'SC', false, 'A Ilha da Magia com mais de 40 praias para explorar.');

-- ============================================================
-- MARINAS (Cabo Frio)
-- ============================================================

INSERT INTO marinas (city_id, name, address, lat, lng)
SELECT
  c.id,
  m.name,
  m.address,
  m.lat,
  m.lng
FROM cities c
CROSS JOIN (VALUES
  ('Marina Pier 98',           'Av. Julia Kubitscheck, 98 - Braga, Cabo Frio - RJ',     -22.8784, -42.0178),
  ('Terminal Transatlântico',  'Av. do Contorno, s/n - Centro, Cabo Frio - RJ',          -22.8796, -42.0184),
  ('Marina do Canal',          'Canal Itajuru, s/n - Cabo Frio - RJ',                    -22.8760, -42.0200),
  ('Porto de Arraial do Cabo', 'Av. Bernardo Lins, s/n - Praia dos Anjos, Arraial - RJ', -22.9656, -42.0271)
) AS m(name, address, lat, lng)
WHERE c.slug = 'cabo-frio'
LIMIT 4;

-- ============================================================
-- ROTEIROS (Cabo Frio)
-- ============================================================

INSERT INTO routes (city_id, name, slug, description, duration_hours, difficulty, ideal_for)
SELECT
  c.id,
  r.name,
  r.slug,
  r.description,
  r.duration_hours,
  r.difficulty::route_difficulty,
  r.ideal_for::route_ideal_for
FROM cities c
CROSS JOIN (VALUES
  (
    'Ilha do Japonês',
    'ilha-do-japones',
    'Passeio até a Ilha do Japonês, com parada para mergulho e snorkel nas águas cristalinas. Um dos pontos mais belos de Cabo Frio.',
    4.0, 'calm', 'all'
  ),
  (
    'Ilha do Papagaio',
    'ilha-do-papagaio',
    'Visita à Ilha do Papagaio com suas falésias brancas e mar esverdeado. Ideal para fotos e mergulho com máscara.',
    5.0, 'calm', 'all'
  ),
  (
    'Praia das Conchas',
    'praia-das-conchas',
    'Passeio pela orla de Cabo Frio passando pela deslumbrante Praia das Conchas, conhecida pela areia branca e água transparente.',
    3.0, 'calm', 'family'
  ),
  (
    'Arraial do Cabo',
    'arraial-do-cabo',
    'Travessia para Arraial do Cabo, o Caribe brasileiro. Visita à Praia do Farol, Ilha do Cabo Frio e Lagoa Azul.',
    8.0, 'moderate', 'group'
  ),
  (
    'Búzios',
    'buzios',
    'Passeio de lancha até a sofisticada Búzios. Paradas nas praias mais belas da Península e almoço na orla.',
    10.0, 'moderate', 'couple'
  ),
  (
    'Praia do Forte',
    'praia-do-forte',
    'Roteiro pela orla histórica de Cabo Frio com parada próxima ao Forte São Mateus. Ótimo para pôr do sol.',
    3.0, 'calm', 'couple'
  ),
  (
    'Ilha Comprida',
    'ilha-comprida',
    'Passeio à Ilha Comprida com parada para mergulho livre. Águas verdes e peixes coloridos garantidos.',
    4.5, 'calm', 'family'
  ),
  (
    'Tour Pôr do Sol',
    'tour-por-do-sol',
    'Passeio especial ao entardecer pela Lagoa de Araruama e Canal do Itajuru. Pôr do sol deslumbrante a bordo.',
    2.5, 'calm', 'couple'
  )
) AS r(name, slug, description, duration_hours, difficulty, ideal_for)
WHERE c.slug = 'cabo-frio';

-- ============================================================
-- EXTRAS / OPCIONAIS
-- ============================================================

INSERT INTO extras (name, unit, price, icon, category) VALUES
-- Bebidas
('Cerveja Heineken (un)',    'unit',   8.00,  '🍺', 'drink'),
('Água mineral (500ml)',     'unit',   4.00,  '💧', 'drink'),
('Refrigerante lata',        'unit',   6.00,  '🥤', 'drink'),
('Whisky Jack Daniels 1L',   'unit',  180.00, '🥃', 'drink'),
('Vinho tinto (garrafa)',     'unit',   90.00, '🍷', 'drink'),
('Energético Red Bull',      'unit',   12.00, '⚡', 'drink'),
('Pacote bebidas (10 cerv)', 'unit',   70.00, '🍺', 'drink'),

-- Comidas
('Churrasco completo (p/p)', 'person', 45.00, '🔥', 'food'),
('Pacote frutas variadas',   'unit',   35.00, '🍉', 'food'),
('Petiscos sortidos',        'unit',   40.00, '🧆', 'food'),
('Carvão vegetal',           'unit',   15.00, '🪵', 'food'),
('Gelo (5kg)',               'unit',   10.00, '🧊', 'food'),

-- Decoração / Experiências
('Decoração aniversário',    'unit',   80.00, '🎂', 'decoration'),
('Decoração romântica',      'unit',  120.00, '🌹', 'decoration'),
('Bouquet de flores',        'unit',   60.00, '💐', 'decoration'),

-- Atividades
('Fotógrafo profissional',   'unit',  250.00, '📸', 'activity'),
('Equipamento de snorkel',   'unit',   25.00, '🤿', 'activity'),
('Stand-up paddle (1h)',     'unit',   40.00, '🏄', 'activity');
