// Text/HTML builders for the daily "patients at the reuse limit" alert.
// Input rows: { nome, capilar, salao, turno, dn_formatada }.

const { MAX_REUSO } = require('../domain/regrasNegocio');
const { formatarDataBR } = require('../utils/datas');

const NOMES_TURNO = { 1: '1º Turno', 2: '2º Turno', 3: '3º Turno' };
const nomeTurno = (turno) => NOMES_TURNO[turno] || `${turno}º Turno`;

/** Groups rows as Map<salao, Map<turno, rows[]>>, both keys sorted ascending. */
function agruparPorSalaoETurno(pacientes) {
  const porSalao = new Map();
  for (const p of pacientes) {
    if (!porSalao.has(p.salao)) porSalao.set(p.salao, new Map());
    const porTurno = porSalao.get(p.salao);
    if (!porTurno.has(p.turno)) porTurno.set(p.turno, []);
    porTurno.get(p.turno).push(p);
  }
  const ordenar = (mapa) => new Map([...mapa.entries()].sort((a, b) => (a[0] || 0) - (b[0] || 0)));
  return new Map([...ordenar(porSalao)].map(([salao, porTurno]) => [salao, ordenar(porTurno)]));
}

/** One-line summary. WhatsApp template parameters cannot contain line breaks. */
function montarResumoLimite(pacientes, dataISO) {
  if (pacientes.length === 0) {
    return `nenhum paciente atingiu ${MAX_REUSO} usos hoje (${formatarDataBR(dataISO)})`;
  }
  return `${pacientes.length} paciente(s) atingiram ${MAX_REUSO} usos hoje (${formatarDataBR(dataISO)}) — troque o capilar manualmente (pelo Dashboard ou ao emitir a próxima etiqueta)`;
}

/** Full multi-line text for a manual wa.me link (free text, markdown-ish bold). */
function montarMensagemDetalhada(pacientes, dataISO) {
  const linhas = [`*Informativo de limite de uso — ${formatarDataBR(dataISO)}*`, ''];

  if (pacientes.length === 0) {
    linhas.push(`Nenhum paciente atingiu ${MAX_REUSO} usos hoje.`);
    return linhas.join('\n');
  }

  for (const [salao, porTurno] of agruparPorSalaoETurno(pacientes)) {
    for (const [turno, lista] of porTurno) {
      linhas.push(`*Salão ${salao || '—'} — ${nomeTurno(turno)}*`);
      for (const p of lista) linhas.push(`• ${p.nome} — ${p.capilar}`);
      linhas.push('');
    }
  }
  linhas.push(`Total: ${pacientes.length} paciente(s) no limite de ${MAX_REUSO} usos hoje.`);
  return linhas.join('\n');
}

const escaparHtml = (texto) =>
  String(texto ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** E-mail subject + HTML body. */
function montarEmailLimite(pacientes, dataISO) {
  const data = formatarDataBR(dataISO);
  const assunto =
    pacientes.length > 0
      ? `ReusoPro — ${pacientes.length} paciente(s) no limite de ${MAX_REUSO} usos hoje (${data})`
      : `ReusoPro — nenhum paciente no limite de ${MAX_REUSO} usos hoje (${data})`;

  if (pacientes.length === 0) {
    return { assunto, html: `<p>Nenhum paciente atingiu ${MAX_REUSO} usos hoje.</p>` };
  }

  const celula = (v) => `<td style="padding:6px 10px;border-bottom:1px solid #e5e5e5;">${escaparHtml(v)}</td>`;
  const linhas = pacientes
    .map((p) =>
      [p.nome, nomeTurno(p.turno), p.salao ? `Salão ${p.salao}` : '—', p.dn_formatada || '—', p.capilar || '—']
        .map(celula)
        .join('')
    )
    .map((tds) => `<tr>${tds}</tr>`)
    .join('');

  const html = `
    <p>Pacientes que atingiram ${MAX_REUSO} usos hoje (${data}) — troque o capilar manualmente (pelo Dashboard ou ao emitir a próxima etiqueta):</p>
    <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px;">
      <thead>
        <tr style="background:#f0f0f0;text-align:left;">
          <th style="padding:6px 10px;">Nome</th><th style="padding:6px 10px;">Turno</th>
          <th style="padding:6px 10px;">Salão</th><th style="padding:6px 10px;">Data de nascimento</th>
          <th style="padding:6px 10px;">Capilar</th>
        </tr>
      </thead>
      <tbody>${linhas}</tbody>
    </table>`;

  return { assunto, html };
}

module.exports = { NOMES_TURNO, nomeTurno, agruparPorSalaoETurno, montarResumoLimite, montarMensagemDetalhada, montarEmailLimite };
