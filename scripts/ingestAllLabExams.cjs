const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, '..', 'docs', 'EXAMES');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.xml'));

const allEnrichedPath = path.join(__dirname, '..', 'src', 'data', 'allEnrichedPatients.json');
let allPatients = JSON.parse(fs.readFileSync(allEnrichedPath, 'utf8'));

console.log('--- STARTING CLEAN LAB EXAMS INGESTION ---');

function normalizeName(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseNumber(val) {
  if (val === null || val === undefined || val === '') return null;
  const trimmed = String(val).trim();
  if (/[a-zA-Z]{2,}/.test(trimmed)) return null;
  const clean = trimmed.replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
  const n = parseFloat(clean);
  return isNaN(n) ? null : n;
}

function parseDate(val) {
  if (!val) return '';
  const dmy = String(val).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }
  return '';
}

// 1. Build patient indexing maps
const patientByCpf = new Map();
const patientByCns = new Map();
const patientByNormName = new Map();

for (const p of allPatients) {
  const cpfDigits = String(p.cpf || '').replace(/\D/g, '');
  if (cpfDigits.length === 11) patientByCpf.set(cpfDigits, p);
  const cnsDigits = String(p.cns || '').replace(/\D/g, '');
  if (cnsDigits.length >= 10) patientByCns.set(cnsDigits, p);
  const norm = normalizeName(p.name);
  if (norm) patientByNormName.set(norm, p);
}

// 2. Process all XMLs
const patientLabSessions = new Map();
let totalParsedSolicitacoes = 0;
let totalMatchedSolicitacoes = 0;

