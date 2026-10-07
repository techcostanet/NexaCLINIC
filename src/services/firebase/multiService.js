// ============================================================
// Serviço de Dados do Módulo .MULTI (Equipe Multiprofissional)
// Gestão de Serviço Social, Psicologia e Nutrição
// ============================================================

import { app } from './config';
import { USE_MOCK } from './mockDb';
import { getPatients as getClinicPatients } from './patientService';
import * as XLSX from 'xlsx';

const STORAGE_KEY_SOCIAL = 'nexai_multi_social_anamneses';
const STORAGE_KEY_PSY = 'nexai_multi_psychology_records';
const STORAGE_KEY_NUTRI = 'nexai_multi_nutrition_records';

// Base mock inicial realista para resiliência offline e demonstração clínica imediata
const MOCK_SOCIAL_ANAMNESIS_SEED = [
  {
    id: 'soc-anam-001',
    patientId: 'reu-pat-001',
    unitId: 'betim',
    nomeCompleto: 'JÉSIO DE JESUS RIBEIRO',
    dataNascimento: '1975-03-12',
    telefonePrincipal: '(31) 98844-1234',
    telefoneSecundario: '(31) 98765-4321',
    endereco: 'Rua das Palmeiras, 142',
    bairro: 'Jardim das Alterosas',
    cidade: 'Betim',
    ubsReferencia: 'UBS Alterosas 2',
    tipoTratamento: 'Hemodiálise – HD',
    escalaTurno: '1º turno – Segunda / Quarta / Sexta',
    salaTratamento: 'Sala 01',
    estadoCivil: 'Casado(a)',
    escolaridade: 'Ensino Médio completo',
    trabalhaAtualmente: 'Não',
    ajudaAtividades: 'Parcialmente',
    possuiCuidador: 'Sim',
    pessoaApoio: 'Cônjuge',
    pessoasResidencia: '3',
    rendaFamiliar: 'De R$ 1.621,01 a R$ 3.242,00',
    situacaoMoradia: 'Própria quitada',
    aguaEncanada: 'Sim',
    esgotamentoSanitario: 'Rede geral de esgoto',
    recebeBeneficio: 'Benefício por incapacidade',
    contribuiuInss: 'Sim',
    transporteTratamento: 'Transporte da Prefeitura',
    dificuldadeTransporte: 'Não',
    rendaSuficiente: 'Sim',
    dificuldadeAlimentos: 'Não',
    dificuldadeTratamento: 'Não',
    gostariaConversar: 'Não',
    situacaoImportante: 'Paciente bem adaptado à rotina de diálise. Apoio familiar presente.',
    parecerTecnico: 'Acompanhamento trimestral de rotina. Paciente com passe livre municipal ativo.',
    responsavelTecnico: 'Ana Paula Ferreira',
    cressResponsavel: 'CRESS/MG 14.892',
    statusAcompanhamento: 'Em Acompanhamento',
    origemPreenchimento: 'social',
    createdAt: '2026-09-10T14:30:00.000Z',
    updatedAt: '2026-09-10T14:30:00.000Z'
  },
  {
    id: 'soc-anam-002',
    patientId: 'reu-pat-002',
    unitId: 'betim',
    nomeCompleto: 'EDNALVA SILVA DAS FLORES',
    dataNascimento: '1982-08-25',
    telefonePrincipal: '(31) 99122-3344',
    telefoneSecundario: '(31) 98455-6677',
    endereco: 'Av. Amazonas, 850, Ap 201',
    bairro: 'Centro',
    cidade: 'Betim',
    ubsReferencia: 'UBS Centro',
    tipoTratamento: 'Hemodiálise – HD',
    escalaTurno: '1º turno – Segunda / Quarta / Sexta',
    salaTratamento: 'Sala 02',
    estadoCivil: 'Solteiro(a)',
    escolaridade: 'Ensino Fundamental incompleto',
    trabalhaAtualmente: 'Não',
    ajudaAtividades: 'Sim',
    possuiCuidador: 'Sim',
    pessoaApoio: 'Filho(a)',
    pessoasResidencia: '4',
    rendaFamiliar: 'Até R$ 405,25',
    situacaoMoradia: 'Alugada',
    aguaEncanada: 'Sim',
    esgotamentoSanitario: 'Rede geral de esgoto',
    recebeBeneficio: 'Bolsa Família ou outro programa de transferência de renda',
    contribuiuInss: 'Não',
    transporteTratamento: 'Ônibus',
    dificuldadeTransporte: 'Sim',
    rendaSuficiente: 'Não',
    dificuldadeAlimentos: 'Sim',
    dificuldadeTratamento: 'Sim',
    gostariaConversar: 'Sim',
    situacaoImportante: 'Dificuldade para pagar aluguel e comprar alimentos específicos da dieta renal.',
    parecerTecnico: 'Encaminhamento prioritário ao CRAS para inclusão na cesta de alimentos e orientação para requerimento de BPC/LOAS.',
    responsavelTecnico: 'Ana Paula Ferreira',
    cressResponsavel: 'CRESS/MG 14.892',
    statusAcompanhamento: 'Prioritário',
    origemPreenchimento: 'paciente',
    createdAt: '2026-09-22T10:15:00.000Z',
    updatedAt: '2026-09-23T11:00:00.000Z'
  },
  {
    id: 'soc-anam-003',
    patientId: 'reu-pat-003',
    unitId: 'betim',
    nomeCompleto: 'VILMA LÚCIA NEVES',
    dataNascimento: '1968-11-04',
    telefonePrincipal: '(31) 97321-9876',
    telefoneSecundario: '',
    endereco: 'Rua Bela Vista, 55',
    bairro: 'Vila Cristina',
    cidade: 'Betim',
    ubsReferencia: 'UBS Vila Cristina',
    tipoTratamento: 'Hemodiálise – HD',
    escalaTurno: '2º turno – Terça / Quinta / Sábado',
    salaTratamento: 'Sala 03',
    estadoCivil: 'Viúvo(a)',
    escolaridade: 'Ensino Fundamental completo',
    trabalhaAtualmente: 'Não',
    ajudaAtividades: 'Não',
    possuiCuidador: 'Não',
    pessoaApoio: 'Irmão(ã)',
    pessoasResidencia: '1',
    rendaFamiliar: 'De R$ 810,51 a R$ 1.621,00',
    situacaoMoradia: 'Própria quitada',
    aguaEncanada: 'Sim',
    esgotamentoSanitario: 'Rede geral de esgoto',
    recebeBeneficio: 'Pensão',
    contribuiuInss: 'Sim',
    transporteTratamento: 'Transporte da Prefeitura',
    dificuldadeTransporte: 'Às vezes',
    rendaSuficiente: 'Parcialmente',
    dificuldadeAlimentos: 'Não',
    dificuldadeTratamento: 'Prefiro conversar pessoalmente com o Serviço Social',
    gostariaConversar: 'Sim',
    situacaoImportante: 'Mora sozinha e às vezes tem tonturas após a diálise, receio de cair em casa.',
    parecerTecnico: 'Articulação com a irmã para suporte no pós-diálise imediato e encaminhamento para avaliação da Psicologia.',
    responsavelTecnico: 'Ana Paula Ferreira',
    cressResponsavel: 'CRESS/MG 14.892',
    statusAcompanhamento: 'Em Acompanhamento',
    origemPreenchimento: 'social',
    createdAt: '2026-09-28T16:00:00.000Z',
    updatedAt: '2026-09-28T16:00:00.000Z'
  }
];

