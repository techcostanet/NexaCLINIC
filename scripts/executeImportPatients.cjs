const fs = require('fs');
const path = require('path');

const htmPath = path.join(__dirname, '..', 'docs', 'PACIENTES', 'Nome, Endereço, Telefone (1)_arquivos', 'sheet001.htm');
const enrichedPatientsPath = path.join(__dirname, '..', 'src', 'data', 'allEnrichedPatients.json');
const reportPath = path.join(__dirname, '..', 'docs', 'PACIENTES', 'relatorio_atualizacao_pacientes.json');

const rawHtml = fs.readFileSync(htmPath, 'latin1');
const currentPatients = JSON.parse(fs.readFileSync(enrichedPatientsPath, 'utf8'));

console.log('--- EXECUTING HOSPITAL PATIENTS IMPORT ---');
console.log('Current existing patients:', currentPatients.length);

function cleanCell(c) {
  return c.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeName(str) {
  return String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatCpf(val) {
  const digits = String(val || '').replace(/\D/g, '');
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  }
  return val ? String(val).trim() : '';
}

function parsePhones(str) {
  if (!str) return { phone: '', contacts: [] };
  const rawList = str.split(';').map(s => s.trim()).filter(Boolean);
  const contacts = [];
  let mainPhone = '';

  for (const item of rawList) {
    const parts = item.split(':');
    let label = 'Contato';
    let phoneNum = item;
    if (parts.length > 1) {
      label = parts[0].trim();
      phoneNum = parts.slice(1).join(':').trim();
    }
    const cleanNum = phoneNum.replace(/\s+/g, ' ').trim();
    if (!mainPhone && cleanNum) {
      mainPhone = cleanNum;
    }
    contacts.push({
      name: label || 'Contato',
      relationship: label.toLowerCase().includes('espos') ? 'Cônjuge' :
                    label.toLowerCase().includes('filh') ? 'Filho(a)' :
                    label.toLowerCase().includes('irm') ? 'Irmão(ã)' :
                    label.toLowerCase().includes('mãe') || label.toLowerCase().includes('mae') ? 'Mãe' :
                    label.toLowerCase().includes('pai') ? 'Pai' :
                    label.toLowerCase().includes('marid') ? 'Cônjuge' : 'Contato',
      phone: cleanNum
    });
  }
  return { phone: mainPhone, contacts };
}

function parseBirthDate(val) {
  if (!val) return '';
  const dmy = String(val).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (dmy) {
    return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  }
  return '';
}

const femaleSuffixes = ['A', 'E', 'IS', 'ETH', 'ELI', 'ENE', 'ANE', 'INE', 'ETE', 'ICE', 'LIA'];
const femaleExceptions = new Set(['JOSE', 'ALEXANDRE', 'JORGE', 'FELIPE', 'ANDRE', 'VICENTE', 'HENRIQUE', 'GUILHERME', 'DANTE']);
const maleExceptions = new Set(['MARIA', 'ANA', 'RITA', 'VERA', 'LUCIA', 'SONIA', 'NEUSA', 'TEREZA', 'CLEUSA', 'EDNA', 'ALICE', 'BEATRIZ', 'RAQUEL', 'CARMEN', 'MIRIAM', 'ESTER', 'RUTH', 'SUELI', 'IVONE', 'NAIR', 'SOLANGE', 'SIMONE', 'LILIAN', 'MARLENE', 'SALETE', 'DENISE', 'CLEIDE', 'IVETE', 'ELIZABETH', 'IRENE', 'ARLETE', 'ODETE', 'LOURDES', 'MERCEDES', 'INÊS', 'INES', 'IRIS']);

function guessGender(fullName) {
  const first = fullName.trim().split(/\s+/)[0].toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (maleExceptions.has(first)) return 'Feminino';
  if (femaleExceptions.has(first)) return 'Masculino';
  if (first.endsWith('A')) return 'Feminino';
  return 'Masculino';
}

// Parse sheet001 rows
const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
let match;
const rows = [];
while ((match = trRegex.exec(rawHtml)) !== null) {
  const rowContent = match[1];
  const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
  let tdMatch;
  const cells = [];
  while ((tdMatch = tdRegex.exec(rowContent)) !== null) {
    cells.push(cleanCell(tdMatch[1]));
  }
  if (cells.length > 0) {
    rows.push(cells);
  }
}

const dataRows = rows.slice(4);
const hospitalRecords = [];

for (const cells of dataRows) {
  const name = cells[0];
  if (!name || name.toUpperCase().includes('TOTAL DE PACIENTES') || name.toUpperCase().includes('RELATÓRIO')) continue;

  const rawCpf = cells[1] || '';
  const motherName = cells[2] || '';
  const birthDateRaw = cells[3] || '';
  const phonesRaw = cells[4] || '';
  const address = cells[5] || '';
  const number = cells[6] || '';
  const neighborhood = cells[7] || '';
  const city = cells[8] || '';
  const state = cells[9] || 'MG';
  const country = cells[10] || 'Brasil';
  const cep = cells[11] || '';
  const complement = cells[12] || '';
  const referencePoint = cells[13] || '';
  const cns = cells[14] || '';

  const { phone, contacts } = parsePhones(phonesRaw);
  const formattedCpf = formatCpf(rawCpf);
  const isoBirthDate = parseBirthDate(birthDateRaw);

  hospitalRecords.push({
    rawName: name.replace(/\s+/g, ' ').trim(),
    normName: normalizeName(name),
    cpf: formattedCpf,
    motherName: motherName.replace(/\s+/g, ' ').trim(),
    birthDate: isoBirthDate,
    birthDateRaw: birthDateRaw.trim(),
    phonesRaw: phonesRaw.replace(/\s+/g, ' ').trim(),
    phone,
    contacts,
    address: address.replace(/\s+/g, ' ').trim(),
    number: number.replace(/\s+/g, ' ').trim(),
    neighborhood: neighborhood.replace(/\s+/g, ' ').trim(),
    city: city.replace(/\s+/g, ' ').trim() || 'Betim',
    state: (state || 'MG').replace(/\s+/g, ' ').trim(),
    country: (country || 'Brasil').replace(/\s+/g, ' ').trim(),
    cep: cep.replace(/\s+/g, ' ').trim(),
    complement: complement.replace(/\s+/g, ' ').trim(),
    referencePoint: referencePoint.replace(/\s+/g, ' ').trim(),
    cns: cns.replace(/\s+/g, ' ').trim()
  });
}

console.log('Total valid parsed hospital records:', hospitalRecords.length);

const hospitalByNormName = new Map();
const hospitalByCpf = new Map();
for (const hr of hospitalRecords) {
  if (hr.normName && !hospitalByNormName.has(hr.normName)) {
    hospitalByNormName.set(hr.normName, hr);
  }
  const cleanCpfDigits = hr.cpf.replace(/\D/g, '');
  if (cleanCpfDigits.length === 11 && !hospitalByCpf.has(cleanCpfDigits)) {
    hospitalByCpf.set(cleanCpfDigits, hr);
  }
}

// 1. Correct CPFs for existing matched patients
let existingCpfFixed = 0;
const matchedHospitalNormNames = new Set();
const matchedHospitalCpfs = new Set();

for (const pat of currentPatients) {
  const pNorm = normalizeName(pat.name);
  const pCpfDigits = String(pat.cpf || '').replace(/\D/g, '');

  let hMatch = hospitalByNormName.get(pNorm);
  if (!hMatch && pCpfDigits.length === 11) {
    hMatch = hospitalByCpf.get(pCpfDigits);
  }

  if (hMatch) {
    matchedHospitalNormNames.add(hMatch.normName);
    const mCpfDigits = hMatch.cpf.replace(/\D/g, '');
    if (mCpfDigits) matchedHospitalCpfs.add(mCpfDigits);

    if (hMatch.cpf && hMatch.cpf.length >= 11) {
      if (pat.cpf !== hMatch.cpf) {
        pat.cpf = hMatch.cpf;
        existingCpfFixed++;
      }
    }
  }
}

console.log(`Existing patients with CPF updated/corrected: ${existingCpfFixed}`);

// 2. Identify new unique hospital patients
const newHospitalPatients = [];
const seenNewNormNames = new Set();

for (const hr of hospitalRecords) {
  if (matchedHospitalNormNames.has(hr.normName)) continue;
  const cpfDigits = hr.cpf.replace(/\D/g, '');
  if (cpfDigits && matchedHospitalCpfs.has(cpfDigits)) continue;
  if (seenNewNormNames.has(hr.normName)) continue;

  seenNewNormNames.add(hr.normName);
  newHospitalPatients.push(hr);
}

console.log(`Unique brand new patients to append: ${newHospitalPatients.length}`);

// 3. Build new patient objects
let currentMaxPatId = 691;
let currentMaxChart = 1690;

const createdPatients = newHospitalPatients.map((hr, index) => {
  const nextIdNum = currentMaxPatId + index + 1;
  const nextChartNum = currentMaxChart + index + 1;
  const id = `pat-${nextIdNum}`;
  const chartNumber = `PR-${String(nextChartNum).padStart(6, '0')}`;
  const protocolNumber = `PROT-2026-${nextChartNum}`;

  const slug = hr.rawName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '.')
    .replace(/^\.|\.$/g, '');
  const email = `${slug}@paciente.dialize.com.br`;
  const gender = guessGender(hr.rawName);

  return {
    id,
    unitId: 'betim',
    unit: 'Betim',
    name: hr.rawName,
    socialName: '',
    cpf: hr.cpf,
    rg: '',
    rgIssuer: '',
    cns: hr.cns,
    birthDate: hr.birthDate,
    gender,
    chartNumber,
    motherName: hr.motherName,
    fatherName: '',
    maritalStatus: 'Não informado',
    race: 'Não informada',
    patientType: 'Crônico',
    treatmentStatus: 'Ativo',
    photo: '',
    phone: hr.phone,
    email,
    cep: hr.cep,
    address: hr.address,
    number: hr.number,
    complement: hr.complement,
    neighborhood: hr.neighborhood,
    city: hr.city || 'Betim',
    state: hr.state || 'MG',
    country: hr.country || 'Brasil',
    referencePoint: hr.referencePoint,
    contacts: hr.contacts,
    phoneNotes: hr.phonesRaw,
    insurance: 'SUS',
    insuranceNumber: hr.cns ? `SUS-${hr.cns}` : '',
    insurancePlan: 'SUS Universal',
    insuranceExpiry: '',
    apacNumber: '',
    apacExpiry: '',
    protocolNumber,
    treatmentType: 'TTO Con.',
    dialysisFrequency: '',
    shift: '',
    room: '',
    box: '',
    point: null,
    chairNumber: '',
    machineSerial: '',
    needleSize: '',
    dryWeight: null,
    accessType: '',
    accessSide: '',
    isolation: null,
    attendingDoctor: 'Dr. Matheus Ramos',
    scheduleSlots: [],
    originType: 'Hospital',
    originCenter: 'Hospital Regional de Betim',
    firstDialysisDate: '',
    firstDialysisType: '',
    firstDialysisLocation: '',
    admissionDate: '2026-11-01',
    primaryDiagnosis: 'N18.9 - Doença renal crônica não especificada',
    bloodType: '',
    rhFactor: '',
    allergies: 'Nenhuma relatada',
    diabetes: 'Não',
    diabetesMeds: '',
    has: 'Sim',
    cardiopathy: 'Não',
    smoking: 'Não',
    alcohol: 'Não',
    transplantEligible: 'Em Avaliação',
    transplantStatus: 'Acompanhamento Ambulatorial',
    transplantCenter: '',
    transplantRbtNumber: '',
    donorType: '',
    pregnancies: 0,
    births: 0,
    abortions: 0,
    transfusions: 0,
    createdAt: '2026-11-14T12:00:00.000Z',
    updatedAt: new Date().toISOString()
  };
});

