// ============================================================
// Sessions and the reuse counter.
//
// Attendance model: every morning a job marks every scheduled patient as
// attended (+1 use). Staff then only record exceptions: absences (which
// undo that +1), extra sessions and retroactive corrections.
// ============================================================

const pool = require('../db/pool');
const { comTransacao } = require('../db/pool');
const { HttpErro } = require('../middleware/erros');
const {
  MAX_REUSO,
  statusReuso,
  escalaDoDiaSemana,
  ehDiaDaEscala,
  incrementarReuso,
  decrementarReuso,
} = require('../domain/regrasNegocio');
const { diaDaSemana } = require('../utils/datas');

/**
 * Patients expected on a date: those whose schedule runs that weekday plus
 * those with a fixed extra session on it, with the day's session status.
 */
async function pacientesDoDia(dataISO) {
  const diaSemana = diaDaSemana(dataISO);
  const escala = escalaDoDiaSemana(diaSemana);

  const { rows } = await pool.query(
    `SELECT p.*, s.status, s.id AS sessao_id, (p.dia_extra_fixo = $3) AS extra_fixa
     FROM pacientes p
     LEFT JOIN sessoes s ON s.paciente_id = p.id AND s.data_sessao = $1
     WHERE p.ativo = TRUE AND (p.escala = $2 OR p.dia_extra_fixo = $3)
     ORDER BY p.turno ASC, p.nome ASC`,
    [dataISO, escala, diaSemana]
  );

  return {
    data: dataISO,
    escala,
    pacientes: rows.map((p) => ({
      ...p,
      status_visual: statusReuso(p.reuso_atual),
      status_sessao: p.status || 'PENDENTE',
    })),
  };
}

/**
 * Exceptions recorded on a date: absences and extra sessions (attended on a
 * day outside the patient's regular schedule).
 */
async function lancamentosDoDia(dataISO) {
  const diaSemana = diaDaSemana(dataISO);

  const { rows } = await pool.query(
    `SELECT s.id AS sessao_id, s.status, p.id AS paciente_id, p.nome, p.escala, p.capilar, p.salao, p.turno
     FROM sessoes s
     JOIN pacientes p ON p.id = s.paciente_id
     WHERE s.data_sessao = $1 AND s.status IN ('REALIZADA', 'FALTA')
     ORDER BY p.nome ASC`,
    [dataISO]
  );

  const lancamentos = rows
    .map((r) => ({
      sessao_id: r.sessao_id,
      paciente_id: r.paciente_id,
      nome: r.nome,
      capilar: r.capilar,
      salao: r.salao,
      turno: r.turno,
      tipo: r.status === 'FALTA' ? 'FALTA' : ehDiaDaEscala(r.escala, diaSemana) ? null : 'EXTRA',
    }))
    .filter((r) => r.tipo);

  return { data: dataISO, lancamentos };
}

/**
 * Counter change when a day's session moves from `anterior` to `novo` status.
 * Idempotent: repeating the same status changes nothing.
 *   -> REALIZADA : +1 (unless it was already attended)
 *   REALIZADA -> FALTA : -1 (undoes the automatic +1)
 *   none/PENDENTE -> FALTA : 0 (no use happened, nothing to undo)
 */
function calcularNovoReuso(reusoAtual, anterior, novo) {
  if (anterior === novo) return reusoAtual;
  if (novo === 'REALIZADA') return incrementarReuso(reusoAtual);
  if (novo === 'FALTA' && anterior === 'REALIZADA') return decrementarReuso(reusoAtual);
  return reusoAtual;
}

/**
 * Records attendance ('REALIZADA') or absence ('FALTA') for a patient on a
 * date, adjusting the reuse counter. Attendance is refused when the dialyzer
 * is already at the limit: it must be swapped first.
 */