function getLocalSocialAnamneses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SOCIAL);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Erro ao ler anamneses locais:', e);
  }
  localStorage.setItem(STORAGE_KEY_SOCIAL, JSON.stringify(MOCK_SOCIAL_ANAMNESIS_SEED));
  return [...MOCK_SOCIAL_ANAMNESIS_SEED];
}

function setLocalSocialAnamneses(data) {
  try {
    localStorage.setItem(STORAGE_KEY_SOCIAL, JSON.stringify(data));
  } catch (e) {
    console.warn('Erro ao salvar anamneses locais:', e);
  }
}

// -------------------------------------------------------------
// SERVIÇO SOCIAL: ANAMNESES E ATENDIMENTOS
// -------------------------------------------------------------

export async function getSocialAnamneses(unitId = null) {
  if (USE_MOCK) {
    const all = getLocalSocialAnamneses();
    if (unitId && unitId !== 'all') {
      return all.filter(item => !item.unitId || item.unitId === unitId);
    }
    return all;
  }

  try {
    const { getFirestore, collection, getDocs, query, where } = await import('firebase/firestore');
    const db = getFirestore(app);
    let q = collection(db, 'multi_social_anamnesis');
    if (unitId && unitId !== 'all') {
      q = query(q, where('unitId', '==', unitId));
    }
    const snap = await getDocs(q);
    if (snap.empty) {
      // Seed inicial se vazio
      const local = getLocalSocialAnamneses();
      return unitId && unitId !== 'all' ? local.filter(i => !i.unitId || i.unitId === unitId) : local;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.warn('Firestore offline, utilizando cache local de anamneses sociais:', err);
    const local = getLocalSocialAnamneses();
    return unitId && unitId !== 'all' ? local.filter(i => !i.unitId || i.unitId === unitId) : local;
  }
}

export async function getSocialAnamneseById(id) {
  if (!id) return null;
  const list = await getSocialAnamneses();
  return list.find(item => item.id === id) || null;
}

export async function getSocialAnamneseByPatientId(patientId) {
  if (!patientId) return null;
  const list = await getSocialAnamneses();
  return list.find(item => item.patientId === patientId) || null;
}

export async function saveSocialAnamnese(anamneseData, currentUser = null) {
  const now = new Date().toISOString();
  const id = anamneseData.id || `soc-anam-${Date.now()}`;
  
  const record = {
    ...anamneseData,
    id,
    updatedAt: now,
    updatedBy: currentUser?.name || currentUser?.email || 'Sistema'
  };

  if (!anamneseData.createdAt) {
    record.createdAt = now;
  }

  // Atualiza LocalStorage sempre para resiliência instantânea
  const localList = getLocalSocialAnamneses();
  const existingIdx = localList.findIndex(x => x.id === id);
  if (existingIdx >= 0) {
    localList[existingIdx] = record;
  } else {
    localList.unshift(record);
  }
  setLocalSocialAnamneses(localList);

  if (!USE_MOCK) {
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      await setDoc(doc(db, 'multi_social_anamnesis', id), record, { merge: true });
    } catch (err) {
      console.warn('Erro ao salvar no Firestore (mantido localmente):', err);
    }
  }

  return record;
}