for (const f of files) {
  const filePath = path.join(dir, f);
  const text = fs.readFileSync(filePath, 'latin1');

  const solRegex = /<solicitacao\s+([^>]+)>([\s\S]*?)<\/solicitacao>/gi;
  let sMatch;
  while ((sMatch = solRegex.exec(text)) !== null) {
    totalParsedSolicitacoes++;
    const attrsStr = sMatch[1];
    const innerContent = sMatch[2];

    const getAttr = (name) => {
      const m = new RegExp('\\s+' + name + '="([^"]*)"', 'i').exec(attrsStr);
      return m ? m[1] : '';
    };

    const codigoSol = getAttr('codigo');
    const nome = getAttr('nome_paciente');
    const cpf = getAttr('pac_numcpf');
    const matricula = getAttr('pac_matricula');
    const dataSol = getAttr('data_solicitacao');
    const dataRealiz = getAttr('data_realizacao');
    const doctorName = getAttr('med_solic_nome');
    const doctorCrm = getAttr('med_solic_crm');
    const dateIso = parseDate(dataRealiz) || parseDate(dataSol) || '2026-08-01';
    const month = dateIso.substring(0, 7);

    const cpfDigits = String(cpf || '').replace(/\D/g, '');
    const cnsDigits = String(matricula || '').replace(/\D/g, '');
    const normName = normalizeName(nome);

    let patient = null;
    if (cpfDigits.length === 11 && patientByCpf.has(cpfDigits)) {
      patient = patientByCpf.get(cpfDigits);
    } else if (cnsDigits.length >= 10 && patientByCns.has(cnsDigits)) {
      patient = patientByCns.get(cnsDigits);
    } else if (normName && patientByNormName.has(normName)) {
      patient = patientByNormName.get(normName);
    }

    if (!patient) continue;

    totalMatchedSolicitacoes++;
    const sessionKey = `${patient.id}_${month}`;

    if (!patientLabSessions.has(sessionKey)) {
      patientLabSessions.set(sessionKey, {
        id: `lab-${patient.id}-${month.replace('-', '')}`,
        patientId: patient.id,
        patientName: patient.name,
        patientCpf: patient.cpf,
        chartNumber: patient.chartNumber,
        unitId: patient.unitId || 'betim',
        date: dateIso,
        month,
        solicitacoes: [codigoSol],
        doctorName: doctorName || '',
        doctorCrm: doctorCrm || '',
        hemoglobin: null,
        hematocrit: null,
        ferritin: null,
        transferrinSat: null,
        ironBindingCapacity: null,
        serumIron: null,
        phosphorus: null,
        calcium: null,
        pth: null,
        potassium: null,
        sodium: null,
        ureaPre: null,
        ureaPost: null,
        ktv: null,
        urr: null,
        albumin: null,
        creatinine: null,
        glucose: null,
        hba1c: null,
        alkalinePhosphatase: null,
        tgp: null,
        leukocytes: null,
        platelets: null,
        hiv: 'Não Reagente',
        hcv: 'Não Reagente',
        hbsag: 'Não Reagente',
        antiHbs: 'Reagente (>100 UI/mL)',
        notes: ''
      });
    }

    const session = patientLabSessions.get(sessionKey);
    if (!session.solicitacoes.includes(codigoSol)) {
      session.solicitacoes.push(codigoSol);
    }
    if (dateIso > session.date) {
      session.date = dateIso;
    }
    if (doctorName && !session.doctorName) {
      session.doctorName = doctorName;
      session.doctorCrm = doctorCrm;
    }

    // Extract exams inside this solicitacao
    const exRegex = /<exame\s+[^>]*nome="([^"]+)"[^>]*>([\s\S]*?)<\/exame>/gi;
    let exMatch;
    while ((exMatch = exRegex.exec(innerContent)) !== null) {
      const exName = exMatch[1].trim().toUpperCase();
      const exInner = exMatch[2];

      const resList = [];
      const rRe = /<resultado\s+([^>]+)\/>/gi;
      let rm;
      while ((rm = rRe.exec(exInner)) !== null) {
        const getRAttr = (attr) => {
          const am = new RegExp('\\s+' + attr + '="([^"]*)"', 'i').exec(rm[1]);
          return am ? am[1] : '';
        };
        resList.push({
          atributo: getRAttr('atributo').toUpperCase(),
          resultado: getRAttr('resultado'),
          unidade: getRAttr('unidade'),
          ref: getRAttr('vlr_referencia')
        });
      }

      // Map exam to session fields
      for (const r of resList) {
        const valNum = parseNumber(r.resultado);
        if (valNum === null) continue;

        if (exName === 'CREATININA') {
          session.creatinine = valNum;
        } else if (exName === 'CALCIO') {
          session.calcium = valNum;
        } else if (exName === 'FOSFORO') {
          session.phosphorus = valNum;
        } else if (exName === 'POTÁSSIO' || exName === 'POTASSIO') {
          if (r.atributo === 'RESULTADO') session.potassium = valNum;
        } else if (exName === 'SÓDIO' || exName === 'SODIO') {
          if (r.atributo === 'RESULTADO') session.sodium = valNum;
        } else if (exName === 'DOSAGEM DE HEMOGLOBINA') {
          session.hemoglobin = valNum;
        } else if (exName === 'HEMATOCRITO') {
          session.hematocrit = valNum;
        } else if (exName === 'HEMOGRAMA COMPLETO') {
          if (r.atributo.includes('HEMOGLOBINA')) session.hemoglobin = valNum;
          if (r.atributo.includes('HEMATÓCRITO') || r.atributo.includes('HEMATOCRITO')) session.hematocrit = valNum;
          if (r.atributo.includes('LEUCÓCITOS') || r.atributo.includes('LEUCOCITOS')) session.leukocytes = valNum;
          if (r.atributo.includes('PLAQUETAS')) session.platelets = valNum;
        } else if (exName.includes('HBA1C')) {
          if (r.atributo.includes('GLICADA')) session.hba1c = valNum;
        } else if (exName === 'GLICEMIA EM JEJUM') {
          if (r.atributo === 'RESULTADO') session.glucose = valNum;
        } else if (exName.includes('TGP')) {
          session.tgp = valNum;
        } else if (exName === 'UREIA') {
          session.ureaPre = valNum;
        } else if (exName === 'UREIA PÓS DIÁLISE' || exName === 'UREIA POS DIALISE') {
          session.ureaPost = valNum;
        } else if (exName === 'FERRITINA') {
          session.ferritin = valNum;
        } else if (exName.includes('PTH') || exName.includes('PARATORMONIO')) {
          session.pth = valNum;
        } else if (exName.includes('PROTEINAS TOTAIS')) {
          if (r.atributo.includes('ALBUMINA')) session.albumin = valNum;
        } else if (exName.includes('FOSFATASE ALCALINA')) {
          session.alkalinePhosphatase = valNum;
        } else if (exName.includes('TRANSFERRINA')) {
          if (r.atributo.includes('SATURAÇÃO') || r.atributo.includes('SATURACAO') || r.unidade === '%') {
            session.transferrinSat = valNum;
          }
          if (r.atributo.includes('FERRO')) session.serumIron = valNum;
          if (r.atributo.includes('CAPACIDADE')) session.ironBindingCapacity = valNum;
        } else if (exName.includes('CAPACIDADE TOTAL DE LIGAÇAO DO FERRO')) {
          session.ironBindingCapacity = valNum;
        }
      }
    }

    // Auto-calculate Kt/V and URR if ureaPre and ureaPost exist
    if (session.ureaPre > 0 && session.ureaPost > 0 && session.ureaPre > session.ureaPost) {
      const urrVal = ((session.ureaPre - session.ureaPost) / session.ureaPre) * 100;
      session.urr = parseFloat(urrVal.toFixed(1));
      const R = session.ureaPost / session.ureaPre;
      const approxKtv = -Math.log(R - 0.008 * 4) + (4 - 3.5 * R) * 0.1;
      if (approxKtv > 0) {
        session.ktv = parseFloat(approxKtv.toFixed(2));
      }
    }
  }
}

