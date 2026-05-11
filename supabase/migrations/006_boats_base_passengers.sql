-- ============================================================
-- MIGRATION 006 — Adiciona base_passengers à tabela boats
-- e price_per_extra_person (já existia, garantir default)
-- ============================================================

ALTER TABLE boats
  ADD COLUMN IF NOT EXISTS base_passengers INTEGER NOT NULL DEFAULT 4;
