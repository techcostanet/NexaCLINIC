-- ============================================================
-- ReusoPro - PostgreSQL schema (final, consolidated).
-- Idempotent: safe to run more than once on the same database.
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------
-- System users (staff who operate the dashboard)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(120) NOT NULL,
    username VARCHAR(60) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'operador' CHECK (role IN ('admin', 'operador')),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Patients
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pacientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(150) NOT NULL,
    peso_kg NUMERIC(5,2) NOT NULL,
    capilar VARCHAR(10) NOT NULL,                 -- dialyzer model in use
    capilar_manual BOOLEAN NOT NULL DEFAULT FALSE, -- TRUE = clinical exception, never recalculated from weight
    data_nascimento DATE,
    salao SMALLINT CHECK (salao IN (1, 2, 3)),    -- treatment room
    escala VARCHAR(20) NOT NULL CHECK (escala IN ('SEG_QUA_SEX', 'TER_QUI_SAB')),
    turno SMALLINT NOT NULL CHECK (turno IN (1, 2, 3)),
    dia_extra_fixo SMALLINT CHECK (dia_extra_fixo BETWEEN 0 AND 6), -- extra weekly session (0=Sun..6=Sat)
    box SMALLINT CHECK (box BETWEEN 1 AND 8),
    posicao_box SMALLINT CHECK (posicao_box BETWEEN 1 AND 4),
    reuso_atual SMALLINT NOT NULL DEFAULT 0 CHECK (reuso_atual >= 0 AND reuso_atual <= 20),
    capilar_lote VARCHAR(60),
    capilar_desde DATE NOT NULL DEFAULT CURRENT_DATE, -- first-use date of the current dialyzer
    ativo BOOLEAN NOT NULL DEFAULT TRUE,          -- soft delete
    observacoes TEXT,
    nome_mae VARCHAR(150),                        -- printed on the dialyzer label
    sorologia_hcv VARCHAR(20),
    sorologia_hiv VARCHAR(20),
    sorologia_hbs VARCHAR(20),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pacientes_escala_turno ON pacientes(escala, turno);

-- A slot (room + shift + box + position) holds at most one ACTIVE patient.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pacientes_slot_unico
  ON pacientes (salao, turno, box, posicao_box)
  WHERE ativo = TRUE AND box IS NOT NULL AND posicao_box IS NOT NULL;

-- ------------------------------------------------------------
-- Sessions: one row per patient per day (attendance or absence)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sessoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    data_sessao DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDENTE' CHECK (status IN ('PENDENTE', 'REALIZADA', 'FALTA')),
    reuso_antes SMALLINT,       -- counter before this entry (allows exact undo)
    reuso_no_momento SMALLINT,  -- counter after this entry
    capilar_no_momento VARCHAR(10),
    registrado_por UUID REFERENCES users(id), -- NULL = automatic (daily job)
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (paciente_id, data_sessao)
);

CREATE INDEX IF NOT EXISTS idx_sessoes_data ON sessoes(data_sessao);

-- ------------------------------------------------------------
-- Dialyzer swaps (history + source for reports).
-- Patient name/room/shift are snapshots taken at swap time.
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS trocas_capilar (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    paciente_id UUID NOT NULL REFERENCES pacientes(id) ON DELETE CASCADE,
    paciente_nome VARCHAR(150) NOT NULL,
    paciente_salao SMALLINT,
    paciente_turno SMALLINT,
    capilar_anterior VARCHAR(10),
    capilar_novo VARCHAR(10) NOT NULL,
    reuso_no_momento SMALLINT NOT NULL, -- uses reached by the discarded dialyzer
    motivo VARCHAR(30) NOT NULL CONSTRAINT trocas_capilar_motivo_check
      CHECK (motivo IN ('LIMITE_20_USOS', 'DESPREZADO_MANUAL')),
    motivo_detalhe TEXT,                -- required when motivo = DESPREZADO_MANUAL
    registrado_por UUID REFERENCES users(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trocas_data ON trocas_capilar(criado_em);
CREATE INDEX IF NOT EXISTS idx_trocas_paciente ON trocas_capilar(paciente_id);

-- ------------------------------------------------------------
-- Generated PDF reports (file lives in object storage)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS relatorios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('SEMANAL', 'MENSAL')),
    periodo_inicio DATE NOT NULL,
    periodo_fim DATE NOT NULL,
    arquivo_path VARCHAR(500) NOT NULL,
    total_trocas INT NOT NULL DEFAULT 0,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------
-- Keep pacientes.atualizado_em fresh. Fixed search_path avoids
-- name-resolution hijacking (Supabase security advisor lint).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql
SET search_path = public, pg_temp;

DROP TRIGGER IF EXISTS set_timestamp_pacientes ON pacientes;
CREATE TRIGGER set_timestamp_pacientes
BEFORE UPDATE ON pacientes
FOR EACH ROW
EXECUTE FUNCTION trigger_set_timestamp();

-- ------------------------------------------------------------
-- Row Level Security with no policies: blocks Supabase's public
-- PostgREST API. The backend connects as the table owner, which
-- bypasses RLS, so the app itself is unaffected.
-- ------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE trocas_capilar ENABLE ROW LEVEL SECURITY;
ALTER TABLE relatorios ENABLE ROW LEVEL SECURITY;