export async function deleteSocialAnamnese(id, currentUser = null) {
  if (!id) return false;
  const localList = getLocalSocialAnamneses().filter(x => x.id !== id);
  setLocalSocialAnamneses(localList);

  if (!USE_MOCK) {
    try {
      const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
      const db = getFirestore(app);
      await deleteDoc(doc(db, 'multi_social_anamnesis', id));
    } catch (err) {
      console.warn('Erro ao remover no Firestore:', err);
    }
  }
  return true;
}

// -------------------------------------------------------------
// PSICOLOGIA & NUTRIÇÃO (ESTRUTURA BASE COMPARTILHADA)
// -------------------------------------------------------------

export async function getPsychologyRecords(unitId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PSY);
    const list = raw ? JSON.parse(raw) : [];
    if (unitId && unitId !== 'all') {
      return list.filter(x => !x.unitId || x.unitId === unitId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export async function savePsychologyRecord(data, currentUser = null) {
  const now = new Date().toISOString();
  const id = data.id || `psy-rec-${Date.now()}`;
  const record = {
    ...data,
    id,
    updatedAt: now,
    author: currentUser?.name || 'Psicologia'
  };
  const list = await getPsychologyRecords();
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0) list[idx] = record;
  else list.unshift(record);
  localStorage.setItem(STORAGE_KEY_PSY, JSON.stringify(list));
  return record;
}

export async function getNutritionRecords(unitId = null) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NUTRI);
    const list = raw ? JSON.parse(raw) : [];
    if (unitId && unitId !== 'all') {
      return list.filter(x => !x.unitId || x.unitId === unitId);
    }
    return list;
  } catch (e) {
    return [];
  }
}