async function registrarSessao({ pacienteId, dataISO, status, usuarioId }) {
  return comTransacao(async (client) => {
    const { rows: [paciente] } = await client.query('SELECT * FROM pacientes WHERE id = $1 FOR UPDATE', [pacienteId]);
    if (!paciente) throw new HttpErro(404, 'Paciente não encontrado.');

    const { rows: [sessaoAtual] } = await client.query(
      'SELECT status FROM sessoes WHERE paciente_id = $1 AND data_sessao = $2',
      [pacienteId, dataISO]
    );
    const statusAnterior = sessaoAtual?.status || null;

    if (status === 'REALIZADA' && statusAnterior !== 'REALIZADA' && paciente.reuso_atual >= MAX_REUSO) {
      throw new HttpErro(
        409,
        `Este paciente já está no limite de ${MAX_REUSO} usos. Troque o capilar antes de lançar uma nova sessão.`
      );
    }

    const reusoAntes = paciente.reuso_atual;
    const novoReuso = calcularNovoReuso(reusoAntes, statusAnterior, status);

    await client.query('UPDATE pacientes SET reuso_atual = $1 WHERE id = $2', [novoReuso, pacienteId]);
    await client.query(
      `INSERT INTO sessoes (paciente_id, data_sessao, status, reuso_antes, reuso_no_momento, capilar_no_momento, registrado_por)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (paciente_id, data_sessao) DO UPDATE SET
         status = $3, reuso_antes = $4, reuso_no_momento = $5, capilar_no_momento = $6, registrado_por = $7`,
      [pacienteId, dataISO, status, reusoAntes, novoReuso, paciente.capilar, usuarioId]
    );

    return { paciente_id: pacienteId, reuso_atual: novoReuso, status_visual: statusReuso(novoReuso) };
  });
}

/**
 * Deletes a session entry (fixes a mistaken entry). The counter is restored
 * to its value before the entry only if nothing changed since then; otherwise
 * the revert could silently undo a later swap or session.
 */
async function excluirSessao(sessaoId) {
  return comTransacao(async (client) => {
    const { rows: [sessao] } = await client.query('SELECT * FROM sessoes WHERE id = $1 FOR UPDATE', [sessaoId]);
    if (!sessao) throw new HttpErro(404, 'Lançamento não encontrado.');

    const { rows: [paciente] } = await client.query('SELECT * FROM pacientes WHERE id = $1 FOR UPDATE', [sessao.paciente_id]);

    const podeReverter = paciente && sessao.reuso_antes !== null && paciente.reuso_atual === sessao.reuso_no_momento;
    let reusoAtual = paciente?.reuso_atual ?? null;

    if (podeReverter) {
      await client.query('UPDATE pacientes SET reuso_atual = $1 WHERE id = $2', [sessao.reuso_antes, paciente.id]);
      reusoAtual = sessao.reuso_antes;
    }
    await client.query('DELETE FROM sessoes WHERE id = $1', [sessaoId]);

    return { paciente_id: sessao.paciente_id, reuso_atual: reusoAtual, reuso_revertido: podeReverter };
  });
}

/**
 * Daily automatic attendance (runs from the morning job). Single statement
 * so it scales to hundreds of patients within serverless time limits, and
 * idempotent: patients that already have a session on the date are skipped.
 */
async function lancarPresencaAutomatica(dataISO) {
  const diaSemana = diaDaSemana(dataISO);
  const escala = escalaDoDiaSemana(diaSemana);

  const { rows } = await pool.query(
    `WITH alvo AS (
       SELECT p.id, p.reuso_atual AS reuso_antigo
       FROM pacientes p
       LEFT JOIN sessoes s ON s.paciente_id = p.id AND s.data_sessao = $2
       WHERE p.ativo = TRUE AND s.id IS NULL AND (p.escala = $1 OR p.dia_extra_fixo = $3)
     ),
     atualizado AS (
       UPDATE pacientes p
       SET reuso_atual = LEAST($4::smallint, p.reuso_atual + 1)
       FROM alvo
       WHERE p.id = alvo.id
       RETURNING p.id, alvo.reuso_antigo, p.reuso_atual, p.capilar
     )
     INSERT INTO sessoes (paciente_id, data_sessao, status, reuso_antes, reuso_no_momento, capilar_no_momento)
     SELECT id, $2, 'REALIZADA', reuso_antigo, reuso_atual, capilar FROM atualizado
     RETURNING paciente_id`,
    [escala, dataISO, diaSemana, MAX_REUSO]
  );

  return { escala, dataISO, totalLancados: rows.length };
}

module.exports = {
  pacientesDoDia,
  lancamentosDoDia,
  registrarSessao,
  excluirSessao,
  lancarPresencaAutomatica,
  calcularNovoReuso,
};
