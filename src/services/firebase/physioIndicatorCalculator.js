// ============================================================
// Calculador Automático de Indicadores Clínicos de Fisioterapia
// Sincroniza em tempo real os atendimentos da aba Fisioterapia (.MULTI)
// com os indicadores de qualidade do módulo BI (.INDEX / .BI)
// ============================================================

export function computePhysiotherapyIndicators(records = []) {
  if (!records || records.length === 0) return [];

  // Agrupa os registros por competência (período YYYY-MM) e unidade
  const groups = {};
  records.forEach(r => {
    const period = r.period || '2026-10';
    const unitId = r.unitId || 'betim';
    const key = `${period}_${unitId}`;
    if (!groups[key]) {
      groups[key] = { period, unitId, list: [] };
    }
    groups[key].list.push(r);
  });

  const now = new Date().toISOString();
  const points = [];
  const round1 = (val) => Math.round(val * 10) / 10;

  Object.values(groups).forEach(({ period, unitId, list }) => {
    const total = list.length;
    if (total === 0) return;

    const totalSessoes = list.reduce((sum, r) => {
      const val = Number(r.sessoes);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);

    const aderentes = list.filter(r => r.aderente === true).length;
    const bom = list.filter(r => r.estadoGeral === 'Bom').length;
    const dor = list.filter(r => r.demandas?.dor === true).length;
    const mobilidade = list.filter(r => r.demandas?.mobilidade === true).length;
    const fraqueza = list.filter(r => r.demandas?.fraqueza === true).length;
    const incapacidade = list.filter(r => r.demandas?.incapacidade === true).length;
    const espontanea = list.filter(r => r.demandaEspontanea === true).length;
    const busca = list.filter(r => r.buscaAtiva === true).length;

    points.push(
      {
        indicatorId: 'fisio_total_sessoes',
        sectorId: 'fisioterapia',
        unitId,
        value: totalSessoes,
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_pacientes_avaliados',
        sectorId: 'fisioterapia',
        unitId,
        value: total,
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_taxa_aderencia',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((aderentes / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_estado_bom',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((bom / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_prevalencia_dor',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((dor / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_deficit_mobilidade',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((mobilidade / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_fraqueza_muscular',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((fraqueza / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_incapacidade_funcional',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((incapacidade / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_demanda_espontanea',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((espontanea / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      },
      {
        indicatorId: 'fisio_busca_ativa',
        sectorId: 'fisioterapia',
        unitId,
        value: round1((busca / total) * 100),
        period,
        uploadedBy: 'sistema-fisio',
        uploadedAt: now
      }
    );
  });

  return points;
}
