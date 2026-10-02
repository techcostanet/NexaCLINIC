const pool = require('../db/pool');
const { HttpErro } = require('../middleware/erros');
const {
  MAX_REUSO,
  ESCALAS,
  SALOES,
  TURNOS,
  TOTAL_BOXES,
  POSICOES_POR_BOX,
  calcularCapilarPorPeso,
  statusReuso,
  ehDiaDaEscala,
} = require('../domain/regrasNegocio');
const { diaDaSemana } = require('../utils/datas');

const comStatus = (p) => ({ ...p, status_visual: statusReuso(p.reuso_atual) });
const vazio = (v) => v === undefined || v === null || v === '';

function validarCampos(dados, { criacao }) {
  const { nome, peso_kg, escala, turno, data_nascimento, salao, nome_mae, capilar_manual, capilar, reuso_atual, dia_extra_fixo } = dados;

  if (criacao && (!nome || !peso_kg || !escala || !turno || !data_nascimento || !salao)) {
    throw new HttpErro(400, 'Nome, peso, escala, turno, data de nascimento e salão são obrigatórios.');
  }
  // Mother's name is printed on the dialyzer label, so it is mandatory.
  if ((criacao || nome_mae !== undefined) && !String(nome_mae ?? '').trim()) {
    throw new HttpErro(400, 'Nome da mãe é obrigatório.');
  }
  if (!vazio(escala) && !ESCALAS.includes(escala)) {
    throw new HttpErro(400, `Escala inválida. Use ${ESCALAS.join(' ou ')}.`);
  }
  if (!vazio(salao) && !SALOES.includes(Number(salao))) {
    throw new HttpErro(400, 'Salão inválido. Use 1, 2 ou 3.');
  }
  if (!vazio(turno) && !TURNOS.includes(Number(turno))) {
    throw new HttpErro(400, 'Turno inválido. Use 1, 2 ou 3.');
  }
  if (!vazio(reuso_atual) && (Number(reuso_atual) < 0 || Number(reuso_atual) > MAX_REUSO)) {
    throw new HttpErro(400, `Reuso deve ser entre 0 e ${MAX_REUSO}.`);
  }
  if (!vazio(dia_extra_fixo) && (Number(dia_extra_fixo) < 0 || Number(dia_extra_fixo) > 6)) {
    throw new HttpErro(400, 'Dia extra fixo deve ser entre 0 (domingo) e 6 (sábado).');
  }
  if (criacao && capilar_manual && !capilar) {
    throw new HttpErro(400, 'Informe o capilar quando usar exceção manual.');
  }
}

async function listar({ escala, turno, salao } = {}) {
  const filtros = { escala, turno, salao };
  const params = [];
  let sql = 'SELECT * FROM pacientes WHERE ativo = TRUE';

  for (const [coluna, valor] of Object.entries(filtros)) {
    if (vazio(valor)) continue;
    params.push(valor);
    sql += ` AND ${coluna} = $${params.length}`;
  }
  sql += ' ORDER BY turno ASC, nome ASC';

  const { rows } = await pool.query(sql, params);
  return rows.map(comStatus);
}

async function buscarPorId(id) {
  const { rows } = await pool.query('SELECT * FROM pacientes WHERE id = $1', [id]);
  if (!rows[0]) throw new HttpErro(404, 'Paciente não encontrado.');
  return comStatus(rows[0]);
}

/**
 * Creates a patient. The dialyzer is derived from weight unless
 * `capilar_manual` is set (clinical exception), in which case `capilar` is used.
 */
async function criar(dados) {
  validarCampos(dados, { criacao: true });

  const capilarFinal = dados.capilar_manual ? dados.capilar : calcularCapilarPorPeso(dados.peso_kg);

  const { rows } = await pool.query(
    `INSERT INTO pacientes (nome, peso_kg, capilar, capilar_manual, data_nascimento, salao, escala, turno,
       reuso_atual, capilar_lote, observacoes, nome_mae, sorologia_hcv, sorologia_hiv, sorologia_hbs, dia_extra_fixo)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
     RETURNING *`,
    [
      dados.nome,
      dados.peso_kg,
      capilarFinal,
      !!dados.capilar_manual,
      dados.data_nascimento,
      dados.salao,
      dados.escala,
      dados.turno,
      dados.reuso_atual || 0,
      dados.capilar_lote || null,
      dados.observacoes || null,
      dados.nome_mae,
      dados.sorologia_hcv || null,
      dados.sorologia_hiv || null,
      dados.sorologia_hbs || null,
      vazio(dados.dia_extra_fixo) ? null : dados.dia_extra_fixo,
    ]
  );
  return rows[0];
}

/**
 * Partial update: fields left undefined keep their current value.
 * Dialyzer rule:
 *  - exception on  -> use the `capilar` sent (or keep the current one);
 *  - exception off -> always recalculate from the (possibly new) weight.
 * `dia_extra_fixo` may be explicitly cleared by sending null or ''.
 */