export async function saveNutritionRecord(data, currentUser = null) {
  const now = new Date().toISOString();
  const id = data.id || `nut-rec-${Date.now()}`;
  const record = {
    ...data,
    id,
    updatedAt: now,
    author: currentUser?.name || 'Nutrição'
  };
  const list = await getNutritionRecords();
  const idx = list.findIndex(x => x.id === id);
  if (idx >= 0) list[idx] = record;
  else list.unshift(record);
  localStorage.setItem(STORAGE_KEY_NUTRI, JSON.stringify(list));
  return record;
}

// -------------------------------------------------------------
// EXPORTAÇÃO EXCEL NATIVA (.xlsx)
// -------------------------------------------------------------

export function exportSocialAnamnesesToExcel(list, filename = 'Anamnese_Social_Pacientes.xlsx') {
  if (!list || list.length === 0) return;

  const rows = list.map((a, idx) => ({
    'Nº': idx + 1,
    'Paciente': a.nomeCompleto || 'NÃO INFORMADO',
    'Nascimento': a.dataNascimento ? new Date(a.dataNascimento).toLocaleDateString('pt-BR') : '',
    'Telefone Principal': a.telefonePrincipal || '',
    'Telefone Secundário': a.telefoneSecundario || '',
    'Endereço': a.endereco || '',
    'Bairro': a.bairro || '',
    'Cidade': a.cidade || '',
    'UBS Referência': a.ubsReferencia || '',
    'Tratamento': a.tipoTratamento || '',
    'Escala e Turno': a.escalaTurno || '',
    'Sala': a.salaTratamento || '',
    'Estado Civil': a.estadoCivil || '',
    'Escolaridade': a.escolaridade || '',
    'Trabalha': a.trabalhaAtualmente || '',
    'Ajuda no Dia a Dia': a.ajudaAtividades || '',
    'Possui Cuidador': a.possuiCuidador || '',
    'Pessoa Apoio': a.pessoaApoio || '',
    'Moradores': a.pessoasResidencia || '',
    'Renda Familiar': a.rendaFamiliar || '',
    'Situação Moradia': a.situacaoMoradia || '',
    'Água Encanada': a.aguaEncanada || '',
    'Esgotamento Sanitário': a.esgotamentoSanitario || '',
    'Benefício Social': a.recebeBeneficio || '',
    'Contribuição INSS': a.contribuiuInss || '',
    'Meio Transporte': a.transporteTratamento || '',
    'Dificuldade Transporte': a.dificuldadeTransporte || '',
    'Renda Suficiente': a.rendaSuficiente || '',
    'Dificuldade Alimentos': a.dificuldadeAlimentos || '',
    'Risco Continuidade': a.dificuldadeTratamento || '',
    'Solicita Conversa': a.gostariaConversar || '',
    'Situação Importante': a.situacaoImportante || '',
    'Parecer Técnico': a.parecerTecnico || '',
    'Responsável CRESS': `${a.responsavelTecnico || ''} ${a.cressResponsavel || ''}`.trim(),
    'Status': a.statusAcompanhamento || 'Triagem',
    'Origem': a.origemPreenchimento === 'paciente' ? 'Link Paciente' : 'Serviço Social',
    'Data Registro': a.createdAt ? new Date(a.createdAt).toLocaleString('pt-BR') : ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Anamnese Social');
  XLSX.writeFile(workbook, filename);
}
