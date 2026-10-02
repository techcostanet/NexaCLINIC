// ============================================================
// Dialyzer swaps. Every swap goes through `trocarCapilar`, whether it is
// triggered from the Dashboard/Patients screen or when printing labels.
// ============================================================

const pool = require('../db/pool');
const { comTransacao } = require('../db/pool');
const { HttpErro } = require('../middleware/erros');
const { MOTIVOS_TROCA, capilarAposTroca } = require('../domain/regrasNegocio');
const { TIMEZONE, hojeISO, ehDataISO } = require('../utils/datas');

/**
 * Closes the current dialyzer (logging it in trocas_capilar with a snapshot
 * of the patient) and opens a new one with the counter reset to zero.
 *
 * @param {object} dados
 * @param {'LIMITE_20_USOS'|'DESPREZADO_MANUAL'} dados.motivo
 * @param {string} [dados.motivo_detalhe]     required for DESPREZADO_MANUAL
 * @param {string} [dados.novo_capilar_lote]  lot/code of the new dialyzer
 * @param {string} [dados.data_inicio]        first-use date of the new dialyzer
 *   (defaults to today; label printing uses the patient's next session date)
 */
async function trocarCapilar(pacienteId, dados, usuarioId) {
  const { motivo, motivo_detalhe, novo_capilar_lote, data_inicio } = dados;

  if (!MOTIVOS_TROCA.includes(motivo)) {
    throw new HttpErro(400, `Motivo inválido. Use ${MOTIVOS_TROCA.join(' ou ')}.`);
  }
  if (motivo === 'DESPREZADO_MANUAL' && !motivo_detalhe) {
    throw new HttpErro(400, 'Para desprezo manual, é obrigatório informar o motivo detalhado.');
  }
  if (data_inicio && !ehDataISO(data_inicio)) {
    throw new HttpErro(400, 'data_inicio deve estar no formato AAAA-MM-DD.');
  }

  return comTransacao(async (client) => {
    const { rows: [paciente] } = await client.query('SELECT * FROM pacientes WHERE id = $1 FOR UPDATE', [pacienteId]);
    if (!paciente) throw new HttpErro(404, 'Paciente não encontrado.');

    const capilarNovo = capilarAposTroca(paciente);

    await client.query(
      `INSERT INTO trocas_capilar
         (paciente_id, paciente_nome, paciente_salao, paciente_turno, capilar_anterior, capilar_novo,
          reuso_no_momento, motivo, motivo_detalhe, registrado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        pacienteId,
        paciente.nome,
        paciente.salao,
        paciente.turno,
        paciente.capilar,
        capilarNovo,
        paciente.reuso_atual,
        motivo,
        motivo_detalhe || null,
        usuarioId,
      ]
    );

    await client.query(
      `UPDATE pacientes SET reuso_atual = 0, capilar = $1, capilar_lote = $2, capilar_desde = $3 WHERE id = $4`,
      [capilarNovo, novo_capilar_lote || null, data_inicio || hojeISO(), pacienteId]
    );

    return { paciente_id: pacienteId, capilar_novo: capilarNovo, reuso_atual: 0 };
  });
}

/** Swap history, optionally restricted to [inicio, fim] (clinic-local dates). */
async function listar({ inicio, fim } = {}) {
  if (inicio && fim) {
    const { rows } = await pool.query(
      `SELECT * FROM trocas_capilar
       WHERE (criado_em AT TIME ZONE $3)::date BETWEEN $1 AND $2
       ORDER BY criado_em DESC`,
      [inicio, fim, TIMEZONE]
    );
    return rows;
  }
  const { rows } = await pool.query('SELECT * FROM trocas_capilar ORDER BY criado_em DESC');
  return rows;
}

/** Removes a history record only (does not touch the patient's current state). */
async function excluir(id) {
  const { rows } = await pool.query('DELETE FROM trocas_capilar WHERE id = $1 RETURNING id', [id]);
  if (!rows[0]) throw new HttpErro(404, 'Troca não encontrada.');
}

module.exports = { trocarCapilar, listar, excluir };