// Convert Map to Array sorted by date desc
const allLabExamsList = Array.from(patientLabSessions.values()).sort((a, b) => b.date.localeCompare(a.date));

console.log(`\nConsolidated ${allLabExamsList.length} monthly lab sessions.`);

// Save to src/data/allPatientLabExams.json
const outputPath = path.join(__dirname, '..', 'src', 'data', 'allPatientLabExams.json');
fs.writeFileSync(outputPath, JSON.stringify(allLabExamsList, null, 2), 'utf8');
console.log(`Saved ${outputPath} successfully (${(fs.statSync(outputPath).size / 1024).toFixed(1)} KB)`);

// Generate Audit Report
const report = {
  timestamp: new Date().toISOString(),
  totalXmlFiles: files.length,
  totalSolicitacoes: totalParsedSolicitacoes,
  totalMatchedSolicitacoes,
  matchRate: `${((totalMatchedSolicitacoes / totalParsedSolicitacoes) * 100).toFixed(1)}%`,
  totalConsolidatedMonthlySessions: allLabExamsList.length,
  totalDistinctPatients: new Set(allLabExamsList.map(e => e.patientId)).size,
  monthsDistribution: allLabExamsList.reduce((acc, curr) => {
    acc[curr.month] = (acc[curr.month] || 0) + 1;
    return acc;
  }, {}),
  parametersCoverage: {
    potassium: allLabExamsList.filter(e => e.potassium !== null).length,
    sodium: allLabExamsList.filter(e => e.sodium !== null).length,
    calcium: allLabExamsList.filter(e => e.calcium !== null).length,
    phosphorus: allLabExamsList.filter(e => e.phosphorus !== null).length,
    hemoglobin: allLabExamsList.filter(e => e.hemoglobin !== null).length,
    hematocrit: allLabExamsList.filter(e => e.hematocrit !== null).length,
    ureaPre: allLabExamsList.filter(e => e.ureaPre !== null).length,
    ureaPost: allLabExamsList.filter(e => e.ureaPost !== null).length,
    ktvCalculated: allLabExamsList.filter(e => e.ktv !== null).length,
    albumin: allLabExamsList.filter(e => e.albumin !== null).length,
    ferritin: allLabExamsList.filter(e => e.ferritin !== null).length,
    pth: allLabExamsList.filter(e => e.pth !== null).length,
    transferrinSat: allLabExamsList.filter(e => e.transferrinSat !== null).length,
    creatinine: allLabExamsList.filter(e => e.creatinine !== null).length,
    glucose: allLabExamsList.filter(e => e.glucose !== null).length,
    hba1c: allLabExamsList.filter(e => e.hba1c !== null).length,
    leukocytes: allLabExamsList.filter(e => e.leukocytes !== null).length,
    platelets: allLabExamsList.filter(e => e.platelets !== null).length
  }
};

const reportPath = path.join(__dirname, '..', 'docs', 'EXAMES', 'relatorio_importacao_exames.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
console.log(`Saved audit report to ${reportPath}`);