async function atualizar(id, dados) {
  validarCampos(dados, { criacao: false });

  const atual = await buscarPorId(id);
  const pesoFinal = dados.peso_kg !== undefined ? dados.peso_kg : atual.peso_kg;
  const manualFinal = dados.capilar_manual !== undefined ? !!dados.capilar_manual : atual.capilar_manual;
  const capilarFinal = manualFinal ? dados.capilar || atual.capilar : calcularCapilarPorPeso(pesoFinal);

  const alterarDiaExtra = dados.dia_extra_fixo !== undefined;
  const diaExtraFinal = vazio(dados.dia_extra_fixo) ? null : dados.dia_extra_fixo;

  const { rows } = await pool.query(
    `UPDATE pacientes SET
       nome = COALESCE($1, nome),
       peso_kg = $2,
       capilar = $3,
       capilar_manual = $4,
       data_nascimento = COALESCE($5, data_nascimento),
       salao = COALESCE($6, salao),
       escala = COALESCE($7, escala),
       turno = COALESCE($8, turno),
       capilar_lote = COALESCE($9, capilar_lote),
       observacoes = COALESCE($10, observacoes),
       ativo = COALESCE($11, ativo),
       reuso_atual = COALESCE($12, reuso_atual),
       nome_mae = COALESCE($13, nome_mae),
       sorologia_hcv = COALESCE($14, sorologia_hcv),
       sorologia_hiv = COALESCE($15, sorologia_hiv),
       sorologia_hbs = COALESCE($16, sorologia_hbs),
       dia_extra_fixo = CASE WHEN $18 THEN $19 ELSE dia_extra_fixo END
     WHERE id = $17
     RETURNING *`,
    [
      dados.nome,
      pesoFinal,
      capilarFinal,
      manualFinal,
      dados.data_nascimento,
      dados.salao,
      dados.escala,
      dados.turno,
      dados.capilar_lote,
      dados.observacoes,
      dados.ativo,
      dados.reuso_atual,
      dados.nome_mae,
      dados.sorologia_hcv,
      dados.sorologia_hiv,
      dados.sorologia_hbs,
      id,
      alterarDiaExtra,
      diaExtraFinal,
    ]
  );
  return rows[0];
}

/** Soft delete: history is preserved and the box slot is released. */
async function desativar(id) {
  const { rows } = await pool.query('UPDATE pacientes SET ativo = FALSE WHERE id = $1 RETURNING id', [id]);
  if (!rows[0]) throw new HttpErro(404, 'Paciente não encontrado.');
}

/**
 * Patient profile: registration data, every attended/missed session and
 * every dialyzer swap. A session is flagged `extra` when it was attended on
 * a day outside the patient's regular schedule.
 */
async function historico(id) {
  const paciente = await buscarPorId(id);

  const { rows: sessoes } = await pool.query(
    `SELECT s.id AS sessao_id, s.data_sessao, s.status, s.reuso_no_momento, s.capilar_no_momento,
            u.nome AS registrado_por_nome
     FROM sessoes s
     LEFT JOIN users u ON u.id = s.registrado_por
     WHERE s.paciente_id = $1 AND s.status IN ('REALIZADA', 'FALTA')
     ORDER BY s.data_sessao DESC`,
    [id]
  );

  const { rows: trocas } = await pool.query(
    `SELECT t.id, t.capilar_anterior, t.capilar_novo, t.reuso_no_momento, t.motivo, t.motivo_detalhe,
            t.criado_em, u.nome AS registrado_por_nome
     FROM trocas_capilar t
     LEFT JOIN users u ON u.id = t.registrado_por
     WHERE t.paciente_id = $1
     ORDER BY t.criado_em DESC`,
    [id]
  );

  return {
    paciente: {
      id: paciente.id,
      nome: paciente.nome,
      peso_kg: paciente.peso_kg,
      data_nascimento: paciente.data_nascimento,
      salao: paciente.salao,
      turno: paciente.turno,
      escala: paciente.escala,
      dia_extra_fixo: paciente.dia_extra_fixo,
      box: paciente.box,
      posicao_box: paciente.posicao_box,
      ativo: paciente.ativo,
      capilar_ativo: paciente.capilar,
      capilar_manual: paciente.capilar_manual,
      capilar_lote: paciente.capilar_lote,
      capilar_desde: paciente.capilar_desde,
      reuso_atual: paciente.reuso_atual,
      status_visual: paciente.status_visual,
    },
    historico: sessoes.map((s) => ({
      sessao_id: s.sessao_id,
      data: s.data_sessao,
      status: s.status,
      reuso_no_momento: s.reuso_no_momento,
      capilar_no_momento: s.capilar_no_momento,
      registrado_por_nome: s.registrado_por_nome,
      extra: s.status === 'REALIZADA' && !ehDiaDaEscala(paciente.escala, diaDaSemana(s.data_sessao)),
    })),
    trocas,
  };
}

/**
 * Assigns (or clears, with nulls) the fixed box/position of a patient.
 * Slot uniqueness is enforced by a partial unique index in the database.
 */
async function alocarBox(id, { box, posicao_box }) {
  box = vazio(box) ? null : Number(box);
  posicao_box = vazio(posicao_box) ? null : Number(posicao_box);

  if (box !== null && (box < 1 || box > TOTAL_BOXES)) {
    throw new HttpErro(400, `Box deve ser entre 1 e ${TOTAL_BOXES}.`);
  }
  if (posicao_box !== null && (posicao_box < 1 || posicao_box > POSICOES_POR_BOX)) {
    throw new HttpErro(400, `Posição deve ser entre 1 e ${POSICOES_POR_BOX}.`);
  }
  if ((box === null) !== (posicao_box === null)) {
    throw new HttpErro(400, 'Informe box e posição juntos, ou nenhum dos dois pra desalocar.');
  }

  try {
    const { rows } = await pool.query(
      'UPDATE pacientes SET box = $1, posicao_box = $2 WHERE id = $3 RETURNING *',
      [box, posicao_box, id]
    );
    if (!rows[0]) throw new HttpErro(404, 'Paciente não encontrado.');
    return rows[0];
  } catch (err) {
    if (err.code === '23505') throw new HttpErro(409, 'Esse slot já está ocupado por outro paciente.');
    throw err;
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, desativar, historico, alocarBox };
