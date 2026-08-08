import { app } from './config';
import { USE_MOCK, mockFirestore } from './mockDb';

export const getIndicators = async () => {
    if (USE_MOCK) {
      return mockFirestore.getIndicators();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'indicators'));
    
    // Seed default indicators if empty
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'taxa_infeccao_cateter', name: 'Taxa de Infecção por Cateter', sectorId: 'enfermagem', unit: '%', target: 1.5, description: 'Percentual de pacientes com infecção de acesso vascular (cateter)' },
        { id: 'reuso_capilares', name: 'Média de Reuso de Dialisadores', sectorId: 'enfermagem', unit: 'reusos', target: 12, description: 'Número médio de vezes que um dialisador (capilar) é reusado' },
        { id: 'mortalidade_mensal', name: 'Taxa de Mortalidade Mensal', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de óbitos de pacientes em tratamento no mês' },
        { id: 'taxa_internacao', name: 'Taxa de Internação Hospitalar', sectorId: 'medica', unit: '%', target: 10.0, description: 'Porcentagem de pacientes que necessitaram de internação no período' },
        { id: 'satisfacao_paciente', name: 'Satisfação do Paciente (NPS)', sectorId: 'qualidade', unit: 'pontos', target: 80.0, description: 'Net Promoter Score aferido na pesquisa trimestral' },
        { id: 'glosas_faturamento', name: 'Percentual de Glosas', sectorId: 'faturamento', unit: '%', target: 2.0, description: 'Porcentagem de faturamento glosado pelo SUS/Convênios' },
        { id: 'taxa_atendimento_psico', name: 'Taxa de Atendimento Psicológico', sectorId: 'psicologia', unit: '%', target: 40.0, description: 'Percentual de pacientes atendidos no mês sobre o total em diálise (DP + HD).' },
        { id: 'taxa_risco_psico', name: 'Taxa de Risco Psicológico', sectorId: 'psicologia', unit: '%', target: 25.0, description: 'Percentual de pacientes identificados com ansiedade, depressão ou risco emocional.' },
        { id: 'taxa_encaminhamento_rede', name: 'Taxa de Encaminhamento à Rede', sectorId: 'psicologia', unit: '%', target: 5.0, description: 'Percentual de encaminhamentos para acompanhamento externo ou avaliação de transplante.' },
        { id: 'psico_total_pacientes', name: 'Total de pacientes em diálise', sectorId: 'psicologia', unit: 'pacientes', target: 600, description: 'Total de pacientes em diálise no mês.' },
        { id: 'psico_admitidos', name: 'Número de pacientes admitidos no mês', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes admitidos no mês.' },
        { id: 'psico_atendidos', name: 'Número de pacientes atendidos no mês', sectorId: 'psicologia', unit: 'pacientes', target: 240, description: 'Pacientes atendidos no mês.' },
        { id: 'psico_crise', name: 'Número paciente atendido em crise', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Pacientes atendidos em crise.' },
        { id: 'psico_demanda_espontanea', name: 'Número de pacientes com demanda espontânea', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Atendimentos por demanda espontânea.' },
        { id: 'psico_busca_ativa', name: 'Número de pacientes com demanda por busca ativa', sectorId: 'psicologia', unit: 'pacientes', target: 200, description: 'Atendimentos por busca ativa.' },
        { id: 'psico_familiares', name: 'Número de atendimentos a familiares/acompanhantes', sectorId: 'psicologia', unit: 'atendimentos', target: 50, description: 'Atendimentos a familiares e acompanhantes.' },
        { id: 'psico_ansiedade_provavel', name: 'Ansiedade provável', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com ansiedade provável.' },
        { id: 'psico_ansiedade_possivel', name: 'Ansiedade possível', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes com ansiedade possível.' },
        { id: 'psico_depressao_provavel', name: 'Depressão provável', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com depressão provável.' },
        { id: 'psico_depressao_possivel', name: 'Depressão possível', sectorId: 'psicologia', unit: 'pacientes', target: 20, description: 'Pacientes com depressão possível.' },
        { id: 'psico_outros_riscos', name: 'Outros riscos', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Pacientes com outros riscos psicológicos.' },
        { id: 'psico_encam_psiquiatria', name: 'Psiquiatria', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Encaminhamentos para psiquiatria.' },
        { id: 'psico_encam_rede', name: 'Rede', sectorId: 'psicologia', unit: 'pacientes', target: 5, description: 'Encaminhamentos para a rede.' },
        { id: 'psico_encam_tx', name: 'Avaliação para TX', sectorId: 'psicologia', unit: 'pacientes', target: 10, description: 'Encaminhamentos para avaliação de transplante.' },
        { id: 'taxa_atendimento_nutri', name: 'Taxa de Atendimento Nutricional', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes atendidos no mês pela equipe de Nutrição.' },
        { id: 'potassio_baixo', name: 'Potássio Sérico Baixo (< 3,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 5.0, description: 'Percentual de pacientes com nível de Potássio sérico baixo (< 3,5 mEq/L).' },
        { id: 'controle_potassio', name: 'Potássio Sérico Adequado (3,5 a 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Potássio sérico adequado (entre 3,5 e 5,5 mEq/L).' },
        { id: 'potassio_alto', name: 'Potássio Sérico Alto (> 5,5 mEq/L)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes com nível de Potássio sérico alto (> 5,5 mEq/L).' },
        { id: 'fosforo_baixo', name: 'Fósforo Sérico Baixo (< 3,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 10.0, description: 'Percentual de pacientes com nível de Fósforo sérico baixo (< 3,5 mg/dL).' },
        { id: 'controle_fosforo', name: 'Fósforo Sérico Adequado (3,5 a 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes com nível de Fósforo sérico adequado (entre 3,5 e 5,5 mg/dL).' },
        { id: 'fosforo_alto', name: 'Fósforo Sérico Alto (> 5,5 mg/dL)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de Fósforo sérico alto (> 5,5 mg/dL).' },
        { id: 'nutri_baixo_peso', name: 'Taxa de Pacientes com Baixo Peso (IMC < 18,5)', sectorId: 'nutricao', unit: '%', target: 20.0, description: 'Percentual de pacientes classificados com baixo peso (IMC < 18,5).' },
        { id: 'nutri_peso_adequado', name: 'Taxa de Pacientes com Peso Adequado (IMC 18,5 - 24,9)', sectorId: 'nutricao', unit: '%', target: 50.0, description: 'Percentual de pacientes classificados com peso adequado (IMC 18,5 a 24,9).' },
        { id: 'nutri_obesidade', name: 'Taxa de Pacientes com Obesidade (IMC ≥ 30)', sectorId: 'nutricao', unit: '%', target: 15.0, description: 'Percentual de pacientes classificados com obesidade (IMC ≥ 30).' },
        { id: 'controle_gpid', name: 'Controle de Peso Interdialítico (GPID)', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com ganho de peso interdialítico adequado (≤ 5% do peso seco).' },
        { id: 'controle_albumina', name: 'Adequação de Albumina Sérica', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com nível de Albumina sérica adequado (> 3.0 g/dL).' }
      ];
      defaults.forEach(ind => {
        batch.set(doc(db, 'indicators', ind.id), ind);
      });
      await batch.commit();
      return defaults;
    }

    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createIndicator = async (indicatorData) => {
    if (USE_MOCK) {
      return mockFirestore.createIndicator(indicatorData);
    }
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const id = indicatorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30) + '_' + Math.random().toString(36).substr(2, 5);
    await setDoc(doc(db, 'indicators', id), { id, ...indicatorData });
    return { id, ...indicatorData };
  };

export const updateIndicator = async (id, indicatorData) => {
    if (USE_MOCK) {
      return mockFirestore.updateIndicator(id, indicatorData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'indicators', id), indicatorData);
  };

export const deleteIndicator = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteIndicator(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'indicators', id));
  };

export const getIndicatorData = async (allowedSectors, isAll = false) => {
    if (USE_MOCK) {
      return mockFirestore.getIndicatorData(allowedSectors, isAll);
    }
    const { getFirestore, collection, getDocs, query, where, writeBatch, doc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const collectionRef = collection(db, 'indicator_data');
    
    if (!isAll && (!allowedSectors || allowedSectors.length === 0)) {
      return [];
    }

    let q;
    if (isAll) {
      q = query(collectionRef);
    } else {
      q = query(collectionRef, where('sectorId', 'in', allowedSectors));
    }
    
    const snap = await getDocs(q);
    
    // Seed default indicator data on first run if database has no data
    if (snap.empty && isAll) {
      const batch = writeBatch(db);
      const defaults = [
        // Enfermagem - Cateter
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.8, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.4, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.2, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.6, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Enfermagem - Reuso
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.2, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.8, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.3, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.1, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Médica - Mortalidade
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.2, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 5.1, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.8, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Médica - Internação
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 9.5, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 11.2, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 8.9, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Qualidade
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 78, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 82, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 84, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Cobertura
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Risco
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Psicologia - Encaminhamento
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Cobertura
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Baixo
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Adequado
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Potássio Alto
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Baixo
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Adequado
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Fósforo Alto
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Baixo Peso
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Peso Adequado
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Obesidade
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - GPID
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        // Nutrição - Albumina
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      defaults.forEach(d => {
        const docId = `${d.indicatorId}_${d.period}`;
        batch.set(doc(db, 'indicator_data', docId), d);
      });
      await batch.commit();
      return defaults;
    }
    
    return snap.docs.map(doc => doc.data());
  };

export const saveSingleIndicatorRecord = async (record, uploaderUid) => {
    if (USE_MOCK) {
      return mockFirestore.saveSingleIndicatorRecord(record, uploaderUid);
    }
    const { getFirestore, doc, setDoc, getDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const dataId = `${record.indicatorId}_${record.period}`;
    const dataRef = doc(db, 'indicator_data', dataId);
    
    const dataPoint = {
      indicatorId: record.indicatorId,
      sectorId: record.sectorId,
      value: parseFloat(record.value),
      period: record.period,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString()
    };
    await setDoc(dataRef, dataPoint);

    // Save history audit log
    const uploadId = 'upload_' + Math.random().toString(36).substr(2, 9);
    const indDoc = await getDoc(doc(db, 'indicators', record.indicatorId));
    const indName = indDoc.exists() ? indDoc.data().name : 'Indicador';

    await setDoc(doc(db, 'uploads_history', uploadId), {
      fileName: `Lançamento Manual: ${indName}`,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed: 1
    });

    return dataPoint;
  };

export const saveIndicatorDataBatch = async (records, fileName, uploaderUid) => {
    if (USE_MOCK) {
      return mockFirestore.saveIndicatorDataBatch(records, fileName, uploaderUid);
    }
    
    const { getFirestore, writeBatch, doc, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const batch = writeBatch(db);

    // Fetch existing sectors and indicators to map names to IDs
    const sectorsSnap = await getDocs(collection(db, 'sectors'));
    const sectorsList = sectorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    const indicatorsSnap = await getDocs(collection(db, 'indicators'));
    const indicatorsList = indicatorsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    let rowsProcessed = 0;

    for (const rec of records) {
      const sector = sectorsList.find(s => s.name.toLowerCase() === rec.sector.toLowerCase() || s.id === rec.sector.toLowerCase());
      if (!sector) continue;

      let indicator = indicatorsList.find(ind => ind.name.toLowerCase() === rec.indicatorName.toLowerCase() && ind.sectorId === sector.id);

      let indicatorId;
      if (!indicator) {
        // Auto create indicator in batch if not exists
        indicatorId = rec.indicatorName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
        const newIndicatorRef = doc(db, 'indicators', indicatorId);
        batch.set(newIndicatorRef, {
          id: indicatorId,
          name: rec.indicatorName,
          sectorId: sector.id,
          unit: rec.unit || '%',
          target: parseFloat(rec.target) || 0,
          description: 'Criado via importação de arquivo'
        });
      } else {
        indicatorId = indicator.id;
      }

      // Generate a document ID for the metric (e.g. indicatorId_period)
      const dataId = `${indicatorId}_${rec.period}`;
      const dataRef = doc(db, 'indicator_data', dataId);

      batch.set(dataRef, {
        indicatorId,
        sectorId: sector.id,
        value: parseFloat(rec.value),
        period: rec.period,
        uploadedBy: uploaderUid,
        uploadedAt: new Date().toISOString()
      });

      rowsProcessed++;
    }

    // Add upload to history
    const uploadId = 'upload_' + Math.random().toString(36).substr(2, 9);
    const uploadRef = doc(db, 'uploads_history', uploadId);
    const uploadRecord = {
      fileName,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed
    };
    batch.set(uploadRef, uploadRecord);

    await batch.commit();
    return { id: uploadId, ...uploadRecord };
  };

export const getRooms = async () => {
    if (USE_MOCK) {
      return mockFirestore.getRooms();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'rooms'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'room_1', name: 'Salão 1' },
        { id: 'room_2', name: 'Salão 2' },
        { id: 'room_3', name: 'Salão 3' }
      ];
      defaults.forEach(r => {
        batch.set(doc(db, 'rooms', r.id), r);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createRoom = async (roomData) => {
    if (USE_MOCK) {
      return mockFirestore.createRoom(roomData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'rooms'), roomData);
    return { id: docRef.id, ...roomData };
  };

export const updateRoom = async (id, roomData) => {
    if (USE_MOCK) {
      return mockFirestore.updateRoom(id, roomData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'rooms', id), roomData);
  };

export const deleteRoom = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteRoom(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'rooms', id));
  };

export const createSector = async (sectorData) => {
    if (USE_MOCK) {
      return mockFirestore.createSector(sectorData);
    }
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const id = sectorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20) + '_' + Math.random().toString(36).substr(2, 4);
    await setDoc(doc(db, 'sectors', id), { id, ...sectorData });
    return { id, ...sectorData };
  };

export const updateSector = async (id, sectorData) => {
    if (USE_MOCK) {
      return mockFirestore.updateSector(id, sectorData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'sectors', id), sectorData);
  };

export const deleteSector = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteSector(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'sectors', id));
  };

export const getAccessTypes = async () => {
    if (USE_MOCK) {
      return mockFirestore.getAccessTypes();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'access_types'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'access_1', name: 'Fístula Arteriovenosa' },
        { id: 'access_2', name: 'Cateter Duplo Lúmen' },
        { id: 'access_3', name: 'Prótese' }
      ];
      defaults.forEach(a => {
        batch.set(doc(db, 'access_types', a.id), a);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createAccessType = async (accessData) => {
    if (USE_MOCK) {
      return mockFirestore.createAccessType(accessData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'access_types'), accessData);
    return { id: docRef.id, ...accessData };
  };

export const updateAccessType = async (id, accessData) => {
    if (USE_MOCK) {
      return mockFirestore.updateAccessType(id, accessData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'access_types', id), accessData);
  };

export const deleteAccessType = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteAccessType(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'access_types', id));
  };

export const getDialysisFrequencies = async () => {
    if (USE_MOCK) {
      return mockFirestore.getDialysisFrequencies();
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'dialysis_frequencies'));
    if (snap.empty) {
      const { writeBatch, doc } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const defaults = [
        { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
        { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
        { id: 'freq_3', name: '2x por semana' },
        { id: 'freq_4', name: 'Diário' }
      ];
      defaults.forEach(d => {
        batch.set(doc(db, 'dialysis_frequencies', d.id), d);
      });
      await batch.commit();
      return defaults;
    }
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createDialysisFrequency = async (frequencyData) => {
    if (USE_MOCK) {
      return mockFirestore.createDialysisFrequency(frequencyData);
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'dialysis_frequencies'), frequencyData);
    return { id: docRef.id, ...frequencyData };
  };

export const updateDialysisFrequency = async (id, frequencyData) => {
    if (USE_MOCK) {
      return mockFirestore.updateDialysisFrequency(id, frequencyData);
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return updateDoc(doc(db, 'dialysis_frequencies', id), frequencyData);
  };

export const deleteDialysisFrequency = async (id) => {
    if (USE_MOCK) {
      return mockFirestore.deleteDialysisFrequency(id);
    }
    const { getFirestore, doc, deleteDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    return deleteDoc(doc(db, 'dialysis_frequencies', id));
  };

export const getAppointments = async () => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      return data ? JSON.parse(data) : [];
    }
    const { getFirestore, collection, getDocs } = await import('firebase/firestore');
    const db = getFirestore(app);
    const snap = await getDocs(collection(db, 'appointments'));
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  };

export const createAppointment = async (appointmentData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      const list = data ? JSON.parse(data) : [];
      const newApt = { id: 'apt_' + Math.random().toString(36).substr(2, 9), ...appointmentData, createdAt: new Date().toISOString() };
      list.push(newApt);
      localStorage.setItem('sistema_indicadores_appointments', JSON.stringify(list));
      return newApt;
    }
    const { getFirestore, collection, addDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    const docRef = await addDoc(collection(db, 'appointments'), {
      ...appointmentData,
      createdAt: new Date().toISOString()
    });
    return { id: docRef.id, ...appointmentData };
  };

export const updateAppointment = async (id, appointmentData) => {
    if (USE_MOCK) {
      const data = localStorage.getItem('sistema_indicadores_appointments');
      let list = data ? JSON.parse(data) : [];
      list = list.map(item => item.id === id ? { ...item, ...appointmentData, updatedAt: new Date().toISOString() } : item);
      localStorage.setItem('sistema_indicadores_appointments', JSON.stringify(list));
      return { id, ...appointmentData };
    }
    const { getFirestore, doc, updateDoc } = await import('firebase/firestore');
    const db = getFirestore(app);
    await updateDoc(doc(db, 'appointments', id), {
      ...appointmentData,
      updatedAt: new Date().toISOString()
    });
    return { id, ...appointmentData };
  };