const consolidatedPatients = [...currentPatients, ...createdPatients];
console.log(`Total consolidated patients: ${consolidatedPatients.length}`);

// Write consolidated patients to allEnrichedPatients.json
fs.writeFileSync(enrichedPatientsPath, JSON.stringify(consolidatedPatients, null, 2), 'utf8');
console.log('Saved src/data/allEnrichedPatients.json successfully!');

// Generate updated audit report
const reportData = {
  timestamp: new Date().toISOString(),
  totalSheetRows: hospitalRecords.length,
  totalBaseBefore: currentPatients.length,
  totalExistingMatched: matchedHospitalNormNames.size,
  existingCpfsCorrected: existingCpfFixed,
  newPatientsImported: createdPatients.length,
  totalFinalPatients: consolidatedPatients.length,
  treatmentBreakdown: {
    HD: consolidatedPatients.filter(p => p.treatmentType === 'HD').length,
    TTO_Conservador: consolidatedPatients.filter(p => p.treatmentType === 'TTO Con.').length,
    APD: consolidatedPatients.filter(p => p.treatmentType === 'APD').length,
    CAPD: consolidatedPatients.filter(p => p.treatmentType === 'CAPD').length,
    Outros: consolidatedPatients.filter(p => !['HD', 'TTO Con.', 'APD', 'CAPD'].includes(p.treatmentType)).length
  },
  metrics: {
    withCpf: consolidatedPatients.filter(p => p.cpf && p.cpf.length >= 11 && !p.cpf.includes('..')).length,
    withPhone: consolidatedPatients.filter(p => !!p.phone).length,
    withAddress: consolidatedPatients.filter(p => !!p.address).length,
    withNeighborhood: consolidatedPatients.filter(p => !!p.neighborhood).length,
    withCep: consolidatedPatients.filter(p => !!p.cep).length,
    withCns: consolidatedPatients.filter(p => !!p.cns).length,
    withMother: consolidatedPatients.filter(p => !!p.motherName).length
  },
  sampleImported: createdPatients.slice(0, 5).map(p => ({
    id: p.id,
    name: p.name,
    cpf: p.cpf,
    chartNumber: p.chartNumber,
    treatmentType: p.treatmentType,
    city: p.city,
    neighborhood: p.neighborhood,
    phone: p.phone,
    contactsCount: p.contacts.length
  }))
};

fs.writeFileSync(reportPath, JSON.stringify(reportData, null, 2), 'utf8');
console.log('Saved docs/PACIENTES/relatorio_atualizacao_pacientes.json successfully!');
