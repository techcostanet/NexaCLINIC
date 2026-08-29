// Mock Firebase Services using LocalStorage
// This allows the app to run immediately without a real Firebase configuration.

import initialSuppliers from './data/initialSuppliers.json';
import initialProducts from './data/initialProducts.json';
import syncedAssistEmails from './data/synced_assist_emails.json';
import allEnrichedPatients from './data/allEnrichedPatients.json';

const MOCK_STORAGE_KEY = 'sistema_indicadores_mock_db';

const getDefaultPatients = () => allEnrichedPatients;

// Helper to get/set mock database
const getDB = () => {
  const db = localStorage.getItem(MOCK_STORAGE_KEY);
  if (db) {
    const parsed = JSON.parse(db);
    let updated = false;

    // Migrate patients
    if (!parsed.patients || parsed.patients.length < 650 || !parsed.patients.some(p => p.scheduleSlots)) {
      parsed.patients = getDefaultPatients();
      updated = true;
    }

    // Migrate shifts
    if (!parsed.shifts) {
      parsed.shifts = [
        { id: 'shift_1', name: '1º Turno' },
        { id: 'shift_2', name: '2º Turno' },
        { id: 'shift_3', name: '3º Turno' }
      ];
      updated = true;
    }

    // Migrate rooms
    if (!parsed.rooms) {
      parsed.rooms = [
        { id: 'room_1', name: 'Salão 1' },
        { id: 'room_2', name: 'Salão 2' },
        { id: 'room_3', name: 'Salão 3' }
      ];
      updated = true;
    }

    // Migrate accessTypes
    if (!parsed.accessTypes) {
      parsed.accessTypes = [
        { id: 'access_1', name: 'Fístula Arteriovenosa' },
        { id: 'access_2', name: 'Cateter Duplo Lúmen' },
        { id: 'access_3', name: 'Prótese' }
      ];
      updated = true;
    }

    // Migrate dialysisFrequencies
    if (!parsed.dialysisFrequencies) {
      parsed.dialysisFrequencies = [
        { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
        { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
        { id: 'freq_3', name: '2x por semana' },
        { id: 'freq_4', name: 'Diário' }
      ];
      updated = true;
    }

    // Migrate users status and fields
    if (parsed.users) {
      let usersChanged = false;
      parsed.users = parsed.users.map(u => {
        if (!u.status) {
          u.status = 'active';
          usersChanged = true;
        }
        return u;
      });
      if (usersChanged) updated = true;
    }

    // Migrate psychology sector
    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'psicologia')) {
      parsed.sectors.push({
        id: 'psicologia',
        name: 'Psicologia',
        description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.'
      });
      updated = true;
    }

    // Migrate nutrition sector
    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'nutricao')) {
      parsed.sectors.push({
        id: 'nutricao',
        name: 'Nutrição',
        description: 'Métricas de cobertura de atendimento nutritional, adequação metabólica e controle de peso.'
      });
      updated = true;
    }

    // Migrate psychology indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.sectorId === 'psicologia')) {
      parsed.indicators.push(
        { id: 'taxa_atendimento_psico', name: 'Taxa de Atendimento Psicológico', sectorId: 'psicologia', unit: '%', target: 40.0, description: 'Percentual de pacientes atendidos no mês sobre o total em diálise (DP + HD).' },
        { id: 'taxa_risco_psico', name: 'Taxa de Risco Psicológico', sectorId: 'psicologia', unit: '%', target: 25.0, description: 'Percentual de pacientes identificados com ansiedade, depressão ou risco emocional.' },
        { id: 'taxa_encaminhamento_rede', name: 'Taxa de Encaminhamento à Rede', sectorId: 'psicologia', unit: '%', target: 5.0, description: 'Percentual de encaminhamentos para acompanhamento externo ou avaliação de transplante.' }
      );
      updated = true;
    }

    // Migrate nutrition indicators (clean up and structure adjacent indicators)
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'nutri_baixo_peso')) {
      parsed.indicators = parsed.indicators.filter(i => i.sectorId !== 'nutricao');
      parsed.indicators.push(
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
      );
      updated = true;
    }

    // Migrate clinical quality indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'qualidade_ktv')) {
      parsed.indicators.push(
        { id: 'qualidade_ktv', name: 'Adequação de Hemodiálise (Kt/V > 1,2)', sectorId: 'qualidade', unit: '%', target: 70.0, description: 'Percentual de pacientes com Kt/V maior que 1,2.' },
        { id: 'qualidade_hb_normal', name: 'Pacientes sem Anemia (HB >= 10)', sectorId: 'qualidade', unit: '%', target: 50.0, description: 'Percentual de pacientes com Hemoglobina maior ou igual a 10 g/dL.' },
        { id: 'qualidade_hb_grave', name: 'Pacientes com Anemia Grave (HB <= 7)', sectorId: 'qualidade', unit: '%', target: 5.0, description: 'Percentual de pacientes com Hemoglobina menor ou igual a 7 g/dL.' },
        { id: 'qualidade_pth', name: 'Paratormônio Elevado (PTH > 600 pg/ml)', sectorId: 'qualidade', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de PTH maior que 600 pg/ml.' }
      );
      
      const qualData = [
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 71.48, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 74.91, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 76.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 69.64, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 62.41, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 62.90, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 54.90, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.10, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 61.50, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.40, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 3.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.62, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 4.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.74, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'qualidade_pth', sectorId: 'qualidade', value: 63.93, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...qualData];
      updated = true;
    }

    // Migrate psychology indicator data
    if (parsed.indicator_data && !parsed.indicator_data.some(d => d.indicatorId === 'taxa_atendimento_psico')) {
      const psicoData = [
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...psicoData];
      updated = true;
    }

    // Migrate/add nutrition indicator data (including IMC classification sub-indicators)
    if (parsed.indicator_data && !parsed.indicator_data.some(d => d.indicatorId === 'nutri_baixo_peso')) {
      // Filter out any simple old nutrition entries first to avoid duplicates
      parsed.indicator_data = parsed.indicator_data.filter(d => 
        d.indicatorId !== 'taxa_atendimento_nutri' && 
        d.indicatorId !== 'controle_potassio' && 
        d.indicatorId !== 'controle_fosforo' && 
        d.indicatorId !== 'potassio_baixo' &&
        d.indicatorId !== 'potassio_alto' &&
        d.indicatorId !== 'fosforo_baixo' &&
        d.indicatorId !== 'fosforo_alto' &&
        d.indicatorId !== 'controle_gpid' && 
        d.indicatorId !== 'controle_albumina'
      );

      const nutriData = [
        // Cobertura Atendimento Nutricional
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Baixo (< 3,5)
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Adequado
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Potássio Alto (> 5,5)
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Baixo (< 3,5)
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Adequado
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Fósforo Alto (> 5,5)
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Baixo Peso
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Peso Adequado
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Obesidade
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Ganho de Peso Interdialítico (GPID)
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        // Albumina Sérica
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...parsed.indicator_data, ...nutriData];
      updated = true;
    }

    // Migrate users: remove fictitious @clinica.com users and ensure real users exist
    if (parsed.users) {
      const initialCount = parsed.users.length;
      parsed.users = parsed.users.filter(u => !u.email || !u.email.toLowerCase().endsWith('@clinica.com'));
      if (parsed.users.length !== initialCount) updated = true;

      const realUsersDef = [
        {
          uid: 'techcosta-admin-uid',
          email: 'contato@techcosta.net',
          name: 'Administrador TechCosta',
          role: 'admin',
          allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
          status: 'active'
        },
        {
          uid: 'anacg-uid',
          email: 'anacg@nexa.com',
          name: 'Ana Carolina Cerqueira Gonzaga',
          role: 'rh',
          allowedSectors: ['rh'],
          status: 'active'
        },
        {
          uid: 'jsoares-uid',
          email: 'jsoares@nexa.com',
          name: 'J. Soares',
          role: 'rh',
          allowedSectors: ['rh'],
          status: 'active'
        }
      ];

      realUsersDef.forEach(ru => {
        const existing = parsed.users.find(u => u.email && u.email.toLowerCase() === ru.email.toLowerCase());
        if (!existing) {
          parsed.users.push({ ...ru, createdAt: new Date().toISOString() });
          updated = true;
        } else {
          let uChanged = false;
          if (existing.status !== 'active') { existing.status = 'active'; uChanged = true; }
          if (existing.role !== ru.role) { existing.role = ru.role; uChanged = true; }
          if (!existing.allowedSectors || existing.allowedSectors.length === 0) {
            existing.allowedSectors = ru.allowedSectors;
            uChanged = true;
          }
          if (uChanged) updated = true;
        }
      });
    }

    // Migrate clinical mortality indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'mortalidade_hd')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'mortalidade_hd' && 
        i.id !== 'mortalidade_dp' && 
        i.id !== 'mortalidade_geral' &&
        i.id !== 'obitos_relacionados_hddp' &&
        i.id !== 'total_pacientes_hd' &&
        i.id !== 'total_pacientes_dp' &&
        i.id !== 'obitos_prevalentes_hd' &&
        i.id !== 'obitos_prevalentes_dp'
      );
      parsed.indicators.push(
        { id: 'mortalidade_hd', name: 'Taxa de Mortalidade Pacientes HD', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em hemodiálise (HD) sobre o total de pacientes atendidos em HD' },
        { id: 'mortalidade_dp', name: 'Taxa de Mortalidade Pacientes DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em diálise peritoneal (DP) sobre o total de pacientes atendidos em DP' },
        { id: 'mortalidade_geral', name: 'Taxa de Mortalidade Geral', sectorId: 'medica', unit: '%', target: 1.0, description: 'Fórmula: Número de óbitos em HD ou DP / Número total de pacientes atendidos HD ou DP * 100' },
        { id: 'obitos_relacionados_hddp', name: 'Óbitos relacionados a HD/DP', sectorId: 'medica', unit: 'óbitos', target: 2.0, description: 'Número de óbitos diretamente relacionados ao tratamento dialítico' },
        { id: 'total_pacientes_hd', name: 'Total de pacientes atendidos em HD', sectorId: 'medica', unit: 'pacientes', target: 550.0, description: 'Total de pacientes sob tratamento de hemodiálise no mês' },
        { id: 'total_pacientes_dp', name: 'Total de pacientes atendidos em DP', sectorId: 'medica', unit: 'pacientes', target: 75.0, description: 'Total de pacientes sob tratamento de diálise peritoneal no mês' },
        { id: 'obitos_prevalentes_hd', name: 'Óbitos Prevalentes e incidentes em HD', sectorId: 'medica', unit: 'óbitos', target: 5.0, description: 'Total de óbitos acumulados no mês de pacientes de hemodiálise' },
        { id: 'obitos_prevalentes_dp', name: 'Óbitos Prevalentes e incidentes em DP', sectorId: 'medica', unit: 'óbitos', target: 1.0, description: 'Total de óbitos acumulados no mês de pacientes de diálise peritoneal' }
      );

      // Seed data
      const mortData = [
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.10, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.83, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.46, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 2.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 2.63, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 4.17, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.96, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.78, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.95, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 3, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 547, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 546, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 548, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 549, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 75, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 73, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 79, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 76, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 77, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 72, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 10, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 8, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 1, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 2, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 3, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...(parsed.indicator_data || []), ...mortData];
      updated = true;
    }

    // Migrate clinical hospitalization indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_hospitalizacao_geral')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_internacoes_hosp' && 
        i.id !== 'taxa_hospitalizacao_geral' && 
        i.id !== 'taxa_hospitalizacao_intercorrência_dialitica' && 
        i.id !== 'taxa_internacoes_dp' && 
        i.id !== 'taxa_internacoes_hd' && 
        i.id !== 'taxa_internacao_intercorrencia_dp' && 
        i.id !== 'taxa_internacoes_intercorrencia_hd'
      );
      parsed.indicators.push(
        { id: 'total_internacoes_hosp', name: 'Total de internações Hospitalares', sectorId: 'medica', unit: 'internações', target: 25.0, description: 'Soma total de internações ocorridas no mês de pacientes de HD e DP' },
        { id: 'taxa_hospitalizacao_geral', name: 'Taxa Hospitalização Geral', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual geral de pacientes que necessitaram de hospitalização' },
        { id: 'taxa_hospitalizacao_intercorrência_dialitica', name: 'Taxa hospitalização por Intercorrência Dialitica (DP +HD)', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações causadas por intercorrência relacionada à diálise' },
        { id: 'taxa_internacoes_dp', name: 'Taxa de internações DP', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em diálise peritoneal' },
        { id: 'taxa_internacoes_hd', name: 'Taxa de internações HD', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em hemodiálise' },
        { id: 'taxa_internacao_intercorrencia_dp', name: 'Taxa de internação por intercorrencia DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de internações por intercorrência de diálise peritoneal' },
        { id: 'taxa_internacoes_intercorrencia_hd', name: 'Taxa de internações intercorrência HD', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações por intercorrência de hemodiálise' }
      );

      // Seed data
      const hospData = [
        // total_internacoes_hosp
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 33, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 18, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 30, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 31, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hospitalizacao_geral
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 5.31, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 2.91, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.29, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.31, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.80, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.99, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hospitalizacao_intercorrência_dialitica
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.41, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.94, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.91, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.40, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.24, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.93, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_dp
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 6.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.06, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.32, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.56, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_hd
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 5.12, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 3.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.74, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.92, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacao_intercorrencia_dp
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.60, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_internacoes_intercorrencia_hd
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.38, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.01, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...hospData];
      updated = true;
    }

    // Migrate clinical vascular access indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_uso_cdl_fim_mes')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'taxa_uso_cdl_fim_mes' && 
        i.id !== 'taxa_uso_permcath' && 
        i.id !== 'taxa_uso_ptfe' && 
        i.id !== 'taxa_uso_cateter_longo_prazo' && 
        i.id !== 'taxa_pacientes_fav' && 
        i.id !== 'perdas_fav'
      );
      parsed.indicators.push(
        { id: 'taxa_uso_cdl_fim_mes', name: 'Taxa de Uso de CDL (Fim do Mês)', sectorId: 'enfermagem', unit: '%', target: 7.0, description: 'Percentual de pacientes utilizando Cateter Duplo Lúmen temporário no final do mês' },
        { id: 'taxa_uso_permcath', name: 'Taxa de Utilização de Permcath', sectorId: 'enfermagem', unit: '%', target: 23.0, description: 'Percentual de pacientes utilizando Cateter de longa permanência (Permcath)' },
        { id: 'taxa_uso_ptfe', name: 'Taxa de Utilização de PTFE (Prótese)', sectorId: 'enfermagem', unit: '%', target: 4.0, description: 'Percentual de pacientes utilizando prótese vascular (PTFE) como acesso' },
        { id: 'taxa_uso_cateter_longo_prazo', name: 'Taxa de Utilização de Cateter > 3 Meses', sectorId: 'enfermagem', unit: '%', target: 10.0, description: 'Percentual de pacientes utilizando cateter temporário por mais de 3 meses' },
        { id: 'taxa_pacientes_fav', name: 'Taxa de Pacientes com FAV (Fístula)', sectorId: 'enfermagem', unit: '%', target: 66.0, description: 'Percentual de pacientes com Fístula Arteriovenosa (acesso definitivo padrão-ouro)' },
        { id: 'perdas_fav', name: 'Número de Perdas de FAV (Acesso Definitivo)', sectorId: 'enfermagem', unit: 'perdas', target: 2.0, description: 'Número total de fístulas arteriovenosas que foram perdidas/inviabilizadas no mês' }
      );

      // Seed data
      const vascularData = [
        // taxa_uso_cdl_fim_mes
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.14, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 8.97, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 11.13, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.93, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_permcath
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 26.33, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 27.47, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.82, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 24.64, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 21.68, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_ptfe
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.10, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_uso_cateter_longo_prazo
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.93, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.56, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.09, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.64, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.01, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.19, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_pacientes_fav
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 63.60, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 65.10, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.00, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.40, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 66.10, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // perdas_fav
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 0, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 6, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 3, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...vascularData];
      updated = true;
    }

    // Migrate clinical FAV confection indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'total_fav_confeccionadas')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_fav_confeccionadas' && 
        i.id !== 'taxa_fav_simples' && 
        i.id !== 'taxa_fav_bloqueio' && 
        i.id !== 'taxa_fav_basilica' && 
        i.id !== 'taxa_fav_maturacao' && 
        i.id !== 'taxa_falencia_primaria'
      );
      parsed.indicators.push(
        { id: 'total_fav_confeccionadas', name: 'Total de FAV Confeccionadas', sectorId: 'enfermagem', unit: 'FAVs', target: 18.0, description: 'Total de fístulas arteriovenosas confeccionadas cirurgicamente no período' },
        { id: 'taxa_fav_simples', name: 'Taxa de FAV Simples (Confecção)', sectorId: 'enfermagem', unit: '%', target: 15.0, description: 'Percentual de confecções de fístula arteriovenosa simples (nativa)' },
        { id: 'taxa_fav_bloqueio', name: 'Taxa de FAV Simples com Bloqueio (Confecção)', sectorId: 'enfermagem', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa simples com bloqueio de plexo' },
        { id: 'taxa_fav_basilica', name: 'Taxa de FAV Basílica (Confecção)', sectorId: 'enfermagem', unit: '%', target: 31.0, description: 'Percentual de confecções de fístula arteriovenosa utilizando a veia basílica' },
        { id: 'taxa_fav_maturacao', name: 'Taxa de FAV em Maturação', sectorId: 'enfermagem', unit: '%', target: 106.0, description: 'Percentual de fístulas em processo de maturação em relação às confeccionadas' },
        { id: 'taxa_falencia_primaria', name: 'Taxa de Falência Primária de FAV', sectorId: 'enfermagem', unit: '%', target: 17.0, description: 'Percentual de fístulas arteriovenosas que apresentaram falência antes da primeira punção' }
      );

      // Seed data
      const favConfData = [
        // total_fav_confeccionadas
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 8, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 16, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 19, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 29, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_simples
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 10.53, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 0.00, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_bloqueio
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 50.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 68.42, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.56, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.17, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_basilica
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 50.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 22.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 37.93, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_fav_maturacao
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 87.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 81.25, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 78.95, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 122.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 162.07, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

        // taxa_falencia_primaria
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 12.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 18.75, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 13.79, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...favConfData];
      updated = true;
    }

    // Migrate surgeon performance indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_fav_moises')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'taxa_fav_moises' && 
        i.id !== 'falencia_fav_moises' && 
        i.id !== 'taxa_fav_alexandre' && 
        i.id !== 'falencia_fav_alexandre' && 
        i.id !== 'taxa_fav_euler_ricardo' && 
        i.id !== 'falencia_fav_euler_ricardo'
      );
      parsed.indicators.push(
        { id: 'taxa_fav_moises', name: 'Dr. Moisés: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 47.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Moisés' },
        { id: 'falencia_fav_moises', name: 'Dr. Moisés: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 22.0, description: 'Percentual de fístulas realizadas pelo Dr. Moisés que falharam antes da maturação' },
        { id: 'taxa_fav_alexandre', name: 'Dr. Alexandre: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Alexandre' },
        { id: 'falencia_fav_alexandre', name: 'Dr. Alexandre: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 12.0, description: 'Percentual de fístulas realizadas pelo Dr. Alexandre que falharam antes da maturação' },
        { id: 'taxa_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 13.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelos Dr. Euler/Ricardo' },
        { id: 'falencia_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de fístulas realizadas pelos Dr. Euler/Ricardo que falharam antes da maturação' }
      );

      // Seed data
      const surgeonData = [
        // Dr. Moisés: Confecção
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 62.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 43.75, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 57.89, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 27.78, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 41.38, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Moisés: Falência Primária
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 28.57, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 18.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 25.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Alexandre: Confecção
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 37.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 56.25, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 42.11, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 72.22, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 44.83, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Alexandre: Falência Primária
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 11.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 25.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 15.38, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 7.69, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Euler/Ricardo: Confecção
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 13.79, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // Dr. Euler/Ricardo: Falência Primária
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...surgeonData];
      updated = true;
    }

    // Migrate hemotransfusion indicators
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_hemotransfusao')) {
      parsed.indicators = parsed.indicators.filter(i => 
        i.id !== 'total_pacientes_hddp' && 
        i.id !== 'pacientes_hemotransfundidos_bruto' && 
        i.id !== 'total_bolsas_infundidas' && 
        i.id !== 'total_reacoes_transfusionais' && 
        i.id !== 'taxa_hemotransfusao' && 
        i.id !== 'taxa_pacientes_hemotransfundidos' && 
        i.id !== 'taxa_reacao_transfusional'
      );
      parsed.indicators.push(
        { id: 'total_pacientes_hddp', name: 'Total de Pacientes HD e DP', sectorId: 'medica', unit: 'pacientes', target: 624.0, description: 'Total bruto de pacientes ativos em hemodiálise e diálise peritoneal no período' },
        { id: 'pacientes_hemotransfundidos_bruto', name: 'Pacientes Hemotransfundidos (Bruto)', sectorId: 'medica', unit: 'pacientes', target: 11.0, description: 'Número total de pacientes que necessitaram de transfusão de sangue no mês' },
        { id: 'total_bolsas_infundidas', name: 'Total de Bolsas Infundidas (Hemotransfusões)', sectorId: 'medica', unit: 'bolsas', target: 16.0, description: 'Número de bolsas de concentrado de hemácias ou outros hemocomponentes transfundidos' },
        { id: 'total_reacoes_transfusionais', name: 'Total de Reações Transfusionais', sectorId: 'medica', unit: 'reações', target: 0.0, description: 'Número total de reações adversas transfusionais notificadas no período' },
        { id: 'taxa_hemotransfusao', name: 'Taxa de Hemotransfusão', sectorId: 'medica', unit: '%', target: 3.0, description: 'Fórmula: Total de hemotransfusões / Total de pacientes HD e DP * 100' },
        { id: 'taxa_pacientes_hemotransfundidos', name: 'Taxa de Pacientes Hemotransfundidos', sectorId: 'medica', unit: '%', target: 2.0, description: 'Fórmula: Total de pacientes hemotransfundidos / Total de pacientes HD e DP * 100' },
        { id: 'taxa_reacao_transfusional', name: 'Taxa de Reação Transfusional', sectorId: 'medica', unit: '%', target: 0.0, description: 'Fórmula: Total de reações transfusionais / Total de bolsas infundidas * 100' }
      );

      // Seed data
      const transfusionData = [
        // total_pacientes_hddp
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 619, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 629, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 626, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 625, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // pacientes_hemotransfundidos_bruto
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 8, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 7, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 13, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // total_bolsas_infundidas
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 15, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 19, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 17, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 14, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // total_reacoes_transfusionais
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_hemotransfusao
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.58, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.42, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.54, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 3.04, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.72, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_pacientes_hemotransfundidos
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.29, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.13, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 2.07, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.77, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

        // taxa_reacao_transfusional
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
      ];

      parsed.indicator_data = [...(parsed.indicator_data || []), ...transfusionData];
      updated = true;
    }

    if (!parsed.accounts_payable) {
      parsed.accounts_payable = [
        { id: 'pay-1', supplier: 'Baxter Hospitalar Ltda', cnpj: '12.345.678/0001-90', description: 'Compra de Dialisadores HF80', amount: 10200.00, dueDate: '2026-07-25', status: 'Pendente', category: 'Insumo Clínico', invoiceNumber: '9931', paymentDate: '' },
        { id: 'pay-2', supplier: 'Fresenius Medical Care', cnpj: '98.765.432/0001-21', description: 'Concentrado Ácido de Hemodiálise', amount: 2475.00, dueDate: '2026-07-20', status: 'Pago', category: 'Concentrado', invoiceNumber: '10432', paymentDate: '2026-07-15' },
        { id: 'pay-3', supplier: 'Distribuidora Farmamed', cnpj: '33.221.109/0001-44', description: 'Medicamentos Epoetina', amount: 3600.00, dueDate: '2026-08-05', status: 'Pendente', category: 'Medicamento', invoiceNumber: '2844', paymentDate: '' },
        { id: 'pay-4', supplier: 'Companhia de Água e Saneamento', cnpj: '11.222.333/0001-00', description: 'Consumo de água - Osmose Reversa', amount: 4800.00, dueDate: '2026-07-30', status: 'Pendente', category: 'Serviço/Utilidades', invoiceNumber: '0726', paymentDate: '' },
        { id: 'pay-5', supplier: 'Concessionária de Energia S.A.', cnpj: '44.555.666/0001-11', description: 'Energia Elétrica', amount: 8900.00, dueDate: '2026-07-28', status: 'Pago', category: 'Serviço/Utilidades', invoiceNumber: '1126', paymentDate: '2026-07-16' }
      ];
      updated = true;
    }
    if (!parsed.accounts_receivable) {
      parsed.accounts_receivable = [
        { id: 'rec-1', client: 'Sistema Único de Saúde (SUS) - APAC', category: 'SUS', description: 'Repasse APAC Hemodiálise Jun/2026', amount: 485000.00, dueDate: '2026-07-30', status: 'Pendente', invoiceNumber: 'APAC-2026-06', receivedDate: '' },
        { id: 'rec-2', client: 'Unimed BH', category: 'Convênio', description: 'Mensalidade Hemodiálise Convênio Jun/2026', amount: 72000.00, dueDate: '2026-07-22', status: 'Pago', invoiceNumber: 'UNIMED-993', receivedDate: '2026-07-20' },
        { id: 'rec-3', client: 'Bradesco Saúde', category: 'Convênio', description: 'Procedimentos de nefrologia', amount: 28400.00, dueDate: '2026-07-24', status: 'Pendente', invoiceNumber: 'BRAD-402', receivedDate: '' },
        { id: 'rec-4', client: 'Amil Assistência', category: 'Convênio', description: 'Sessões de diálise peritoneal APD', amount: 19800.00, dueDate: '2026-07-27', status: 'Pago', invoiceNumber: 'AMIL-112', receivedDate: '2026-07-16' }
      ];
      updated = true;
    }
    if (!parsed.xml_imports) {
      parsed.xml_imports = [
        { id: 'xml-1', filename: 'NFe-31260712345678000190550010000099311002345678.xml', supplier: 'Baxter Hospitalar Ltda', invoiceNumber: '9931', amount: 10200.00, importDate: '2026-07-15T10:30:00.000Z', status: 'Conciliado' }
      ];
      updated = true;
    }

    if (parsed.sectors && !parsed.sectors.some(s => s.id === 'rh')) {
      parsed.sectors.push({
        id: 'rh',
        name: 'Recursos Humanos',
        description: 'Indicadores de rotatividade (turnover), absenteísmo e performance de colaboradores'
      });
      updated = true;
    }
    if (parsed.indicators && !parsed.indicators.some(i => i.id === 'taxa_turnover')) {
      parsed.indicators.push(
        { id: 'taxa_turnover', name: 'Taxa de Turnover (Rotatividade)', sectorId: 'rh', unit: '%', target: 2.0, description: 'Percentual de rotatividade de funcionários no período. Fórmulas: ((Admissões + Desligamentos) / 2) / Média de Funcionários Ativos * 100' },
        { id: 'taxa_absenteismo', name: 'Taxa de Absenteísmo', sectorId: 'rh', unit: '%', target: 3.0, description: 'Percentual de horas/dias de faltas e atrasos não justificados em relação à jornada total contratual' }
      );
      
      const rhData = [
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.80, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.20, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 1.20, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_turnover', sectorId: 'rh', value: 2.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.80, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 3.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.90, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 2.20, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
        { indicatorId: 'taxa_absenteismo', sectorId: 'rh', value: 3.40, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() }
      ];
      parsed.indicator_data = [...(parsed.indicator_data || []), ...rhData];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-08')) {
      const defaultAugustData = [
        { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 131.25, highlightType: null },
        { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 176.25, currentBalance: 56.25, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 393.75, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'ANA CAROLINA LOPES SOUSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 80.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 80.80, highlightType: 'orange' },
        { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 354.90, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 354.90, highlightType: 'orange' },
        { employeeName: 'BRENO PORTES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
        { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 143.75, highlightType: null },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 884.00, highlightType: 'orange' },
        { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
        { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 137.50, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 68.75, highlightType: null },
        { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'DEISE GRAZIELE CARDOSO PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
        { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
        { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 176.25, currentBalance: 56.25, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
        { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 43.75, highlightType: null },
        { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 343.85, currentBalance: 223.85, rechargeNeeded: 101.15, highlightType: null },
        { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: -81.25, highlightType: 'yellow' },
        { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 68.75, highlightType: null },
        { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
        { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 62.50, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 445.00, currentBalance: 325.00, rechargeNeeded: 60.00, highlightType: null },
        { employeeName: 'JOSE DOS SANTOS VIEIRA DO CARMO', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 475.10, currentBalance: 355.10, rechargeNeeded: 294.90, highlightType: null },
        { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 262.50, highlightType: null },
        { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.55, currentBalance: 137.55, rechargeNeeded: 187.45, highlightType: null },
        { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
        { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 106.25, highlightType: null },
        { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 0.00, voltaCost: 6.25, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 56.25, highlightType: null },
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 540.00, currentBalance: 420.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 907.40, highlightType: 'orange' },
        { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 268.75, highlightType: 'red' },
        { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 445.00, currentBalance: 325.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 420.00, currentBalance: 300.00, rechargeNeeded: 25.00, highlightType: null },
        { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
        { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 86.20, currentBalance: -33.80, rechargeNeeded: 233.80, highlightType: 'red' },
        { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
        { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 288.75, currentBalance: 168.75, rechargeNeeded: 156.25, highlightType: null },
        { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
        { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 382.50, highlightType: 'red' },
        { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 68.75, highlightType: null },
        { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 376.25, currentBalance: 256.25, rechargeNeeded: 10.00, highlightType: null },
        { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
        { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 468.00, currentBalance: 0.00, rechargeNeeded: 108.00, highlightType: 'orange' },
        { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
        { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 388.75, currentBalance: 268.75, rechargeNeeded: 56.25, highlightType: null },
        { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 138.75, currentBalance: 18.75, rechargeNeeded: 181.25, highlightType: null },
        { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 56.25, highlightType: null },
        { employeeName: 'VITORIA MARIA BALDAIA OLIVEIRA COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 182.50, currentBalance: 62.50, rechargeNeeded: 200.00, highlightType: null },
        { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 262.50, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 50.00, highlightType: null }
      ];

      if (!parsed.employees) parsed.employees = [];

      const augustVouchers = defaultAugustData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtaug-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-aug-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 21 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(100000 + idx),
          period: '2026-08',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-08'),
        ...augustVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-06')) {
      const defaultJuneData = [
        { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 268.75, highlightType: null },
        { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
        { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 331.25, highlightType: null },
        { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
        { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
        { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
        { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 187.50, highlightType: 'red' },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 888.80, highlightType: 'orange' },
        { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 371.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 371.80, highlightType: 'orange' },
        { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
        { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 101.25, currentBalance: -18.75, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'CAROLINA CATIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 884.00, highlightType: 'orange' },
        { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 101.25, currentBalance: -18.75, rechargeNeeded: 325.00, highlightType: 'red' },
        { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 88.75, currentBalance: -31.25, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 250.00, highlightType: null },
        { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 68.75, highlightType: null },
        { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 388.75, currentBalance: 268.75, rechargeNeeded: 56.25, highlightType: null },
        { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 288.75, currentBalance: 168.75, rechargeNeeded: 156.25, highlightType: null },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 187.50, highlightType: 'red' },
        { employeeName: 'ELIANE DE PAULA FERREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 38.75, currentBalance: -81.25, rechargeNeeded: 187.50, highlightType: 'red' },
        { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 256.25, highlightType: null },
        { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 314.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 314.00, highlightType: 'orange' },
        { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
        { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 401.25, currentBalance: 281.25, rechargeNeeded: 43.75, highlightType: null },
        { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 134.70, currentBalance: 14.70, rechargeNeeded: 260.30, highlightType: null },
        { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 496.35, currentBalance: 376.35, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 395.00, currentBalance: 275.00, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 200.00, highlightType: null },
        { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 156.25, highlightType: null },
        { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 35.00, highlightType: null },
        { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
        { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 68.75, highlightType: null },
        { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 301.25, currentBalance: 181.25, rechargeNeeded: 143.75, highlightType: null },
        { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 1099.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 1099.80, highlightType: 'orange' },
        { employeeName: 'JOSE DOS SANTOS VIEIRA DO CARMO', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 106.25, currentBalance: -13.75, rechargeNeeded: 663.75, highlightType: 'red' },
        { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 193.75, highlightType: 'red' },
        { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 433.40, currentBalance: 313.40, rechargeNeeded: 11.60, highlightType: null },
        { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
        { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 312.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 312.00, highlightType: 'orange' },
        { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.30, currentBalance: 97.30, rechargeNeeded: 227.70, highlightType: null },
        { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 212.50, highlightType: null },
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 652.50, currentBalance: 532.50, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 258.05, currentBalance: 138.05, rechargeNeeded: 186.95, highlightType: null },
        { employeeName: 'MARGARETH MARIA TEIXEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 46.75, currentBalance: -73.25, rechargeNeeded: 398.25, highlightType: 'red' },
        { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 907.40, highlightType: 'orange' },
        { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 262.50, highlightType: null },
        { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 345.00, currentBalance: 225.00, rechargeNeeded: 100.00, highlightType: null },
        { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 332.50, currentBalance: 212.50, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 281.25, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 156.25, highlightType: null },
        { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 345.00, currentBalance: 225.00, rechargeNeeded: 100.00, highlightType: null },
        { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 288.60, currentBalance: 168.60, rechargeNeeded: 18.90, highlightType: null },
        { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 262.50, balancePrevious: 342.60, currentBalance: 222.60, rechargeNeeded: 39.90, highlightType: null },
        { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
        { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 287.50, highlightType: null },
        { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 331.25, highlightType: 'red' },
        { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 888.80, highlightType: 'orange' },
        { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
        { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 212.50, highlightType: 'red' },
        { employeeName: 'ROSILENE MENDES DE BRITO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
        { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 187.50, highlightType: 'red' },
        { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 70.00, currentBalance: -50.00, rechargeNeeded: 325.00, highlightType: 'red' },
        { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 540.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 540.00, highlightType: 'orange' },
        { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
        { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 95.00, currentBalance: -25.00, rechargeNeeded: 187.50, highlightType: 'red' },
        { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 307.50, currentBalance: 187.50, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 145.00, currentBalance: 0.00, rechargeNeeded: 145.00, highlightType: null },
        { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 150.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null }
      ];

      const juneVouchers = defaultJuneData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtjun-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-jun-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 15 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(200000 + idx),
          period: '2026-06',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-06'),
        ...juneVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-05')) {
      const defaultMayData = [
        { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 181.25, highlightType: null },
        { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 375.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 156.25, highlightType: null },
        { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 382.50, currentBalance: 262.50, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'CAMILA GABRIELE SANTOS SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 381.25, highlightType: 'red' },
        { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'CAROLINA CATIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 93.75, highlightType: null },
        { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 312.50, highlightType: null },
        { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 287.50, highlightType: null },
        { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 93.75, highlightType: null },
        { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 275.00, highlightType: null },
        { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 313.75, currentBalance: 193.75, rechargeNeeded: 131.25, highlightType: null },
        { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
        { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 55.45, currentBalance: -64.55, rechargeNeeded: 264.55, highlightType: 'red' },
        { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
        { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 190.26, currentBalance: 70.26, rechargeNeeded: 254.74, highlightType: null },
        { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 138.75, currentBalance: 18.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'GEOVANA GOMES RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 377.65, currentBalance: 257.65, rechargeNeeded: 67.35, highlightType: null },
        { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 93.75, highlightType: null },
        { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 112.45, currentBalance: -7.55, rechargeNeeded: 332.55, highlightType: 'red' },
        { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 358.75, currentBalance: 238.75, rechargeNeeded: 86.25, highlightType: null },
        { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 162.50, highlightType: null },
        { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
        { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 193.75, highlightType: null },
        { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 207.90, currentBalance: 87.90, rechargeNeeded: 112.10, highlightType: null },
        { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 251.25, currentBalance: 131.25, rechargeNeeded: 193.75, highlightType: null },
        { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 253.75, currentBalance: 133.75, rechargeNeeded: 66.25, highlightType: null },
        { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 310.00, currentBalance: 190.00, rechargeNeeded: 135.00, highlightType: null },
        { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 157.50, currentBalance: 37.50, rechargeNeeded: 212.50, highlightType: null },
        { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 433.40, currentBalance: 313.40, rechargeNeeded: 11.60, highlightType: null },
        { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ESPIRITO SANTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 219.15, currentBalance: 99.15, rechargeNeeded: 225.85, highlightType: null },
        { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 270.55, currentBalance: 150.55, rechargeNeeded: 174.45, highlightType: null },
        { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 76.25, currentBalance: -43.75, rechargeNeeded: 243.75, highlightType: 'red' },
        { employeeName: 'MARIA DE FÁTIMA CARVALHO DE SOUSA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 162.50, highlightType: null },
        { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 316.25, currentBalance: 196.25, rechargeNeeded: 128.75, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 292.95, currentBalance: 172.95, rechargeNeeded: 152.05, highlightType: null },
        { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 137.50, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 293.75, highlightType: null },
        { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 288.60, currentBalance: 168.60, rechargeNeeded: 31.40, highlightType: null },
        { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 275.00, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 247.60, highlightType: null },
        { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 312.50, highlightType: null },
        { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'PAMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 185.60, currentBalance: 65.60, rechargeNeeded: 259.40, highlightType: null },
        { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 191.35, currentBalance: 71.35, rechargeNeeded: 178.65, highlightType: null },
        { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 106.25, highlightType: null },
        { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 292.15, currentBalance: 172.15, rechargeNeeded: 152.85, highlightType: null },
        { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 126.25, currentBalance: 6.25, rechargeNeeded: 193.75, highlightType: null },
        { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 93.75, highlightType: null },
        { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 63.75, currentBalance: -56.25, rechargeNeeded: 256.25, highlightType: 'red' },
        { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
        { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 107.50, currentBalance: -12.50, rechargeNeeded: 212.50, highlightType: 'red' },
        { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 326.25, currentBalance: 206.25, rechargeNeeded: 118.75, highlightType: null },
        { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 326.25, currentBalance: 206.25, rechargeNeeded: 118.75, highlightType: null },
        { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 142.00, currentBalance: 22.00, rechargeNeeded: 178.00, highlightType: null },
        { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 338.75, currentBalance: 218.75, rechargeNeeded: 31.25, highlightType: null },
        { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 232.50, currentBalance: 112.50, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 250.00, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 281.25, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 808.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 808.00, highlightType: 'orange' },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 884.00, highlightType: 'orange' },
        { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 628.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 628.00, highlightType: 'orange' },
        { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 846.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 846.00, highlightType: 'orange' },
        { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 439.40, highlightType: 'orange' },
        { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 332.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 332.80, highlightType: 'orange' },
        { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 558.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 558.00, highlightType: 'orange' },
        { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 808.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 808.00, highlightType: 'orange' },
        { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 576.00, highlightType: 'orange' },
        { employeeName: 'MARIANA DE MORAIS CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 907.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 907.40, highlightType: 'orange' },
        { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 231.20, highlightType: null },
        { employeeName: 'ANA CAROLINA LOPES SOUSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 37.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 37.50, highlightType: null },
        { employeeName: 'BARBARA COSTA PEREIRA', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: '2ª A 6ª', expectedValue: 165.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 165.00, highlightType: null },
        { employeeName: 'GIULLIA HANNA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'KAUA HENRIQUE FERREIRA DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'LEILA DOS SANTOS COSTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 225.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'MARGARETH MARIA TEIXEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'RITA RENATA MOREIRA XAVIER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'ROSILENE MENDES DE BRITO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'YASMIN LORENI DE SOUZA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 0.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null }
      ];

      const mayVouchers = defaultMayData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtmay-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-may-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 20 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(300000 + idx),
          period: '2026-05',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-05'),
        ...mayVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-04')) {
      const defaultAprilData = [
        { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 113.75, currentBalance: -6.25, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'ADRIANA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 275.00, balancePrevious: 116.35, currentBalance: -3.65, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 151.25, currentBalance: 31.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 413.75, currentBalance: 293.75, rechargeNeeded: 118.75, highlightType: null },
        { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 259.90, currentBalance: 139.90, rechargeNeeded: 185.10, highlightType: null },
        { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 238.75, currentBalance: 118.75, rechargeNeeded: 206.25, highlightType: null },
        { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 201.25, currentBalance: 81.25, rechargeNeeded: 243.75, highlightType: null },
        { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 163.75, currentBalance: 43.75, rechargeNeeded: 143.75, highlightType: null },
        { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 136.05, currentBalance: 16.05, rechargeNeeded: 171.45, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 888.80, highlightType: 'orange' },
        { employeeName: 'BRAULIO GUALTER NASCIMENTO MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 122.05, currentBalance: 2.05, rechargeNeeded: 272.95, highlightType: null },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 884.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 884.00, highlightType: 'orange' },
        { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 323.00, currentBalance: 203.00, rechargeNeeded: 122.00, highlightType: null },
        { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 189.85, currentBalance: 69.85, rechargeNeeded: 255.15, highlightType: null },
        { employeeName: 'DALVA TEOFILO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 177.06, currentBalance: 57.06, rechargeNeeded: 130.44, highlightType: null },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 207.50, currentBalance: 87.50, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 160.10, highlightType: null },
        { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 245.65, currentBalance: 125.65, rechargeNeeded: 199.35, highlightType: null },
        { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 256.25, highlightType: null },
        { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 690.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 690.80, highlightType: 'orange' },
        { employeeName: 'FRANCYNE FERRAZ SILVA SANTOS', idaCost: 6.25, voltaCost: 0.00, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 220.00, currentBalance: 100.00, rechargeNeeded: 70.00, highlightType: null },
        { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 132.50, currentBalance: 12.50, rechargeNeeded: 262.50, highlightType: null },
        { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 477.45, currentBalance: 357.45, rechargeNeeded: 20.00, highlightType: null },
        { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 263.05, currentBalance: 143.05, rechargeNeeded: 131.95, highlightType: null },
        { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 268.65, currentBalance: 148.65, rechargeNeeded: 176.35, highlightType: null },
        { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 432.50, currentBalance: 312.50, rechargeNeeded: 20.00, highlightType: null },
        { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.00, currentBalance: 175.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 88.75, currentBalance: -31.25, rechargeNeeded: 218.75, highlightType: 'red' },
        { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 275.00, highlightType: null },
        { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 91.45, currentBalance: -28.55, rechargeNeeded: 216.05, highlightType: 'red' },
        { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 195.00, currentBalance: 75.00, rechargeNeeded: 250.00, highlightType: null },
        { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 40.00, highlightType: null },
        { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 363.75, currentBalance: 243.75, rechargeNeeded: 90.00, highlightType: null },
        { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 930.60, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 930.60, highlightType: 'orange' },
        { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 120.00, currentBalance: 0.00, rechargeNeeded: 275.00, highlightType: null },
        { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 402.15, currentBalance: 282.15, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'LARISSA ALVES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 143.40, currentBalance: 23.40, rechargeNeeded: 164.10, highlightType: null },
        { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 439.40, highlightType: 'orange' },
        { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 312.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 312.00, highlightType: 'orange' },
        { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 613.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 613.80, highlightType: 'orange' },
        { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 270.00, currentBalance: 150.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 226.25, currentBalance: 106.25, rechargeNeeded: 218.75, highlightType: null },
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 162.50, currentBalance: 42.50, rechargeNeeded: 282.50, highlightType: null },
        { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 148.60, currentBalance: 28.60, rechargeNeeded: 158.90, highlightType: null },
        { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 290.55, currentBalance: 170.55, rechargeNeeded: 104.45, highlightType: null },
        { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 357.50, currentBalance: 237.50, rechargeNeeded: 90.00, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 232.55, currentBalance: 112.55, rechargeNeeded: 212.45, highlightType: null },
        { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 358.70, currentBalance: 238.70, rechargeNeeded: 90.00, highlightType: null },
        { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 281.25, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 351.25, currentBalance: 231.25, rechargeNeeded: 100.00, highlightType: null },
        { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 298.60, currentBalance: 178.60, rechargeNeeded: 15.00, highlightType: null },
        { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 277.45, currentBalance: 157.45, rechargeNeeded: 167.55, highlightType: null },
        { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 428.10, currentBalance: 308.10, rechargeNeeded: 20.00, highlightType: null },
        { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 225.00, highlightType: null },
        { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 888.80, highlightType: 'orange' },
        { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.00, currentBalance: 250.00, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 170.00, currentBalance: 50.00, rechargeNeeded: 137.50, highlightType: null },
        { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 98.60, currentBalance: -21.40, rechargeNeeded: 296.40, highlightType: 'red' },
        { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 231.25, highlightType: null },
        { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 140.80, currentBalance: 20.80, rechargeNeeded: 166.70, highlightType: null },
        { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 66.45, currentBalance: -53.55, rechargeNeeded: 241.05, highlightType: 'red' },
        { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 276.25, currentBalance: 156.25, rechargeNeeded: 168.75, highlightType: null },
        { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 257.50, currentBalance: 137.50, rechargeNeeded: 187.50, highlightType: null },
        { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 540.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 540.00, highlightType: 'orange' },
        { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 145.00, currentBalance: 25.00, rechargeNeeded: 162.50, highlightType: null },
        { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 130.15, currentBalance: 10.15, rechargeNeeded: 314.85, highlightType: null },
        { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 263.75, currentBalance: 143.75, rechargeNeeded: 181.25, highlightType: null },
        { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 213.75, currentBalance: 93.75, rechargeNeeded: 97.00, highlightType: null },
        { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 230.15, currentBalance: 110.15, rechargeNeeded: 164.85, highlightType: null },
        { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 187.50, balancePrevious: 245.00, currentBalance: 125.00, rechargeNeeded: 65.00, highlightType: null },
        { employeeName: 'DAIANE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 162.50, highlightType: null },
        { employeeName: 'DANIELY ALVES DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'DAVINE TAMARA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'JEISIANE ALVARENGA LUCAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'MARIA DE FÁTIMA CARVALHO DE SOUSA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 112.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 112.50, highlightType: null },
        { employeeName: 'MIGUEL MONTEIRO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'PEDRO CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 237.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 237.50, highlightType: null },
        { employeeName: 'CLEBER NEVES ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 87.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'JURANDI BASTOS GOVEIA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 62.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 62.50, highlightType: null },
        { employeeName: 'LETICIA DE OLIVEIRA BRAGA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 75.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'MARIANA DE MORAISA CARVALHO', idaCost: 17.45, voltaCost: 17.45, dailyCost: 34.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 209.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 209.40, highlightType: null },
        { employeeName: 'JESSICA LUCIANA GONÇALVES DE ARAUJO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 75.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 75.00, highlightType: null }
      ];

      const aprilVouchers = defaultAprilData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtapr-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-apr-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 15 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(500000 + idx),
          period: '2026-04',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-04'),
        ...aprilVouchers
      ];
      updated = true;
    }

    if (!parsed.transport_vouchers || !parsed.transport_vouchers.some(v => v.period === '2026-03')) {
      const defaultMarchData = [
        { employeeName: 'ADRIAN GABRIEL ALENCAR MOURA LEAL', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 140.20, currentBalance: 20.20, rechargeNeeded: 254.80, highlightType: null },
        { employeeName: 'ALEXSANDRA REZENDE DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 153.95, currentBalance: 33.95, rechargeNeeded: 241.05, highlightType: null },
        { employeeName: 'ANA CAROLINA CERQUEIRA GONZAGA', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '2ª A 6ª', expectedValue: 412.50, balancePrevious: 389.95, currentBalance: 269.95, rechargeNeeded: 142.55, highlightType: null },
        { employeeName: 'ANA CAROLINA GUALBERTO DE CARVALHO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 303.65, currentBalance: 183.65, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'ANA CAROLINA PEREIRA DO NASCIMENTO ALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.05, currentBalance: 97.05, rechargeNeeded: 227.95, highlightType: null },
        { employeeName: 'ANA CAROLINE ALVARO CORDEIRO OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 216.45, currentBalance: 96.45, rechargeNeeded: 228.55, highlightType: null },
        { employeeName: 'ANA PAULA DE OLIVEIRA EFIGENIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 121.50, currentBalance: 1.50, rechargeNeeded: 198.50, highlightType: null },
        { employeeName: 'ANDRÉA RODRIGUES SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 122.70, currentBalance: 2.70, rechargeNeeded: 197.30, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 27.90, voltaCost: 12.50, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 848.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 848.40, highlightType: 'orange' },
        { employeeName: 'CARLA EDUARDA DA SILVA MENDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 115.80, currentBalance: -4.20, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'CAROLINA CÁTIA FERNANDES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 47.30, currentBalance: -72.70, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'CATIA BATISTA DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 262.55, currentBalance: 142.55, rechargeNeeded: 182.45, highlightType: null },
        { employeeName: 'CLAÚDIO VINÍCIUS DO PATROCÍNIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 122.95, currentBalance: 2.95, rechargeNeeded: 322.05, highlightType: null },
        { employeeName: 'CLEIDE MOREIRA ROCHA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 312.50, balancePrevious: 223.30, currentBalance: 103.30, rechargeNeeded: 129.05, highlightType: null },
        { employeeName: 'DEUZENITE PEREIRA FRANCISCO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 309.40, currentBalance: 189.40, rechargeNeeded: 135.60, highlightType: null },
        { employeeName: 'EDIR EVANGELISTA DE OLIVEIRA PONTES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 147.40, currentBalance: 27.40, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'ELIANE ROSA MIRANDA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 284.30, currentBalance: 164.30, rechargeNeeded: 160.70, highlightType: null },
        { employeeName: 'ELISIANE FIRMINO DE PAULO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 89.40, currentBalance: -30.60, rechargeNeeded: 325.00, highlightType: 'red' },
        { employeeName: 'ELIZABETH FERREIRA TELES SANTANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 143.30, currentBalance: 23.30, rechargeNeeded: 301.70, highlightType: null },
        { employeeName: 'EMANUELLE MOREIRA FERREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 174.15, currentBalance: 54.15, rechargeNeeded: 270.85, highlightType: null },
        { employeeName: 'ERLAINE KELLE SOUZA RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 117.46, currentBalance: -2.54, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'ESTER FERNANDES FERREIRA', idaCost: 5.95, voltaCost: 5.95, dailyCost: 11.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 309.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'ESTHER GOMES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 223.49, currentBalance: 103.49, rechargeNeeded: 221.51, highlightType: null },
        { employeeName: 'FRANCYNE FERRAZ SILVA SANTOS', idaCost: 6.25, voltaCost: 0.00, dailyCost: 6.25, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 162.50, balancePrevious: 179.80, currentBalance: 59.80, rechargeNeeded: 102.70, highlightType: null },
        { employeeName: 'GABRIELLY GONÇAVES DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 137.45, currentBalance: 17.45, rechargeNeeded: 257.55, highlightType: null },
        { employeeName: 'GEOVANA GOMES RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'GISLAINE MOREIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 184.25, currentBalance: 64.25, rechargeNeeded: 134.40, highlightType: null },
        { employeeName: 'GUILHERME FERREIRA MOZONI', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 106.80, currentBalance: -13.20, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'HELLEN PRISCILA DIAS DE CAMPOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 337.40, currentBalance: 217.40, rechargeNeeded: 107.60, highlightType: null },
        { employeeName: 'IANKA LORRANY DE CARVALHO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 286.10, currentBalance: 166.10, rechargeNeeded: 158.90, highlightType: null },
        { employeeName: 'IVANETE ROSA CASTRO DE ALMEIDA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 228.65, currentBalance: 108.65, rechargeNeeded: 216.35, highlightType: null },
        { employeeName: 'IZAMARA DE JESUS SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 147.60, currentBalance: 27.60, rechargeNeeded: 172.40, highlightType: 'yellow' },
        { employeeName: 'JAINE PINHEIRO PAIM', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 122.35, currentBalance: 2.35, rechargeNeeded: 322.65, highlightType: null },
        { employeeName: 'JAQUELINA LOURENÇO DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 103.95, currentBalance: -16.05, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'JAQUELINE DE OLIVEIRA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 233.40, currentBalance: 113.40, rechargeNeeded: 87.00, highlightType: null },
        { employeeName: 'JHENIFER FAUSTINO DIAS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 295.90, currentBalance: 175.90, rechargeNeeded: 149.10, highlightType: null },
        { employeeName: 'JHONATA BATISTA LOPES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 202.75, currentBalance: 82.75, rechargeNeeded: 117.25, highlightType: null },
        { employeeName: 'JOANA CRISTINA GOMES DA SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 217.80, currentBalance: 97.80, rechargeNeeded: 227.20, highlightType: null },
        { employeeName: 'JOÃO VITOR PEREIRA DA SILVA ANDRADE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 198.60, currentBalance: 78.60, rechargeNeeded: 246.40, highlightType: null },
        { employeeName: 'KAREN TAMARA ALVES TOTOU XISTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 148.60, currentBalance: 28.60, rechargeNeeded: 246.40, highlightType: null },
        { employeeName: 'KATIANE DE SOUZA GALHARDO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 148.30, currentBalance: 28.30, rechargeNeeded: 296.70, highlightType: null },
        { employeeName: 'KETLEN NATALIA MARIA DOS SANTOS MACHADO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 370.90, currentBalance: 250.90, rechargeNeeded: 75.00, highlightType: null },
        { employeeName: 'LARISSA STEFANY EVANGELISTA TELES', idaCost: 8.45, voltaCost: 8.45, dailyCost: 16.90, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 439.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 439.40, highlightType: 'orange' },
        { employeeName: 'LEANDRO AUGUSTO DO CARMO', idaCost: 10.40, voltaCost: 10.40, dailyCost: 20.80, workSchedule: '12X36', expectedValue: 332.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 332.80, highlightType: 'orange' },
        { employeeName: 'LEDA MARIA BELLICO EGG', idaCost: 13.95, voltaCost: 13.95, dailyCost: 27.90, workSchedule: '2ª A 6ª', expectedValue: 613.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 613.80, highlightType: 'orange' },
        { employeeName: 'LELIQUENI DE PAULA ROSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 218.15, currentBalance: 98.15, rechargeNeeded: 176.85, highlightType: null },
        { employeeName: 'LETÍCIA CARMO SILVA CRUZ', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 205.45, currentBalance: 85.45, rechargeNeeded: 239.55, highlightType: null },
        { employeeName: 'LIA CRISTINA DE OLIVEIRA SILVA ANTONIO DO ES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 275.85, currentBalance: 155.85, rechargeNeeded: 169.15, highlightType: null },
        { employeeName: 'LORRAINE CRISTINA OLIVEIRA BARBOSA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 365.55, currentBalance: 245.55, rechargeNeeded: 80.00, highlightType: null },
        { employeeName: 'LUCILENE RAMOS RODRIGUES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 117.35, currentBalance: -2.65, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'LUZIA APARECIDA PEREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 413.75, currentBalance: 293.75, rechargeNeeded: 50.00, highlightType: null },
        { employeeName: 'MARIANA DE PAULA RODRIGUES PINTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 115.55, currentBalance: -4.45, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'MARIANE GOMES MELO SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 159.60, currentBalance: 39.60, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'MARILENE BARBOSA DA SILVA MENDONÇA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 321.80, currentBalance: 201.80, rechargeNeeded: 123.20, highlightType: null },
        { employeeName: 'MARLENE DOS ANJOS SOARES DA SILVA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 312.50, balancePrevious: 371.20, currentBalance: 251.20, rechargeNeeded: 61.30, highlightType: null },
        { employeeName: 'MARLENE ELIAS DOS SANTOS', idaCost: 6.25, voltaCost: 12.50, dailyCost: 18.75, workSchedule: '12X36', expectedValue: 300.00, balancePrevious: 222.40, currentBalance: 102.40, rechargeNeeded: 197.60, highlightType: null },
        { employeeName: 'MARLY MARQUES DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 324.40, currentBalance: 204.40, rechargeNeeded: 120.60, highlightType: null },
        { employeeName: 'MAYANE CABRAL DA MOTA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 323.60, currentBalance: 203.60, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'NATÁLIA GERALDA DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 349.40, currentBalance: 229.40, rechargeNeeded: 95.60, highlightType: null },
        { employeeName: 'NYCOLE GOMES SOARES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 364.95, currentBalance: 244.95, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'PÂMELA CRISTINA DE SOUZA MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 170.80, currentBalance: 50.80, rechargeNeeded: 154.20, highlightType: null },
        { employeeName: 'POLIANA SABRINA MARTINS DUARTE', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 235.80, currentBalance: 115.80, rechargeNeeded: 159.20, highlightType: null },
        { employeeName: 'REJANE MOREIRA DO NASCIMENTO', idaCost: 20.20, voltaCost: 20.20, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 888.80, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 0.00, highlightType: 'orange' },
        { employeeName: 'ROSANA BARBOSA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 289.15, currentBalance: 169.15, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'ROSEMARY ARANTES BORGES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 194.65, currentBalance: 74.65, rechargeNeeded: 125.35, highlightType: null },
        { employeeName: 'RYAN FERREIRA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 167.35, currentBalance: 47.35, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'SABRINA VITÓRIA ASSUNÇÃO VIANA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 259.90, currentBalance: 139.90, rechargeNeeded: 185.10, highlightType: null },
        { employeeName: 'SAMAIA DA COSTA BATISTA MELO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 115.80, currentBalance: -4.20, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'SERAFINA APARECIDA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 110.20, currentBalance: -9.80, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'SHEILA FERREIRA SCHUFFNER', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 222.10, currentBalance: 102.10, rechargeNeeded: 222.90, highlightType: null },
        { employeeName: 'SIDNEI APARECIDO PEREIRA PEIXOTO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 161.70, currentBalance: 41.70, rechargeNeeded: 283.30, highlightType: null },
        { employeeName: 'SILVANA FERNANDA NUNES LELIS', idaCost: 12.50, voltaCost: 12.50, dailyCost: 25.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 650.00, balancePrevious: 415.55, currentBalance: 295.55, rechargeNeeded: 354.45, highlightType: null },
        { employeeName: 'SILVANA RODRIGUES MARQUES', idaCost: 18.00, voltaCost: 18.00, dailyCost: 36.00, workSchedule: '12X36', expectedValue: 576.00, balancePrevious: 0.00, currentBalance: -120.00, rechargeNeeded: 576.00, highlightType: 'orange' },
        { employeeName: 'SUELLEN COSTA AMELIO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 184.30, currentBalance: 64.30, rechargeNeeded: 135.70, highlightType: null },
        { employeeName: 'SUILA JULIANA RODRIGUES NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 211.40, currentBalance: 91.40, rechargeNeeded: 0.00, highlightType: null },
        { employeeName: 'TATIELE VITOR DE OLIVEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 325.00, balancePrevious: 289.65, currentBalance: 169.65, rechargeNeeded: 155.35, highlightType: null },
        { employeeName: 'THALITA MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 188.75, currentBalance: 68.75, rechargeNeeded: 131.25, highlightType: null },
        { employeeName: 'THAMER MAIA NOGUEIRA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 117.65, currentBalance: -2.35, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'VICTOR HENRIQUE SILVA SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 172.40, currentBalance: 52.40, rechargeNeeded: 147.60, highlightType: null },
        { employeeName: 'VITOR EMANUEL MENEZES NOVAIS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '2ª A 6ª', expectedValue: 275.00, balancePrevious: 111.70, currentBalance: -8.30, rechargeNeeded: 275.00, highlightType: 'red' },
        { employeeName: 'WANDA MARIA DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 200.00, balancePrevious: 65.50, currentBalance: -54.50, rechargeNeeded: 200.00, highlightType: 'red' },
        { employeeName: 'ADRIANA GONÇALVES', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'TERÇA A SÁBADO', expectedValue: 125.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 125.00, highlightType: null },
        { employeeName: 'AUTELI DE SOUZA', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 150.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 150.00, highlightType: null },
        { employeeName: 'AVILMAR FERREIRA SANTOS', idaCost: 13.95, voltaCost: 6.25, dailyCost: 40.40, workSchedule: '2ª A 6ª', expectedValue: 848.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 848.40, highlightType: 'orange' },
        { employeeName: 'BRAULIO GUALTER NASCIMENTO MATOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 300.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 300.00, highlightType: null },
        { employeeName: 'CASSIA APARECIDA DE AVILA', idaCost: 17.00, voltaCost: 17.00, dailyCost: 34.00, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 646.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 646.00, highlightType: 'orange' },
        { employeeName: 'DEBORA LUIZA ALVES RESENDE DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null },
        { employeeName: 'ÉRICA ALVES DA SILVA', idaCost: 15.70, voltaCost: 15.70, dailyCost: 31.40, workSchedule: '2ª A 6ª', expectedValue: 345.40, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 345.40, highlightType: 'orange' },
        { employeeName: 'JUCILÉIA COELHO SANTOS RODRIGUES', idaCost: 21.15, voltaCost: 21.15, dailyCost: 42.30, workSchedule: '2ª A 6ª', expectedValue: 507.60, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 507.60, highlightType: 'orange' },
        { employeeName: 'LARISSA ALVES DOS SANTOS', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: '12X36', expectedValue: 87.50, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 87.50, highlightType: null },
        { employeeName: 'MARILIA RODRIGUES GONÇALVES DEODATO', idaCost: 6.25, voltaCost: 6.25, dailyCost: 12.50, workSchedule: 'SEGUNDA A SÁBADO', expectedValue: 175.00, balancePrevious: 0.00, currentBalance: 0.00, rechargeNeeded: 175.00, highlightType: null }
      ];

      const marchVouchers = defaultMarchData.map((v, idx) => {
        let emp = parsed.employees.find(e => e.name && e.name.trim().toLowerCase() === v.employeeName.trim().toLowerCase());
        if (!emp) {
          emp = {
            id: 'emp-vtmar-' + (idx + 1),
            name: v.employeeName,
            role: 'Colaborador CLT',
            sectorId: 'rh',
            admissionDate: '2024-01-01',
            contractType: 'CLT',
            salary: 2500,
            status: 'Ativo',
            city: 'Betim',
            state: 'MG'
          };
          parsed.employees.push(emp);
        }
        return {
          id: 'vt-mar-' + (idx + 1),
          employeeId: emp.id,
          employeeName: v.employeeName,
          route: 'Linha Urbana - Betim / BH',
          idaCost: v.idaCost,
          voltaCost: v.voltaCost,
          dailyCost: v.dailyCost,
          workSchedule: v.workSchedule,
          expectedValue: v.expectedValue,
          daysCount: v.workSchedule === '2ª A 6ª' ? 22 : (v.workSchedule === '12X36' ? 16 : 26),
          totalValue: v.expectedValue,
          balancePrevious: v.balancePrevious,
          currentBalance: v.currentBalance,
          rechargeNeeded: Math.max(0, v.rechargeNeeded),
          rawRechargeNeeded: v.rechargeNeeded,
          cardType: 'BetimCARD / BHBus',
          cardNumber: '31' + String(400000 + idx),
          period: '2026-03',
          highlightType: v.highlightType,
          discountPercent: 6
        };
      });

      parsed.transport_vouchers = [
        ...(parsed.transport_vouchers || []).filter(v => v.period !== '2026-03'),
        ...marchVouchers
      ];
      updated = true;
    }

    if (!parsed.tenant_settings) {
      parsed.tenant_settings = {
        name: 'Nexa Nefrologia & Clínica Integrada',
        cnpj: '12.345.678/0001-90',
        logo: '',
        themeColor: '#ec4899'
      };
      updated = true;
    }

    if (!parsed.user_profiles) {
      parsed.user_profiles = [
        { id: 'admin', name: 'Administrador / T.I.', permissions: { index: 'write', reception: 'write', clinical: 'write', calendar: 'write', stock: 'write', maintenance: 'write', purchasing: 'write', requisitions: 'write', apac: 'write', finance: 'write', hr: 'write', sesmt: 'write', config: 'write' } },
        { id: 'reception', name: 'Recepção / Atendimento', permissions: { index: 'read', reception: 'write', clinical: 'none', calendar: 'write', stock: 'none', maintenance: 'read', purchasing: 'none', requisitions: 'none', apac: 'read', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'clinical', name: 'Equipe Multiprofissional', permissions: { index: 'read', reception: 'read', clinical: 'write', calendar: 'read', stock: 'read', maintenance: 'read', purchasing: 'none', requisitions: 'write', apac: 'none', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'financial', name: 'Gestão Financeira', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'read', requisitions: 'none', apac: 'write', finance: 'write', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'hr', name: 'Recursos Humanos (RH)', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'read', requisitions: 'none', apac: 'none', finance: 'none', hr: 'write', sesmt: 'read', config: 'none' } },
        { id: 'sesmt', name: 'SESMT & Segurança do Trabalho', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'read', purchasing: 'none', requisitions: 'none', apac: 'none', finance: 'none', hr: 'read', sesmt: 'write', config: 'none' } },
        { id: 'stock_keeper', name: 'Almoxarifado & Farmácia', permissions: { index: 'read', reception: 'none', clinical: 'read', calendar: 'none', stock: 'write', maintenance: 'read', purchasing: 'write', requisitions: 'write', apac: 'none', finance: 'none', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'technician', name: 'Manutenção & Engenharia Clínica', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'read', maintenance: 'write', purchasing: 'read', requisitions: 'read', apac: 'none', finance: 'none', hr: 'none', sesmt: 'read', config: 'none' } },
        { id: 'apac', name: 'Faturamento & APACs', permissions: { index: 'read', reception: 'read', clinical: 'none', calendar: 'none', stock: 'none', maintenance: 'none', purchasing: 'none', requisitions: 'none', apac: 'write', finance: 'read', hr: 'none', sesmt: 'none', config: 'none' } },
        { id: 'purchasing', name: 'Compras & Suprimentos', permissions: { index: 'read', reception: 'none', clinical: 'none', calendar: 'none', stock: 'read', maintenance: 'none', purchasing: 'write', requisitions: 'read', apac: 'none', finance: 'read', hr: 'none', sesmt: 'none', config: 'none' } }
      ];
      updated = true;
    }

    if (updated) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(parsed));
    }
    return parsed;
  }

  // Default initial database state
  const initialDB = {
    users: [
      {
        uid: 'techcosta-admin-uid',
        email: 'contato@techcosta.net',
        name: 'Administrador TechCosta',
        role: 'admin',
        allowedSectors: ['enfermagem', 'medica', 'qualidade', 'faturamento', 'psicologia', 'nutricao', 'rh', 'recepcao', 'estoque', 'compras'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'anacg-uid',
        email: 'anacg@nexa.com',
        name: 'Ana Carolina Cerqueira Gonzaga',
        role: 'rh',
        allowedSectors: ['rh'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'jsoares-uid',
        email: 'jsoares@nexa.com',
        name: 'J. Soares',
        role: 'rh',
        allowedSectors: ['rh'],
        status: 'active',
        createdAt: new Date().toISOString()
      },
      {
        uid: 'roseannefa-uid',
        email: 'roseannefa@nexa.com',
        name: 'Roseanne Faria',
        role: 'sesmt',
        allowedSectors: ['sesmt'],
        status: 'active',
        createdAt: new Date().toISOString()
      }
    ],
    sectors: [
      { id: 'enfermagem', name: 'Enfermagem', description: 'Métricas assistenciais da equipe de enfermagem' },
      { id: 'medica', name: 'Equipe Médica', description: 'Indicadores clínicos e mortalidade' },
      { id: 'qualidade', name: 'Qualidade', description: 'Satisfação do paciente e auditorias' },
      { id: 'faturamento', name: 'Faturamento', description: 'Glosas, custos e faturamento de diálise' },
      { id: 'psicologia', name: 'Psicologia', description: 'Métricas de cobertura de atendimento psicológico, risco emocional e encaminhamentos à rede.' },
      { id: 'nutricao', name: 'Nutrição', description: 'Métricas de cobertura de atendimento nutricional, adequação metabólica e controle de peso.' },
      { id: 'sesmt', name: 'SESMT & Segurança', description: 'Inspeções de EPI, Extintores e Hidrantes' }
    ],
    indicators: [
      { id: 'taxa_infeccao_cateter', name: 'Taxa de Infecção por Cateter', sectorId: 'enfermagem', unit: '%', target: 1.5, description: 'Percentual de pacientes com infecção de acesso vascular (cateter)' },
      { id: 'reuso_capilares', name: 'Média de Reuso de Dialisadores', sectorId: 'enfermagem', unit: 'reusos', target: 12, description: 'Número médio de vezes que um dialisador (capilar) é reusado' },
      { id: 'taxa_uso_cdl_fim_mes', name: 'Taxa de Uso de CDL (Fim do Mês)', sectorId: 'enfermagem', unit: '%', target: 7.0, description: 'Percentual de pacientes utilizando Cateter Duplo Lúmen temporário no final do mês' },
      { id: 'taxa_uso_permcath', name: 'Taxa de Utilização de Permcath', sectorId: 'enfermagem', unit: '%', target: 23.0, description: 'Percentual de pacientes utilizando Cateter de longa permanência (Permcath)' },
      { id: 'taxa_uso_ptfe', name: 'Taxa de Utilização de PTFE (Prótese)', sectorId: 'enfermagem', unit: '%', target: 4.0, description: 'Percentual de pacientes utilizando prótese vascular (PTFE) como acesso' },
      { id: 'taxa_uso_cateter_longo_prazo', name: 'Taxa de Utilização de Cateter > 3 Meses', sectorId: 'enfermagem', unit: '%', target: 10.0, description: 'Percentual de pacientes utilizando cateter temporário por mais de 3 meses' },
      { id: 'taxa_pacientes_fav', name: 'Taxa de Pacientes com FAV (Fístula)', sectorId: 'enfermagem', unit: '%', target: 66.0, description: 'Percentual de pacientes com Fístula Arteriovenosa (acesso definitivo padrão-ouro)' },
      { id: 'perdas_fav', name: 'Número de Perdas de FAV (Acesso Definitivo)', sectorId: 'enfermagem', unit: 'perdas', target: 2.0, description: 'Número total de fístulas arteriovenosas que foram perdidas/inviabilizadas no mês' },
      { id: 'total_fav_confeccionadas', name: 'Total de FAV Confeccionadas', sectorId: 'enfermagem', unit: 'FAVs', target: 18.0, description: 'Total de fístulas arteriovenosas confeccionadas cirurgicamente no período' },
      { id: 'taxa_fav_simples', name: 'Taxa de FAV Simples (Confecção)', sectorId: 'enfermagem', unit: '%', target: 15.0, description: 'Percentual de confecções de fístula arteriovenosa simples (nativa)' },
      { id: 'taxa_fav_bloqueio', name: 'Taxa de FAV Simples com Bloqueio (Confecção)', sectorId: 'enfermagem', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa simples com bloqueio de plexo' },
      { id: 'taxa_fav_basilica', name: 'Taxa de FAV Basílica (Confecção)', sectorId: 'enfermagem', unit: '%', target: 31.0, description: 'Percentual de confecções de fístula arteriovenosa utilizando a veia basílica' },
      { id: 'taxa_fav_maturacao', name: 'Taxa de FAV em Maturação', sectorId: 'enfermagem', unit: '%', target: 106.0, description: 'Percentual de fístulas em processo de maturação em relação às confeccionadas' },
      { id: 'taxa_falencia_primaria', name: 'Taxa de Falência Primária de FAV', sectorId: 'enfermagem', unit: '%', target: 17.0, description: 'Percentual de fístulas arteriovenosas que apresentaram falência antes da primeira punção' },
      { id: 'mortalidade_mensal', name: 'Taxa de Mortalidade Mensal', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de óbitos de pacientes em tratamento no mês' },
      { id: 'mortalidade_hd', name: 'Taxa de Mortalidade Pacientes HD', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em hemodiálise (HD) sobre o total de pacientes atendidos em HD' },
      { id: 'mortalidade_dp', name: 'Taxa de Mortalidade Pacientes DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de óbitos de pacientes em diálise peritoneal (DP) sobre o total de pacientes atendidos em DP' },
      { id: 'mortalidade_geral', name: 'Taxa de Mortalidade Geral', sectorId: 'medica', unit: '%', target: 1.0, description: 'Fórmula: Número de óbitos em HD ou DP / Número total de pacientes atendidos HD ou DP * 100' },
      { id: 'obitos_relacionados_hddp', name: 'Óbitos relacionados a HD/DP', sectorId: 'medica', unit: 'óbitos', target: 2.0, description: 'Número de óbitos diretamente relacionados ao tratamento dialítico' },
      { id: 'total_pacientes_hd', name: 'Total de pacientes atendidos em HD', sectorId: 'medica', unit: 'pacientes', target: 550.0, description: 'Total de pacientes sob tratamento de hemodiálise no mês' },
      { id: 'total_pacientes_dp', name: 'Total de pacientes atendidos em DP', sectorId: 'medica', unit: 'pacientes', target: 75.0, description: 'Total de pacientes sob tratamento de diálise peritoneal no mês' },
      { id: 'obitos_prevalentes_hd', name: 'Óbitos Prevalentes e incidentes em HD', sectorId: 'medica', unit: 'óbitos', target: 5.0, description: 'Total de óbitos acumulados no mês de pacientes de hemodiálise' },
      { id: 'obitos_prevalentes_dp', name: 'Óbitos Prevalentes e incidentes em DP', sectorId: 'medica', unit: 'óbitos', target: 1.0, description: 'Total de óbitos acumulados no mês de pacientes de diálise peritoneal' },
      { id: 'total_internacoes_hosp', name: 'Total de internações Hospitalares', sectorId: 'medica', unit: 'internações', target: 25.0, description: 'Soma total de internações ocorridas no mês de pacientes de HD e DP' },
      { id: 'taxa_hospitalizacao_geral', name: 'Taxa Hospitalização Geral', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual geral de pacientes que necessitaram de hospitalização' },
      { id: 'taxa_hospitalizacao_intercorrência_dialitica', name: 'Taxa hospitalização por Intercorrência Dialitica (DP +HD)', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações causadas por intercorrência relacionada à diálise' },
      { id: 'taxa_internacoes_dp', name: 'Taxa de internações DP', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em diálise peritoneal' },
      { id: 'taxa_internacoes_hd', name: 'Taxa de internações HD', sectorId: 'medica', unit: '%', target: 4.0, description: 'Percentual de internações de pacientes em hemodiálise' },
      { id: 'taxa_internacao_intercorrencia_dp', name: 'Taxa de internação por intercorrencia DP', sectorId: 'medica', unit: '%', target: 1.0, description: 'Percentual de internações por intercorrência de diálise peritoneal' },
      { id: 'taxa_internacoes_intercorrencia_hd', name: 'Taxa de internações intercorrência HD', sectorId: 'medica', unit: '%', target: 2.0, description: 'Percentual de internações por intercorrência de hemodiálise' },
      { id: 'taxa_fav_moises', name: 'Dr. Moisés: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 47.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Moisés' },
      { id: 'falencia_fav_moises', name: 'Dr. Moisés: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 22.0, description: 'Percentual de fístulas realizadas pelo Dr. Moisés que falharam antes da maturação' },
      { id: 'taxa_fav_alexandre', name: 'Dr. Alexandre: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 51.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelo Dr. Alexandre' },
      { id: 'falencia_fav_alexandre', name: 'Dr. Alexandre: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 12.0, description: 'Percentual de fístulas realizadas pelo Dr. Alexandre que falharam antes da maturação' },
      { id: 'taxa_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Confecção de FAV', sectorId: 'medica', unit: '%', target: 13.0, description: 'Percentual de confecções de fístula arteriovenosa realizadas pelos Dr. Euler/Ricardo' },
      { id: 'falencia_fav_euler_ricardo', name: 'Dr. Euler/Ricardo: Taxa de Falência Primária', sectorId: 'medica', unit: '%', target: 5.0, description: 'Percentual de fístulas realizadas pelos Dr. Euler/Ricardo que falharam antes da maturação' },
      { id: 'taxa_internacao', name: 'Taxa de Internação Hospitalar', sectorId: 'medica', unit: '%', target: 10.0, description: 'Porcentagem de pacientes que necessitaram de internação no período' },
      { id: 'total_pacientes_hddp', name: 'Total de Pacientes HD e DP', sectorId: 'medica', unit: 'pacientes', target: 624.0, description: 'Total bruto de pacientes ativos em hemodiálise e diálise peritoneal no período' },
      { id: 'pacientes_hemotransfundidos_bruto', name: 'Pacientes Hemotransfundidos (Bruto)', sectorId: 'medica', unit: 'pacientes', target: 11.0, description: 'Número total de pacientes que necessitaram de transfusão de sangue no mês' },
      { id: 'total_bolsas_infundidas', name: 'Total de Bolsas Infundidas (Hemotransfusões)', sectorId: 'medica', unit: 'bolsas', target: 16.0, description: 'Número de bolsas de concentrado de hemácias ou outros hemocomponentes transfundidos' },
      { id: 'total_reacoes_transfusionais', name: 'Total de Reações Transfusionais', sectorId: 'medica', unit: 'reações', target: 0.0, description: 'Número total de reações adversas transfusionais notificadas no período' },
      { id: 'taxa_hemotransfusao', name: 'Taxa de Hemotransfusão', sectorId: 'medica', unit: '%', target: 3.0, description: 'Fórmula: Total de hemotransfusões / Total de pacientes HD e DP * 100' },
      { id: 'taxa_pacientes_hemotransfundidos', name: 'Taxa de Pacientes Hemotransfundidos', sectorId: 'medica', unit: '%', target: 2.0, description: 'Fórmula: Total de pacientes hemotransfundidos / Total de pacientes HD e DP * 100' },
      { id: 'taxa_reacao_transfusional', name: 'Taxa de Reação Transfusional', sectorId: 'medica', unit: '%', target: 0.0, description: 'Fórmula: Total de reações transfusionais / Total de bolsas infundidas * 100' },
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
      { id: 'controle_albumina', name: 'Adequação de Albumina Sérica', sectorId: 'nutricao', unit: '%', target: 70.0, description: 'Percentual de pacientes com nível de Albumina sérica adequado (> 3.0 g/dL).' },

      { id: 'qualidade_ktv', name: 'Adequação de Hemodiálise (Kt/V > 1,2)', sectorId: 'qualidade', unit: '%', target: 70.0, description: 'Percentual de pacientes com Kt/V maior que 1,2.' },
      { id: 'qualidade_hb_normal', name: 'Pacientes sem Anemia (HB >= 10)', sectorId: 'qualidade', unit: '%', target: 50.0, description: 'Percentual de pacientes com Hemoglobina maior ou igual a 10 g/dL.' },
      { id: 'qualidade_hb_grave', name: 'Pacientes com Anemia Grave (HB <= 7)', sectorId: 'qualidade', unit: '%', target: 5.0, description: 'Percentual de pacientes com Hemoglobina menor ou igual a 7 g/dL.' },
      { id: 'qualidade_pth', name: 'Paratormônio Elevado (PTH > 600 pg/ml)', sectorId: 'qualidade', unit: '%', target: 20.0, description: 'Percentual de pacientes com nível de PTH maior que 600 pg/ml.' }
    ],
    indicator_data: [
      // Kt/V (Qualidade)
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 71.48, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 74.91, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 76.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 69.64, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_ktv', sectorId: 'qualidade', value: 62.41, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Hb >= 10 (Qualidade)
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 62.90, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 54.90, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.10, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 61.50, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_normal', sectorId: 'qualidade', value: 58.40, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Hb <= 7 (Qualidade)
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 3.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.62, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 4.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.74, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'qualidade_hb_grave', sectorId: 'qualidade', value: 5.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // PTH > 600 (Qualidade)
      { indicatorId: 'qualidade_pth', sectorId: 'qualidade', value: 63.93, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.8, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.4, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_infeccao_cateter', sectorId: 'enfermagem', value: 1.6, period: '2026-07', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 11.8, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.3, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'reuso_capilares', sectorId: 'enfermagem', value: 12.1, period: '2026-07', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.2, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 5.1, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_mensal', sectorId: 'medica', value: 4.8, period: '2026-07', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 9.5, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 11.2, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao', sectorId: 'medica', value: 8.9, period: '2026-07', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 78, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 82, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'satisfacao_paciente', sectorId: 'qualidade', value: 84, period: '2026-07', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      
      // Cobertura Atendimento Psicológico (Psicologia)
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 49.04, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 29.01, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 6.79, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 28.27, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 36.96, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_psico', sectorId: 'psicologia', value: 40.58, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Taxa de Risco Psicológico (Psicologia)
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 28.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 26.00, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 15.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 14.56, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 34.43, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_risco_psico', sectorId: 'psicologia', value: 21.79, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Taxa de Encaminhamento à Rede (Psicologia)
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 5.92, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 3.21, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 9.30, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 8.47, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 1.30, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_encaminhamento_rede', sectorId: 'psicologia', value: 4.97, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Cobertura Atendimento Nutricional (Nutrição)
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 16.88, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 15.87, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 10.27, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 12.46, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 4.32, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_atendimento_nutri', sectorId: 'nutricao', value: 18.04, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Baixo (< 3,5)
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 25.66, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.87, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 0.00, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_baixo', sectorId: 'nutricao', value: 1.02, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Adequado (Nutrição)
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 66.03, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 60.09, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 61.39, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 63.82, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_potassio', sectorId: 'nutricao', value: 68.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Potássio Alto (> 5,5)
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 8.30, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 38.63, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.73, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 50.00, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 36.17, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'potassio_alto', sectorId: 'nutricao', value: 30.61, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Baixo (< 3,5)
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 7.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 13.27, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 15.52, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 29.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_baixo', sectorId: 'nutricao', value: 20.41, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Adequado (Nutrição)
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 48.44, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 57.18, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 34.72, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 62.16, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 61.37, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_fosforo', sectorId: 'nutricao', value: 58.84, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Fósforo Alto (> 5,5)
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 43.86, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 29.54, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 49.74, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 8.11, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 19.31, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'fosforo_alto', sectorId: 'nutricao', value: 20.75, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Baixo Peso
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 56.52, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 0.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 41.17, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_baixo_peso', sectorId: 'nutricao', value: 45.45, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Peso Adequado
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 34.78, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 38.88, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 80.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 47.05, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 44.44, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_peso_adequado', sectorId: 'nutricao', value: 18.18, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Obesidade
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 8.69, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 22.22, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 20.00, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.76, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 11.11, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'nutri_obesidade', sectorId: 'nutricao', value: 36.36, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Ganho de Peso Interdialítico (Nutrição)
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 68.00, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 72.72, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 66.23, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 55.69, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 58.75, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_gpid', sectorId: 'nutricao', value: 54.43, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // Albumina Sérica (Nutrição)
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 97.40, period: '2026-01', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.10, period: '2026-02', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.50, period: '2026-03', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 94.73, period: '2026-04', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 95.80, period: '2026-05', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'controle_albumina', sectorId: 'nutricao', value: 96.50, period: '2026-06', uploadedBy: 'admin-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_hd
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.10, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.83, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.09, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 1.46, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_hd', sectorId: 'medica', value: 2.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_dp
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 2.63, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_dp', sectorId: 'medica', value: 4.17, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // mortalidade_geral
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.96, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.78, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 0.95, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 1.28, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'mortalidade_geral', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_relacionados_hddp
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 3, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_relacionados_hddp', sectorId: 'medica', value: 2, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_hd
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 547, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 546, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 550, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 548, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hd', sectorId: 'medica', value: 549, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_dp
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 75, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 73, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 79, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 76, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 77, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_dp', sectorId: 'medica', value: 72, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_prevalentes_hd
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 10, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 6, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 8, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_hd', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // obitos_prevalentes_dp
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 1, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 2, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'obitos_prevalentes_dp', sectorId: 'medica', value: 3, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_internacoes_hosp
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 33, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 18, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 27, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 30, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_internacoes_hosp', sectorId: 'medica', value: 31, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hospitalizacao_geral
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 5.31, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 2.91, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.29, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.31, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.80, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_geral', sectorId: 'medica', value: 4.99, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hospitalizacao_intercorrência_dialitica
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.41, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.94, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.91, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.40, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 2.24, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hospitalizacao_intercorrência_dialitica', sectorId: 'medica', value: 1.93, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_dp
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 6.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.06, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 1.32, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_dp', sectorId: 'medica', value: 5.56, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_hd
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 5.12, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 3.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.74, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_hd', sectorId: 'medica', value: 4.92, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacao_intercorrencia_dp
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.67, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.37, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 1.27, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 2.60, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacao_intercorrencia_dp', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_internacoes_intercorrencia_hd
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.38, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.01, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.73, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_internacoes_intercorrencia_hd', sectorId: 'medica', value: 2.19, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_cdl_fim_mes
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.14, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 8.97, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 9.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 11.13, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cdl_fim_mes', sectorId: 'enfermagem', value: 10.93, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_permcath
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 26.33, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 27.47, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.45, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 25.82, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 24.64, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_permcath', sectorId: 'enfermagem', value: 21.68, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_ptfe
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.10, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.27, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_ptfe', sectorId: 'enfermagem', value: 1.28, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_uso_cateter_longo_prazo
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.93, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 2.56, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.09, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 3.64, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.01, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_uso_cateter_longo_prazo', sectorId: 'enfermagem', value: 4.19, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_pacientes_fav
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 63.60, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 65.10, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.00, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 64.40, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_fav', sectorId: 'enfermagem', value: 66.10, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // perdas_fav
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 0, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 6, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 3, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'perdas_fav', sectorId: 'enfermagem', value: 2, period: '2026-06', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // total_fav_confeccionadas
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 8, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 16, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 19, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 18, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_fav_confeccionadas', sectorId: 'enfermagem', value: 29, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_simples
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 10.53, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_simples', sectorId: 'enfermagem', value: 0.00, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_bloqueio
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 25.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 50.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 68.42, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.56, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_bloqueio', sectorId: 'enfermagem', value: 55.17, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_basilica
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 50.00, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 25.00, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 22.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_basilica', sectorId: 'enfermagem', value: 37.93, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_fav_maturacao
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 87.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 81.25, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 78.95, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 122.22, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_maturacao', sectorId: 'enfermagem', value: 162.07, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // taxa_falencia_primaria
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 12.50, period: '2026-01', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 18.75, period: '2026-02', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 21.05, period: '2026-03', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 16.67, period: '2026-04', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_falencia_primaria', sectorId: 'enfermagem', value: 13.79, period: '2026-05', uploadedBy: 'enfermagem-uid', uploadedAt: new Date().toISOString() },

      // Dr. Moisés: Confecção
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 62.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 43.75, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 57.89, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 27.78, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_moises', sectorId: 'medica', value: 41.38, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Moisés: Falência Primária
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 28.57, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 18.18, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 20.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_moises', sectorId: 'medica', value: 25.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Alexandre: Confecção
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 37.50, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 56.25, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 42.11, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 72.22, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_alexandre', sectorId: 'medica', value: 44.83, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Alexandre: Falência Primária
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 11.11, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 25.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 15.38, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_alexandre', sectorId: 'medica', value: 7.69, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Euler/Ricardo: Confecção
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_fav_euler_ricardo', sectorId: 'medica', value: 13.79, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // Dr. Euler/Ricardo: Falência Primária
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'falencia_fav_euler_ricardo', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_pacientes_hddp
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 619, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 629, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 626, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 625, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_pacientes_hddp', sectorId: 'medica', value: 621, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // pacientes_hemotransfundidos_bruto
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 8, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 7, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 13, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 12, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'pacientes_hemotransfundidos_bruto', sectorId: 'medica', value: 11, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_bolsas_infundidas
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 15, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 16, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 19, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 17, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_bolsas_infundidas', sectorId: 'medica', value: 14, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // total_reacoes_transfusionais
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'total_reacoes_transfusionais', sectorId: 'medica', value: 0, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_hemotransfusao
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.58, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.42, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.54, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 3.04, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.72, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_hemotransfusao', sectorId: 'medica', value: 2.25, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_pacientes_hemotransfundidos
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.29, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.13, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 2.07, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.92, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_pacientes_hemotransfundidos', sectorId: 'medica', value: 1.77, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },

      // taxa_reacao_transfusional
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-01', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-02', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-03', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-04', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-05', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() },
      { indicatorId: 'taxa_reacao_transfusional', sectorId: 'medica', value: 0.00, period: '2026-06', uploadedBy: 'medica-uid', uploadedAt: new Date().toISOString() }
    ],
    uploads_history: [],
    patients: getDefaultPatients(),
    shifts: [
      { id: 'shift_1', name: '1º Turno' },
      { id: 'shift_2', name: '2º Turno' },
      { id: 'shift_3', name: '3º Turno' }
    ],
    rooms: [
      { id: 'room_1', name: 'Salão 1' },
      { id: 'room_2', name: 'Salão 2' },
      { id: 'room_3', name: 'Salão 3' }
    ],
    accessTypes: [
      { id: 'access_1', name: 'Fístula Arteriovenosa' },
      { id: 'access_2', name: 'Cateter Duplo Lúmen' },
      { id: 'access_3', name: 'Prótese' }
    ],
    dialysisFrequencies: [
      { id: 'freq_1', name: '3x por semana (Seg/Qua/Sex)' },
      { id: 'freq_2', name: '3x por semana (Ter/Qui/Sáb)' },
      { id: 'freq_3', name: '2x por semana' },
      { id: 'freq_4', name: 'Diário' }
    ],
    prescriptions: [
      {
        id: 'presc-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        type: 'HD',
        dialyzerModel: 'HF80 (Alto Fluxo)',
        sessionTime: '4.0',
        bloodFlow: '350',
        dialysateFlow: '500',
        heparinType: 'Intermitente',
        heparinDose: '5000 UI',
        bicarbonate: '32 mEq/L',
        sodium: '138 mEq/L',
        dryWeight: 64.0,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'presc-2',
        patientId: 'pat-2',
        patientName: 'ADAO LUCIANO DIAS',
        type: 'HD',
        dialyzerModel: 'HF60 (Baixo Fluxo)',
        sessionTime: '4.0',
        bloodFlow: '300',
        dialysateFlow: '500',
        heparinType: 'Sem Heparina',
        heparinDose: '0',
        bicarbonate: '30 mEq/L',
        sodium: '140 mEq/L',
        dryWeight: 60.5,
        updatedAt: new Date().toISOString()
      }
    ],
    sessions_logs: [
      {
        id: 'log-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        shift: '2º Turno',
        room: 'Salão 1',
        chairNumber: '1',
        hourlyData: [
          { hour: '1ªh', bp: '130/80', hr: '76', venousPressure: '120', arterialPressure: '-150', bloodFlowReal: '350', ufRate: '0.8', notes: 'Início sem queixas' },
          { hour: '2ªh', bp: '125/75', hr: '74', venousPressure: '120', arterialPressure: '-160', bloodFlowReal: '350', ufRate: '0.8', notes: 'Sessão estável' },
          { hour: '3ªh', bp: '110/70', hr: '80', venousPressure: '130', arterialPressure: '-160', bloodFlowReal: '330', ufRate: '0.5', notes: 'Caimbra leve em panturrilha. Reduzida taxa de UF.' }
        ],
        complications: ['Câimbras'],
        notes: 'Paciente finalizou bem a diálise, caimbras resolvidas com soro fisiológico e redução da taxa de UF.'
      }
    ],
    clinical_notes: [
      {
        id: 'note-1',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        category: 'Médica',
        author: 'Dr. Lucas (Nefrologista)',
        text: 'Paciente evoluindo com boa tolerância hemodinâmica à ultrafiltração. Kt/V do último mês de 1.45 (dentro da meta). Acesso fístula arteriovenosa com bom frêmito, sem sinais inflamatórios.'
      },
      {
        id: 'note-2',
        patientId: 'pat-1',
        patientName: 'ADAIR PRAXEDES MORENO',
        date: new Date().toISOString().substring(0, 10),
        category: 'Nutrição',
        author: 'Nutr. Julia',
        text: 'Paciente relata boa adesão à dieta hipopotassêmica. Ganho de peso interdialítico médio de 2.1kg (adequado para o peso seco de 64kg).'
      }
    ],
    inventory_items: initialProducts,
    stock_transactions: [
      { id: 'tx-1', itemId: 'item-1', itemName: 'Dialisador HF80 (Alto Fluxo)', quantity: 150, type: 'Entrada', batch: 'L-A120', expiryDate: '2028-05-10', operator: 'Almoxarife João', date: '2026-07-01T09:00:00.000Z', notes: 'Compra regular nota fiscal 9931' },
      { id: 'tx-2', itemId: 'item-1', itemName: 'Dialisador HF80 (Alto Fluxo)', quantity: 30, type: 'Saída', batch: 'L-A120', expiryDate: '2028-05-10', operator: 'Almoxarife João', date: '2026-07-10T14:30:00.000Z', notes: 'Dispensação para a Sala 1' },
      { id: 'tx-3', itemId: 'item-6', itemName: 'Sacarato Hidróxido Ferro III 100mg', quantity: 10, type: 'Saída', batch: 'L-M400', expiryDate: '2026-08-30', operator: 'Farmacêutica Marta', date: '2026-07-14T11:15:00.000Z', notes: 'Aplicação de rotina pós-diálise' }
    ],
    suppliers: initialSuppliers,
    stock_sectors: [
      { id: 'sec-stock-1', name: 'Almoxarifado Central', description: 'Armazenamento geral de insumos da clínica' },
      { id: 'sec-stock-2', name: 'Farmácia Satélite', description: 'Dispensação imediata de medicamentos de alto custo' },
      { id: 'sec-stock-3', name: 'Posto de Enfermagem', description: 'Materiais de uso rápido em hemodiálise' }
    ],
    purchase_invoices: [],
    employees: [
      {
        id: 'emp-1',
        name: 'Clara Rodrigues',
        gender: 'Feminino',
        birthDate: '1990-05-15',
        cpf: '123.456.789-01',
        rg: 'MG-12.345.678',
        motherName: 'Maria Rodrigues',
        phone: '(31) 98765-4321',
        email: 'clara.rodrigues@clinica.com',
        city: 'Belo Horizonte',
        state: 'MG',
        address: 'Rua das Flores, 123',
        cep: '30123-456',
        role: 'Enfermeira Chefe',
        sectorId: 'enfermagem',
        admissionDate: '2023-01-10',
        contractType: 'CLT',
        salary: 4500,
        bankName: 'Banco do Brasil',
        bankAgency: '1234-5',
        bankAccount: '98765-4',
        photo: '',
        dependents: [
          { name: 'Mateus Rodrigues', relationship: 'Filho(a)', birthDate: '2018-09-20' }
        ],
        warnings: [
          { id: 'warn-1', date: '2026-02-10', motive: 'Atraso Injustificado', text: 'Chegada tardia no início do turno sem aviso prévio.', docUrl: '' }
        ],
        vaccinations: [
          { name: 'Hepatite B', dose: '3ª Dose', date: '2025-06-12', expiryDate: '', lot: 'HEP-B-9988' },
          { name: 'Dupla Viral (DT)', dose: 'Reforço', date: '2024-03-10', expiryDate: '2034-03-10', lot: 'DT-4411' }
        ],
        documents: [
          { name: 'Diploma de Enfermagem', category: 'Diploma', expiryDate: '', fileUrl: '' }
        ]
      },
      {
        id: 'emp-2',
        name: 'Dr. Lucas Nefro',
        gender: 'Masculino',
        birthDate: '1982-11-04',
        cpf: '987.654.321-00',
        rg: 'MG-9.876.543',
        motherName: 'Juliana Nefro',
        phone: '(31) 99988-7766',
        email: 'lucas.nefro@clinica.com',
        city: 'Betim',
        state: 'MG',
        address: 'Av. Amazonas, 456',
        cep: '32600-000',
        role: 'Médico Nefrologista',
        sectorId: 'medica',
        admissionDate: '2022-03-01',
        contractType: 'PJ',
        salary: 12000,
        bankName: 'Itaú',
        bankAgency: '4321',
        bankAccount: '12345-6',
        photo: '',
        dependents: [],
        warnings: [],
        vaccinations: [
          { name: 'COVID-19 Bivalente', dose: 'Reforço', date: '2024-01-15', expiryDate: '2025-01-15', lot: 'COV-BIV-12' }
        ],
        documents: []
      }
    ],
    audit_logs: [
      {
        id: 'log-audit-1',
        date: new Date().toISOString(),
        operator: 'admin@clinica.com',
        action: 'Inicialização do Sistema',
        details: 'Banco de dados local mock inicializado com sucesso.'
      }
    ]
  };
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(initialDB));
  return initialDB;
};

const setDB = (data) => {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
};

const recalculateRhIndicators = (db) => {
  if (!db.employees) db.employees = [];
  if (!db.indicator_data) db.indicator_data = [];

  const periods = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
  
  periods.forEach(period => {
    const [year, monthStr] = period.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(monthStr) - 1;

    const startDate = new Date(yearNum, monthNum, 1);
    const endDate = new Date(yearNum, monthNum + 1, 0, 23, 59, 59);

    const activeEmployees = db.employees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      if (adm > endDate) return false;
      
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        if (term < startDate) return false;
      }
      return true;
    });

    const activeCount = activeEmployees.length;

    const hires = db.employees.filter(e => {
      if (!e.admissionDate) return false;
      const adm = new Date(e.admissionDate);
      return adm >= startDate && adm <= endDate;
    }).length;

    const demissions = db.employees.filter(e => {
      if (e.status === 'Inativo' && e.terminationDate) {
        const term = new Date(e.terminationDate);
        return term >= startDate && term <= endDate;
      }
      return false;
    }).length;

    const turnoverRate = activeCount > 0 ? (((hires + demissions) / 2) / activeCount) * 100 : 0;

    let missedHours = 0;
    activeEmployees.forEach(e => {
      if (e.absences) {
        e.absences.forEach(abs => {
          if (abs.date && abs.type === 'Falta Injustificada') {
            const absDate = new Date(abs.date);
            if (absDate >= startDate && absDate <= endDate) {
              missedHours += parseFloat(abs.hours) || 0;
            }
          }
        });
      }
    });

    const absenteeismRate = activeCount > 0 ? (missedHours / (activeCount * 176)) * 100 : 0;

    const turnIndex = db.indicator_data.findIndex(d => d.indicatorId === 'taxa_turnover' && d.period === period);
    const turnEntry = {
      indicatorId: 'taxa_turnover',
      sectorId: 'rh',
      value: parseFloat(turnoverRate.toFixed(2)),
      period,
      uploadedBy: 'system-rh',
      uploadedAt: new Date().toISOString()
    };
    if (turnIndex > -1) {
      db.indicator_data[turnIndex] = turnEntry;
    } else {
      db.indicator_data.push(turnEntry);
    }

    const absIndex = db.indicator_data.findIndex(d => d.indicatorId === 'taxa_absenteismo' && d.period === period);
    const absEntry = {
      indicatorId: 'taxa_absenteismo',
      sectorId: 'rh',
      value: parseFloat(absenteeismRate.toFixed(2)),
      period,
      uploadedBy: 'system-rh',
      uploadedAt: new Date().toISOString()
    };
    if (absIndex > -1) {
      db.indicator_data[absIndex] = absEntry;
    } else {
      db.indicator_data.push(absEntry);
    }
  });
};

// Auth State Subscriptions
let authCallbacks = [];
let currentUser = null;

// Load persisted user if any
const savedUserSession = sessionStorage.getItem('sistema_indicadores_session');
if (savedUserSession) {
  const db = getDB();
  const found = db.users.find(u => u.uid === savedUserSession);
  if (found) currentUser = found;
}

const triggerAuthChange = () => {
  authCallbacks.forEach(cb => cb(currentUser));
};

export const mockAuth = {
  signInWithEmailAndPassword: async (email, password) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const cleanEmail = (email || '').trim().toLowerCase();
    const found = db.users.find(u => u.email && u.email.toLowerCase() === cleanEmail);

    let isValid = false;
    if (found) {
      const prefix = cleanEmail.split('@')[0];
      if (
        password === prefix + '123' || 
        password === 'admin123' || 
        password === '123456' || 
        password === 'nexa123' || 
        password === 'techcosta123' || 
        password === 'admin'
      ) {
        isValid = true;
      }
    }

    if (found && isValid) {
      if (found.status === 'inactive') {
        throw { code: 'auth/user-disabled', message: 'Este usuário está inativo no sistema. Procure o administrador.' };
      }
      currentUser = found;
      sessionStorage.setItem('sistema_indicadores_session', found.uid);
      triggerAuthChange();
      return { user: { uid: found.uid, email: found.email } };
    }
    throw { code: 'auth/invalid-credential', message: 'Credenciais inválidas. Verifique seu e-mail e senha.' };
  },

  signOut: async () => {
    currentUser = null;
    sessionStorage.removeItem('sistema_indicadores_session');
    triggerAuthChange();
    return true;
  },

  onAuthStateChanged: (callback) => {
    authCallbacks.push(callback);
    callback(currentUser);
    return () => {
      authCallbacks = authCallbacks.filter(cb => cb !== callback);
    };
  },

  createUser: async (email, name, role, allowedSectors = [], primaryUnit = 'betim', allowedUnits = ['betim'], extraData = {}) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const cleanEmail = (email || '').trim().toLowerCase();
    const existingIndex = db.users.findIndex(u => (u.email || '').trim().toLowerCase() === cleanEmail);
    if (existingIndex > -1) {
      db.users[existingIndex] = {
        ...db.users[existingIndex],
        name: name || db.users[existingIndex].name,
        role: role || db.users[existingIndex].role,
        allowedSectors: allowedSectors || db.users[existingIndex].allowedSectors,
        primaryUnit: primaryUnit || db.users[existingIndex].primaryUnit,
        allowedUnits: allowedUnits || db.users[existingIndex].allowedUnits,
        employeeId: extraData.employeeId !== undefined ? extraData.employeeId : db.users[existingIndex].employeeId,
        status: extraData.status || db.users[existingIndex].status || 'active',
        password: extraData.password || db.users[existingIndex].password,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return { ...db.users[existingIndex], isExisting: true };
    }
    const newUser = {
      uid: 'user-' + Math.random().toString(36).substr(2, 9),
      email: cleanEmail,
      name,
      role,
      allowedSectors: allowedSectors || [],
      primaryUnit: primaryUnit || 'betim',
      allowedUnits: allowedUnits || [primaryUnit || 'betim'],
      employeeId: extraData.employeeId || '',
      status: extraData.status || 'active',
      password: extraData.password || `${cleanEmail.split('@')[0]}123`,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    setDB(db);
    return newUser;
  }
};

export const mockFirestore = {
  // Users List
  getUsers: async () => {
    const db = getDB();
    return db.users;
  },

  updateUserPermissions: async (uid, allowedSectors) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.users.findIndex(u => u.uid === uid);
    if (index > -1) {
      db.users[index].allowedSectors = allowedSectors;
      setDB(db);
      return db.users[index];
    }
    throw new Error('Usuário não encontrado');
  },

  updateUser: async (uid, userData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    let index = db.users.findIndex(u => u.uid === uid);
    if (index === -1 && userData.email) {
      index = db.users.findIndex(u => (u.email || '').toLowerCase() === userData.email.toLowerCase());
    }
    if (index > -1) {
      db.users[index] = {
        ...db.users[index],
        ...userData,
        uid: db.users[index].uid || uid,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return db.users[index];
    }
    const newUser = {
      uid,
      ...userData,
      createdAt: new Date().toISOString()
    };
    db.users.push(newUser);
    setDB(db);
    return newUser;
  },

  deleteUser: async (uid) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.users = db.users.filter(u => u.uid !== uid);
    setDB(db);
    return { success: true };
  },

  // Sectors Methods
  getSectors: async () => {
    const db = getDB();
    const defaultSectors = [
      { id: 'administracao', name: 'Administração', description: 'Diretoria e Gestão' },
      { id: 'almoxarifado', name: 'Almoxarifado', description: 'Almoxarifado' },
      { id: 'ambulatorio', name: 'Ambulatório', description: 'Ambulatório e Consultórios' },
      { id: 'atendimento', name: 'Atendimento', description: 'Atendimento ao Paciente' },
      { id: 'clinica', name: 'Clínica', description: 'Área Clínica Geral' },
      { id: 'compras', name: 'Compras', description: 'Compras e Suprimentos' },
      { id: 'diretoria', name: 'Diretoria', description: 'Diretoria Geral' },
      { id: 'enfermagem', name: 'Enfermagem', description: 'Equipe de Enfermagem' },
      { id: 'estoque', name: 'Estoque', description: 'Controle de Estoque' },
      { id: 'farmacia', name: 'Farmácia', description: 'Farmácia Hospitalar' },
      { id: 'faturamento', name: 'Faturamento', description: 'Faturamento e APACs' },
      { id: 'financeiro', name: 'Financeiro', description: 'Financeiro e Controladoria' },
      { id: 'hemodialise', name: 'Hemodiálise', description: 'Salões de Hemodiálise' },
      { id: 'higienizacao', name: 'Higienização', description: 'Higienização e Limpeza' },
      { id: 'manutencao', name: 'Manutenção', description: 'Manutenção e Engenharia Clínica' },
      { id: 'medica', name: 'Médico', description: 'Corpo Clínico' },
      { id: 'nutricao', name: 'Nutrição', description: 'Nutrição Clínica' },
      { id: 'peritoneal', name: 'Peritoneal', description: 'Diálise Peritoneal' },
      { id: 'psicologia', name: 'Psicologia', description: 'Psicologia Clínica' },
      { id: 'qualidade', name: 'Qualidade', description: 'Qualidade e Auditoria' },
      { id: 'recepcao', name: 'Recepção', description: 'Recepção e Portaria' },
      { id: 'rh', name: 'RH', description: 'Recursos Humanos' },
      { id: 'sesmt', name: 'SESMT', description: 'Segurança do Trabalho' },
      { id: 'social', name: 'Social', description: 'Serviço Social' },
      { id: 'ti', name: 'TI', description: 'Tecnologia da Informação' }
    ].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

    db.sectors = defaultSectors;
    setDB(db);
    return db.sectors;
  },

  createSector: async (sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const id = sectorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 20);
    const newSector = {
      id: id + '_' + Math.random().toString(36).substr(2, 4),
      ...sectorData
    };
    db.sectors.push(newSector);
    setDB(db);
    return newSector;
  },

  updateSector: async (id, sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.sectors.findIndex(s => s.id === id);
    if (index > -1) {
      db.sectors[index] = { ...db.sectors[index], ...sectorData };
      setDB(db);
      return db.sectors[index];
    }
    throw new Error('Setor não encontrado');
  },

  deleteSector: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.sectors = db.sectors.filter(s => s.id !== id);
    db.indicators = db.indicators.filter(i => i.sectorId !== id);
    setDB(db);
    return { success: true };
  },

  // Access Types Methods (CRUD)
  getAccessTypes: async () => {
    const db = getDB();
    return db.accessTypes || [];
  },

  createAccessType: async (accessData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newAccess = {
      id: 'access_' + Math.random().toString(36).substr(2, 5),
      ...accessData
    };
    if (!db.accessTypes) db.accessTypes = [];
    db.accessTypes.push(newAccess);
    setDB(db);
    return newAccess;
  },

  updateAccessType: async (id, accessData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.accessTypes.findIndex(a => a.id === id);
    if (index > -1) {
      db.accessTypes[index] = { ...db.accessTypes[index], ...accessData };
      setDB(db);
      return db.accessTypes[index];
    }
    throw new Error('Tipo de acesso não encontrado');
  },

  deleteAccessType: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.accessTypes = db.accessTypes.filter(a => a.id !== id);
    setDB(db);
    return { success: true };
  },

  // Dialysis Frequencies Methods (CRUD)
  getDialysisFrequencies: async () => {
    const db = getDB();
    return db.dialysisFrequencies || [];
  },

  createDialysisFrequency: async (frequencyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newFreq = {
      id: 'freq_' + Math.random().toString(36).substr(2, 5),
      ...frequencyData
    };
    if (!db.dialysisFrequencies) db.dialysisFrequencies = [];
    db.dialysisFrequencies.push(newFreq);
    setDB(db);
    return newFreq;
  },

  updateDialysisFrequency: async (id, frequencyData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.dialysisFrequencies.findIndex(f => f.id === id);
    if (index > -1) {
      db.dialysisFrequencies[index] = { ...db.dialysisFrequencies[index], ...frequencyData };
      setDB(db);
      return db.dialysisFrequencies[index];
    }
    throw new Error('Escala de diálise não encontrada');
  },

  deleteDialysisFrequency: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.dialysisFrequencies = db.dialysisFrequencies.filter(f => f.id !== id);
    setDB(db);
    return { success: true };
  },

  // Indicators list
  getIndicators: async () => {
    const db = getDB();
    return db.indicators;
  },

  // Get indicator data history
  getIndicatorData: async (allowedSectorIds) => {
    const db = getDB();
    if (!allowedSectorIds || allowedSectorIds.length === 0) return [];
    return db.indicator_data.filter(d => allowedSectorIds.includes(d.sectorId));
  },

  // Save indicator data in batch
  saveIndicatorDataBatch: async (records, fileName, uploaderUid) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    const db = getDB();
    
    let rowsProcessed = 0;
    
    records.forEach(rec => {
      const sector = db.sectors.find(s => s.name.toLowerCase() === rec.sector.toLowerCase() || s.id === rec.sector.toLowerCase());
      if (!sector) return;

      let indicator = db.indicators.find(ind => ind.name.toLowerCase() === rec.indicatorName.toLowerCase() && ind.sectorId === sector.id);
      
      if (!indicator) {
        const indId = rec.indicatorName.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
        indicator = {
          id: indId + '_' + Math.random().toString(36).substr(2, 4),
          name: rec.indicatorName,
          sectorId: sector.id,
          unit: rec.unit || '%',
          target: parseFloat(rec.target) || 0,
          description: 'Criado via importação de arquivo'
        };
        db.indicators.push(indicator);
      }

      const existingIndex = db.indicator_data.findIndex(d => d.indicatorId === indicator.id && d.period === rec.period);
      
      const dataPoint = {
        indicatorId: indicator.id,
        sectorId: sector.id,
        value: parseFloat(rec.value),
        period: rec.period,
        uploadedBy: uploaderUid,
        uploadedAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        db.indicator_data[existingIndex] = dataPoint;
      } else {
        db.indicator_data.push(dataPoint);
      }
      rowsProcessed++;
    });

    const uploadRecord = {
      id: 'upload-' + Math.random().toString(36).substr(2, 9),
      fileName,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed
    };
    db.uploads_history.push(uploadRecord);

    setDB(db);
    return uploadRecord;
  },

  // Get upload history
  getUploadsHistory: async () => {
    const db = getDB();
    return db.uploads_history.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
  },

  // Patients Methods
  getPatients: async () => {
    const db = getDB();
    return db.patients || [];
  },

  createPatient: async (patientData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const newPatient = {
      id: 'pat-' + Math.random().toString(36).substr(2, 9),
      ...patientData,
      createdAt: new Date().toISOString()
    };
    if (!db.patients) db.patients = [];
    db.patients.push(newPatient);
    setDB(db);
    return newPatient;
  },

  updatePatient: async (id, patientData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.patients.findIndex(p => p.id === id);
    if (index > -1) {
      db.patients[index] = {
        ...db.patients[index],
        ...patientData,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return db.patients[index];
    }
    throw new Error('Paciente não encontrado');
  },

  deletePatient: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.patients = db.patients.filter(p => p.id !== id);
    setDB(db);
    return { success: true };
  },

  // Shifts Methods (CRUD)
  getShifts: async () => {
    const db = getDB();
    return db.shifts || [];
  },

  createShift: async (shiftData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newShift = {
      id: 'shift_' + Math.random().toString(36).substr(2, 5),
      ...shiftData
    };
    if (!db.shifts) db.shifts = [];
    db.shifts.push(newShift);
    setDB(db);
    return newShift;
  },

  updateShift: async (id, shiftData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.shifts.findIndex(s => s.id === id);
    if (index > -1) {
      db.shifts[index] = { ...db.shifts[index], ...shiftData };
      setDB(db);
      return db.shifts[index];
    }
    throw new Error('Turno não encontrado');
  },

  deleteShift: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.shifts = db.shifts.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  // Rooms Methods (CRUD)
  getRooms: async () => {
    const db = getDB();
    return db.rooms || [];
  },

  createRoom: async (roomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const newRoom = {
      id: 'room_' + Math.random().toString(36).substr(2, 5),
      ...roomData
    };
    if (!db.rooms) db.rooms = [];
    db.rooms.push(newRoom);
    setDB(db);
    return newRoom;
  },

  updateRoom: async (id, roomData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.rooms.findIndex(r => r.id === id);
    if (index > -1) {
      db.rooms[index] = { ...db.rooms[index], ...roomData };
      setDB(db);
      return db.rooms[index];
    }
    throw new Error('Salão não encontrado');
  },

  deleteRoom: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.rooms = db.rooms.filter(r => r.id !== id);
    setDB(db);
    return { success: true };
  },

  // Indicators management (CRUD)
  createIndicator: async (indicatorData) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    const id = indicatorData.name.toLowerCase().replace(/[^a-z0-9]/g, '_').substring(0, 30);
    const newIndicator = {
      id: id + '_' + Math.random().toString(36).substr(2, 5),
      ...indicatorData
    };
    db.indicators.push(newIndicator);
    setDB(db);
    return newIndicator;
  },

  updateIndicator: async (id, indicatorData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.indicators.findIndex(i => i.id === id);
    if (index > -1) {
      db.indicators[index] = {
        ...db.indicators[index],
        ...indicatorData
      };
      setDB(db);
      return db.indicators[index];
    }
    throw new Error('Indicador não encontrado');
  },

  deleteIndicator: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    db.indicators = db.indicators.filter(i => i.id !== id);
    db.indicator_data = db.indicator_data.filter(d => d.indicatorId !== id);
    setDB(db);
    return { success: true };
  },

  // Save single manual entry
  saveSingleIndicatorRecord: async (record, uploaderUid) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const db = getDB();
    
    const existingIndex = db.indicator_data.findIndex(
      d => d.indicatorId === record.indicatorId && d.period === record.period
    );
    
    const dataPoint = {
      indicatorId: record.indicatorId,
      sectorId: record.sectorId,
      value: parseFloat(record.value),
      period: record.period,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString()
    };

    if (existingIndex > -1) {
      db.indicator_data[existingIndex] = dataPoint;
    } else {
      db.indicator_data.push(dataPoint);
    }

    const ind = db.indicators.find(i => i.id === record.indicatorId);
    const indName = ind ? ind.name : 'Indicador';

    const uploadRecord = {
      id: 'upload-' + Math.random().toString(36).substr(2, 9),
      fileName: `Lançamento Manual: ${indName}`,
      uploadedBy: uploaderUid,
      uploadedAt: new Date().toISOString(),
      status: 'success',
      rowsProcessed: 1
    };
    db.uploads_history.push(uploadRecord);

    setDB(db);
    return dataPoint;
  },

  getCheckins: async () => {
    const db = getDB();
    return db.checkins || [];
  },

  saveCheckin: async (checkinData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.checkins) db.checkins = [];
    
    // Remove any check-in for the same patient on the same day to avoid duplicates
    const checkinDate = checkinData.date; // YYYY-MM-DD
    db.checkins = db.checkins.filter(
      c => !(c.patientId === checkinData.patientId && c.date === checkinDate)
    );

    const newCheckin = {
      id: 'chk-' + Math.random().toString(36).substr(2, 9),
      ...checkinData,
      timestamp: new Date().toISOString()
    };
    db.checkins.push(newCheckin);
    setDB(db);
    return newCheckin;
  },

  deleteCheckin: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.checkins) {
      db.checkins = db.checkins.filter(c => c.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Clinical Prescriptions
  getPrescriptions: async () => {
    const db = getDB();
    return db.prescriptions || [];
  },

  savePrescription: async (prescData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.prescriptions) db.prescriptions = [];
    const index = db.prescriptions.findIndex(p => p.patientId === prescData.patientId);
    
    const updatedPresc = {
      id: index > -1 ? db.prescriptions[index].id : 'presc-' + Math.random().toString(36).substr(2, 9),
      ...prescData,
      updatedAt: new Date().toISOString()
    };

    if (index > -1) {
      db.prescriptions[index] = updatedPresc;
    } else {
      db.prescriptions.push(updatedPresc);
    }
    setDB(db);
    return updatedPresc;
  },

  // Clinical Sessions Logs
  getSessionsLogs: async () => {
    const db = getDB();
    return db.sessions_logs || [];
  },

  saveSessionLog: async (logData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.sessions_logs) db.sessions_logs = [];
    const index = db.sessions_logs.findIndex(l => l.patientId === logData.patientId && l.date === logData.date);

    const updatedLog = {
      id: index > -1 ? db.sessions_logs[index].id : 'log-' + Math.random().toString(36).substr(2, 9),
      ...logData,
      updatedAt: new Date().toISOString()
    };

    if (index > -1) {
      db.sessions_logs[index] = updatedLog;
    } else {
      db.sessions_logs.push(updatedLog);
    }
    setDB(db);
    return updatedLog;
  },

  // Clinical Notes
  getClinicalNotes: async () => {
    const db = getDB();
    return db.clinical_notes || [];
  },

  createClinicalNote: async (noteData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.clinical_notes) db.clinical_notes = [];
    const newNote = {
      id: 'note-' + Math.random().toString(36).substr(2, 9),
      ...noteData,
      date: new Date().toISOString().substring(0, 10)
    };
    db.clinical_notes.push(newNote);
    setDB(db);
    return newNote;
  },

  deleteClinicalNote: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.clinical_notes) {
      db.clinical_notes = db.clinical_notes.filter(n => n.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Patient Medications (Intradialytic & Continuous)
  getPatientMedications: async (patientId) => {
    const db = getDB();
    if (!db.patient_medications || db.patient_medications.length === 0) {
      // Seed default nephrology medications for demo
      db.patient_medications = [
        {
          id: 'med-1',
          patientId: patientId || 'pat-1',
          name: 'Alfaepoetina (Eritropoetina Humana Recombinante)',
          dosage: '4.000 UI',
          route: 'IV (Pós-Diálise)',
          frequency: '3x por semana (Após cada sessão de HD)',
          type: 'Intradialítico',
          indication: 'Tratamento de anemia da DRC (Alvo Hb 10-12 g/dL)',
          prescriber: 'Dr. Lucas (Nefrologista)',
          status: 'Ativo',
          startDate: '2026-01-10',
          observations: 'Administrar lentamente na linha venosa ao término da sessão.'
        },
        {
          id: 'med-2',
          patientId: patientId || 'pat-1',
          name: 'Sacarato de Hidróxido de Ferro (Noripurum)',
          dosage: '100 mg (1 ampola)',
          route: 'IV (Em infusão SF 0.9% 100mL)',
          frequency: '1x por semana (Sessão de Quarta)',
          type: 'Intradialítico',
          indication: 'Reposição de ferro para atingir Ferritina > 200 ng/mL e Sat. Transf. > 20%',
          prescriber: 'Dr. Lucas (Nefrologista)',
          status: 'Ativo',
          startDate: '2026-02-01',
          observations: 'Infundir na última hora de diálise sob monitorização de pressão arterial.'
        },
        {
          id: 'med-3',
          patientId: patientId || 'pat-1',
          name: 'Carbonato de Sevelamer',
          dosage: '800 mg',
          route: 'Oral',
          frequency: '2 comprimidos 3x ao dia (junto às principais refeições)',
          type: 'Uso Domiciliar',
          indication: 'Quelante de fósforo não cálcico para controle da hiperfosfatemia',
          prescriber: 'Dra. Mariana (Nefrologista)',
          status: 'Ativo',
          startDate: '2026-01-15',
          observations: 'Tomar rigorosamente durante as refeições, não em jejum.'
        },
        {
          id: 'med-4',
          patientId: patientId || 'pat-1',
          name: 'Calcitriol',
          dosage: '0.25 mcg',
          route: 'Oral',
          frequency: '1 cápsula ao dia à noite',
          type: 'Uso Domiciliar',
          indication: 'Controle de Hiperparatireoidismo Secundário',
          prescriber: 'Dr. Lucas (Nefrologista)',
          status: 'Ativo',
          startDate: '2026-03-01',
          observations: 'Monitorar cálcio e fósforo séricos mensalmente.'
        },
        {
          id: 'med-5',
          patientId: patientId || 'pat-1',
          name: 'Anlodipino',
          dosage: '10 mg',
          route: 'Oral',
          frequency: '1x ao dia pela manhã',
          type: 'Uso Domiciliar',
          indication: 'Controle de Hipertensão Arterial Sistêmica',
          prescriber: 'Dr. Roberto (Cardiologista)',
          status: 'Ativo',
          startDate: '2025-11-20',
          observations: 'Evitar tomada imediatamente antes da sessão de diálise se houver tendência a hipotensão.'
        }
      ];
      setDB(db);
    }
    return (db.patient_medications || []).filter(m => !patientId || m.patientId === patientId);
  },

  savePatientMedication: async (medData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.patient_medications) db.patient_medications = [];
    const index = db.patient_medications.findIndex(m => m.id === medData.id);
    const updated = {
      id: medData.id || 'med-' + Math.random().toString(36).substr(2, 9),
      ...medData,
      updatedAt: new Date().toISOString()
    };
    if (index > -1) {
      db.patient_medications[index] = updated;
    } else {
      db.patient_medications.push(updated);
    }
    setDB(db);
    return updated;
  },

  deletePatientMedication: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.patient_medications) {
      db.patient_medications = db.patient_medications.filter(m => m.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Patient Lab Exams (Monthly/Quarterly Nephrology Profiles)
  getPatientLabExams: async (patientId) => {
    const db = getDB();
    if (!db.patient_lab_exams || db.patient_lab_exams.length === 0) {
      db.patient_lab_exams = [
        {
          id: 'lab-1',
          patientId: patientId || 'pat-1',
          date: '2026-08-05',
          month: '2026-08',
          hemoglobin: 11.4,
          hematocrit: 34.5,
          ferritin: 340,
          transferrinSat: 28,
          phosphorus: 4.8,
          calcium: 9.1,
          pth: 280,
          potassium: 5.1,
          ureaPre: 142,
          ureaPost: 38,
          ktv: 1.48,
          urr: 73.2,
          albumin: 3.9,
          hiv: 'Não Reagente',
          hcv: 'Não Reagente',
          hbsag: 'Não Reagente',
          antiHbs: 'Reagente (>100 UI/mL)',
          notes: 'Adequação dialítica excelente (Kt/V 1.48). Anemia compensada com EPO 4.000 UI 3x/sem.'
        },
        {
          id: 'lab-2',
          patientId: patientId || 'pat-1',
          date: '2026-07-08',
          month: '2026-07',
          hemoglobin: 10.8,
          hematocrit: 32.8,
          ferritin: 290,
          transferrinSat: 24,
          phosphorus: 5.6,
          calcium: 8.9,
          pth: 310,
          potassium: 5.4,
          ureaPre: 156,
          ureaPost: 44,
          ktv: 1.39,
          urr: 71.8,
          albumin: 3.8,
          hiv: 'Não Reagente',
          hcv: 'Não Reagente',
          hbsag: 'Não Reagente',
          antiHbs: 'Reagente (>100 UI/mL)',
          notes: 'Fósforo levemente elevado. Ajustada dose de Sevelamer para 2 cp nas principais refeições.'
        },
        {
          id: 'lab-3',
          patientId: patientId || 'pat-1',
          date: '2026-06-10',
          month: '2026-06',
          hemoglobin: 10.2,
          hematocrit: 31.0,
          ferritin: 210,
          transferrinSat: 19,
          phosphorus: 5.1,
          calcium: 9.0,
          pth: 295,
          potassium: 5.0,
          ureaPre: 138,
          ureaPost: 40,
          ktv: 1.35,
          urr: 71.0,
          albumin: 3.7,
          notes: 'Iniciado ciclo de reposição de Noripurum 100mg IV semanal por saturação de transferrina < 20%.'
        }
      ];
      setDB(db);
    }
    return (db.patient_lab_exams || []).filter(e => !patientId || e.patientId === patientId).sort((a, b) => b.date.localeCompare(a.date));
  },

  savePatientLabExam: async (examData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.patient_lab_exams) db.patient_lab_exams = [];
    const index = db.patient_lab_exams.findIndex(e => e.id === examData.id);
    const updated = {
      id: examData.id || 'lab-' + Math.random().toString(36).substr(2, 9),
      ...examData,
      updatedAt: new Date().toISOString()
    };
    if (index > -1) {
      db.patient_lab_exams[index] = updated;
    } else {
      db.patient_lab_exams.push(updated);
    }
    setDB(db);
    return updated;
  },

  deletePatientLabExam: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.patient_lab_exams) {
      db.patient_lab_exams = db.patient_lab_exams.filter(e => e.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Patient APAC & Authorization Records
  getPatientApacRecords: async (patientId) => {
    const db = getDB();
    if (!db.patient_apac_records || db.patient_apac_records.length === 0) {
      db.patient_apac_records = [
        {
          id: 'apac-1',
          patientId: patientId || 'pat-1',
          apacNumber: '31260049281-9',
          procedureCode: '03.05.01.010-7',
          procedureName: 'Hemodiálise (máximo 3 sessões por semana)',
          cid: 'N18.0 - Doença Renal Crônica Estágio 5',
          status: 'Ativo',
          startDate: '2026-06-01',
          expiryDate: '2026-08-31',
          prescribingDoctor: 'Dr. Lucas (CRM/MG 45892)',
          cnsDoctor: '704209123849102',
          clinicCnes: '2158941',
          laudoDate: '2026-05-25',
          renalEtiology: 'Nefropatia Diabética e Hipertensiva',
          vascularAccess: 'Fístula Arteriovenosa Rádio-Cefálica E',
          hepatitisBStatus: 'Imunizado (Anti-HBs > 100 UI)',
          hivStatus: 'Não Reagente',
          hcvStatus: 'Não Reagente'
        }
      ];
      setDB(db);
    }
    return (db.patient_apac_records || []).filter(a => !patientId || a.patientId === patientId);
  },

  savePatientApacRecord: async (apacData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.patient_apac_records) db.patient_apac_records = [];
    const index = db.patient_apac_records.findIndex(a => a.id === apacData.id || a.patientId === apacData.patientId);
    const updated = {
      id: apacData.id || 'apac-' + Math.random().toString(36).substr(2, 9),
      ...apacData,
      updatedAt: new Date().toISOString()
    };
    if (index > -1) {
      db.patient_apac_records[index] = updated;
    } else {
      db.patient_apac_records.push(updated);
    }
    setDB(db);
    return updated;
  },

  // ==========================================
  // NexaMED - Gestão Médica & Escalas
  // ==========================================

  getMedicalDoctors: async () => {
    const db = getDB();
    if (!db.medical_doctors || db.medical_doctors.length === 0) {
      db.medical_doctors = [
        {
          id: 'doc-1',
          name: 'Dr. Lucas Mendes',
          crm: '45892/MG',
          specialty: 'Nefrologia',
          email: 'lucas.mendes@nexaclinic.med.br',
          phone: '(31) 98765-4321',
          contractType: 'PJ',
          pixKey: '45892000182@pix.bcb.gov.br',
          bank: 'Banco do Brasil (001) Ag 1234-5 CC 45892-1',
          active: true
        },
        {
          id: 'doc-2',
          name: 'Dra. Mariana Ribeiro',
          crm: '51204/MG',
          specialty: 'Nefrologia',
          email: 'mariana.ribeiro@nexaclinic.med.br',
          phone: '(31) 99123-4567',
          contractType: 'PJ',
          pixKey: 'mariana.med@gmail.com',
          bank: 'Itaú (341) Ag 0891 CC 32104-9',
          active: true
        },
        {
          id: 'doc-3',
          name: 'Dr. Roberto Carvalho',
          crm: '39812/MG',
          specialty: 'Nefrologia',
          email: 'roberto.carvalho@nexaclinic.med.br',
          phone: '(31) 98456-7890',
          contractType: 'PJ',
          pixKey: '39812984000192',
          bank: 'Santander (033) Ag 2201 CC 98120-4',
          active: true
        },
        {
          id: 'doc-4',
          name: 'Dra. Camila Albuquerque',
          crm: '48920/MG',
          specialty: 'Nefrologia',
          email: 'camila.albuquerque@nexaclinic.med.br',
          phone: '(31) 99345-6781',
          contractType: 'CLT',
          pixKey: 'camila.albuquerque@pix.com',
          bank: 'Bradesco (237) Ag 1402 CC 89201-3',
          active: true
        },
        {
          id: 'doc-5',
          name: 'Dr. Fernando Vasconcelos',
          crm: '55431/MG',
          specialty: 'Nefrologia',
          email: 'fernando.vasconcelos@nexaclinic.med.br',
          phone: '(31) 98877-6655',
          contractType: 'PJ',
          pixKey: '5543189000109',
          bank: 'Sicoob (756) Ag 4120 CC 55431-0',
          active: true
        }
      ];
      setDB(db);
    }
    return db.medical_doctors || [];
  },

  getMedicalSettings: async () => {
    const db = getDB();
    if (!db.medical_settings) {
      db.medical_settings = {
        shiftFee: 1200.0,
        consultationFee: 150.0,
        procedureFees: {
          'Cateter Duplo Lúmen (CDL)': 450.0,
          'Implante de Permcath': 850.0,
          'Biópsia Renal': 600.0,
          'Mapeamento de Fístula AV': 300.0,
          'Curativo Especial de Acesso': 120.0,
          'Punção Biópsia / Aspiração': 350.0
        },
        cutoffDay: 25
      };
      setDB(db);
    }
    return db.medical_settings;
  },

  saveMedicalSettings: async (settingsData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    db.medical_settings = { ...db.medical_settings, ...settingsData };
    setDB(db);
    return db.medical_settings;
  },

  getMedicalSchedules: async (month) => {
    const db = getDB();
    const currentMonth = month || new Date().toISOString().substring(0, 7);
    if (!db.medical_schedules || db.medical_schedules.length === 0) {
      // Seed default monthly shifts
      const doctors = await mockFirestore.getMedicalDoctors();
      const sectors = ['Salão 1', 'Salão 2', 'Salão 3', 'Diálise Peritoneal (DP)'];
      const shifts = ['1º Turno', '2º Turno', '3º Turno'];
      const defaultSchedules = [];

      // Generate for today and surrounding days
      const today = new Date();
      const year = today.getFullYear();
      const mIdx = today.getMonth();

      for (let day = 1; day <= 28; day++) {
        const dateStr = `${year}-${String(mIdx + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        sectors.forEach((sec, sIdx) => {
          shifts.forEach((sh, shIdx) => {
            const docIdx = (day + sIdx + shIdx) % doctors.length;
            const isToday = day === today.getDate();
            defaultSchedules.push({
              id: `sch-${dateStr}-${sec.replace(/[^a-zA-Z0-9]/g, '')}-${sh.replace(/[^a-zA-Z0-9]/g, '')}`,
              month: `${year}-${String(mIdx + 1).padStart(2, '0')}`,
              date: dateStr,
              sector: sec,
              shift: sh,
              doctorId: doctors[docIdx].id,
              doctorName: doctors[docIdx].name,
              doctorCrm: doctors[docIdx].crm,
              status: 'Confirmado',
              checkinStatus: isToday ? (shIdx === 0 ? 'Presente' : 'Pendente') : (day < today.getDate() ? 'Presente' : 'Pendente'),
              checkinTime: isToday && shIdx === 0 ? '06:05' : (day < today.getDate() ? '06:00' : null),
              checkedBy: day <= today.getDate() ? 'Recepção Central' : null,
              notes: ''
            });
          });
        });
      }
      db.medical_schedules = defaultSchedules;
      setDB(db);
    }
    return (db.medical_schedules || []).filter(s => !month || s.month === month);
  },

  saveMedicalSchedule: async (shiftData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.medical_schedules) db.medical_schedules = [];
    const index = db.medical_schedules.findIndex(s => s.id === shiftData.id);
    const updated = {
      id: shiftData.id || 'sch-' + Math.random().toString(36).substr(2, 9),
      ...shiftData,
      updatedAt: new Date().toISOString()
    };
    if (index > -1) {
      db.medical_schedules[index] = updated;
    } else {
      db.medical_schedules.push(updated);
    }
    setDB(db);
    return updated;
  },

  deleteMedicalSchedule: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.medical_schedules) {
      db.medical_schedules = db.medical_schedules.filter(s => s.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  recordMedicalCheckin: async (scheduleId, checkinStatus, checkedBy, notes = '') => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.medical_schedules) return null;
    const index = db.medical_schedules.findIndex(s => s.id === scheduleId);
    if (index > -1) {
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      db.medical_schedules[index] = {
        ...db.medical_schedules[index],
        checkinStatus,
        checkinTime: checkinStatus === 'Presente' || checkinStatus === 'Atraso' ? now : null,
        checkedBy: checkedBy || 'Recepção Central',
        notes: notes || db.medical_schedules[index].notes,
        updatedAt: new Date().toISOString()
      };
      setDB(db);
      return db.medical_schedules[index];
    }
    return null;
  },

  // Swaps with Email Notifications
  getMedicalSwaps: async () => {
    const db = getDB();
    if (!db.medical_swaps || db.medical_swaps.length === 0) {
      db.medical_swaps = [
        {
          id: 'swap-1',
          requestingDoctorId: 'doc-1',
          requestingDoctorName: 'Dr. Lucas Mendes',
          targetDoctorId: 'doc-2',
          targetDoctorName: 'Dra. Mariana Ribeiro',
          scheduleId: 'sch-today-demo',
          shiftDate: new Date().toISOString().substring(0, 10),
          sector: 'Salão 1',
          shift: '2º Turno',
          reason: 'Congresso Mineiro de Nefrologia',
          status: 'Homologado',
          requestedAt: '2026-08-20T10:00:00.000Z',
          respondedAt: '2026-08-20T11:30:00.000Z',
          homologatedAt: '2026-08-20T14:00:00.000Z',
          homologatedBy: 'Dr. Roberto (Coordenador Médico)',
          emailLogs: [
            { to: 'mariana.ribeiro@nexaclinic.med.br', subject: 'Solicitação de Troca de Plantão - Dr. Lucas Mendes', date: '2026-08-20 10:00' },
            { to: 'lucas.mendes@nexaclinic.med.br', subject: 'Troca Aceita por Dra. Mariana Ribeiro', date: '2026-08-20 11:30' },
            { to: 'ambos', subject: 'Troca Homologada pela Coordenação Médica', date: '2026-08-20 14:00' }
          ]
        }
      ];
      setDB(db);
    }
    return db.medical_swaps || [];
  },

  createMedicalSwap: async (swapData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.medical_swaps) db.medical_swaps = [];
    const newSwap = {
      id: 'swap-' + Math.random().toString(36).substr(2, 9),
      ...swapData,
      status: 'Pendente',
      requestedAt: new Date().toISOString(),
      emailLogs: [
        {
          to: swapData.targetDoctorEmail || swapData.targetDoctorName,
          subject: `Solicitação de Troca de Plantão - ${swapData.requestingDoctorName}`,
          date: new Date().toLocaleString('pt-BR')
        }
      ]
    };
    db.medical_swaps.push(newSwap);
    setDB(db);
    return newSwap;
  },

  respondMedicalSwap: async (swapId, accepted) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.medical_swaps) return null;
    const index = db.medical_swaps.findIndex(s => s.id === swapId);
    if (index > -1) {
      const swap = db.medical_swaps[index];
      const newStatus = accepted ? 'Aceito' : 'Recusado';
      swap.status = newStatus;
      swap.respondedAt = new Date().toISOString();
      swap.emailLogs.push({
        to: swap.requestingDoctorName,
        subject: `Troca ${accepted ? 'Aceita' : 'Recusada'} por ${swap.targetDoctorName}`,
        date: new Date().toLocaleString('pt-BR')
      });
      setDB(db);
      return swap;
    }
    return null;
  },

  homologateMedicalSwap: async (swapId, approved, homologatedBy) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.medical_swaps) return null;
    const index = db.medical_swaps.findIndex(s => s.id === swapId);
    if (index > -1) {
      const swap = db.medical_swaps[index];
      swap.status = approved ? 'Homologado' : 'Cancelado';
      swap.homologatedAt = new Date().toISOString();
      swap.homologatedBy = homologatedBy || 'Coordenação Médica';
      swap.emailLogs.push({
        to: 'Ambos os Médicos',
        subject: `Troca ${approved ? 'Homologada' : 'Indeferida'} pela Coordenação Médica`,
        date: new Date().toLocaleString('pt-BR')
      });

      // Update the schedule to target doctor if approved
      if (approved && db.medical_schedules) {
        const schIdx = db.medical_schedules.findIndex(s => s.id === swap.scheduleId || (s.date === swap.shiftDate && s.sector === swap.sector && s.shift === swap.shift));
        if (schIdx > -1) {
          db.medical_schedules[schIdx] = {
            ...db.medical_schedules[schIdx],
            doctorId: swap.targetDoctorId,
            doctorName: swap.targetDoctorName,
            status: 'Substituído',
            notes: `Troca com ${swap.requestingDoctorName} homologada.`
          };
        }
      }
      setDB(db);
      return swap;
    }
    return null;
  },

  // Medical Procedures
  getMedicalProcedures: async (doctorId) => {
    const db = getDB();
    if (!db.medical_procedures || db.medical_procedures.length === 0) {
      db.medical_procedures = [
        {
          id: 'proc-1',
          doctorId: 'doc-1',
          doctorName: 'Dr. Lucas Mendes',
          patientId: 'pat-1',
          patientName: 'ADAIR PRAXEDES MORENO',
          date: '2026-08-10',
          procedureType: 'Cateter Duplo Lúmen (CDL)',
          value: 450.0,
          status: 'Auditado',
          notes: 'Implante em Veia Jugular Interna D guiado por ultrassom.'
        },
        {
          id: 'proc-2',
          doctorId: 'doc-1',
          doctorName: 'Dr. Lucas Mendes',
          patientId: 'pat-2',
          patientName: 'ADAO LUCIANO DIAS',
          date: '2026-08-14',
          procedureType: 'Mapeamento de Fístula AV',
          value: 300.0,
          status: 'Auditado',
          notes: 'Avaliação de fluxo de FAV rádio-cefálica com Doppler.'
        },
        {
          id: 'proc-3',
          doctorId: 'doc-2',
          doctorName: 'Dra. Mariana Ribeiro',
          patientId: 'pat-3',
          patientName: 'ADCELIO BARBOSA DE OLIVEIRA',
          date: '2026-08-18',
          procedureType: 'Implante de Permcath',
          value: 850.0,
          status: 'Auditado',
          notes: 'Permcath tunelizado em Jugular D com bom fluxo.'
        }
      ];
      setDB(db);
    }
    return (db.medical_procedures || []).filter(p => !doctorId || p.doctorId === doctorId);
  },

  saveMedicalProcedure: async (procData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.medical_procedures) db.medical_procedures = [];
    const settings = await mockFirestore.getMedicalSettings();
    const val = procData.value || settings.procedureFees[procData.procedureType] || 350.0;

    const newProc = {
      id: procData.id || 'proc-' + Math.random().toString(36).substr(2, 9),
      ...procData,
      value: parseFloat(val),
      status: procData.status || 'Realizado',
      createdAt: new Date().toISOString()
    };
    const index = db.medical_procedures.findIndex(p => p.id === procData.id);
    if (index > -1) {
      db.medical_procedures[index] = newProc;
    } else {
      db.medical_procedures.push(newProc);
    }
    setDB(db);
    return newProc;
  },

  deleteMedicalProcedure: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.medical_procedures) {
      db.medical_procedures = db.medical_procedures.filter(p => p.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  // Monthly Production Homologation & Finance Integration
  getMedicalProductions: async (month) => {
    const db = getDB();
    return (db.medical_productions || []).filter(p => !month || p.month === month);
  },

  homologateMedicalProduction: async (productionData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.medical_productions) db.medical_productions = [];
    if (!db.accounts_payable) db.accounts_payable = [];

    const existingIdx = db.medical_productions.findIndex(p => p.month === productionData.month && p.doctorId === productionData.doctorId);

    // 1. Create title in Accounts Payable (NexaFINANCE)
    const payableTitle = {
      id: 'pay-med-' + Math.random().toString(36).substr(2, 9),
      supplierName: productionData.doctorName,
      cnpj: productionData.doctorCrm || 'CRM ' + productionData.doctorName,
      category: 'Honorários Médicos',
      costCenter: 'Corpo Clínico & Nefrologia',
      description: `Repasse Honorários ${productionData.month} - ${productionData.shiftsCount} Plantões, ${productionData.consultationsCount} Consultas, ${productionData.proceduresCount} Procedimentos`,
      amount: parseFloat(productionData.netTotal || productionData.grossTotal),
      dueDate: `${productionData.month}-30`,
      status: 'pending',
      paymentMethod: 'PIX',
      pixKey: productionData.pixKey || 'Chave cadastrada no NexaMED',
      createdAt: new Date().toISOString()
    };
    db.accounts_payable.push(payableTitle);

    // 2. Save Medical Production Record
    const prodRecord = {
      id: existingIdx > -1 ? db.medical_productions[existingIdx].id : 'prod-' + Math.random().toString(36).substr(2, 9),
      ...productionData,
      status: 'Homologado',
      payableId: payableTitle.id,
      homologatedAt: new Date().toISOString()
    };

    if (existingIdx > -1) {
      db.medical_productions[existingIdx] = prodRecord;
    } else {
      db.medical_productions.push(prodRecord);
    }

    setDB(db);
    return { production: prodRecord, payable: payableTitle };
  },

  // Stock/Inventory Items
  getInventoryItems: async () => {
    const db = getDB();
    return db.inventory_items || [];
  },

  createInventoryItem: async (itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.inventory_items) db.inventory_items = [];
    const newItem = {
      id: 'item-' + Math.random().toString(36).substr(2, 9),
      ...itemData,
      currentStock: parseFloat(itemData.currentStock) || 0,
      minStock: parseFloat(itemData.minStock) || 0,
      price: parseFloat(itemData.price) || 0
    };
    db.inventory_items.push(newItem);
    setDB(db);
    return newItem;
  },

  updateInventoryItem: async (id, itemData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    const index = db.inventory_items.findIndex(i => i.id === id);
    if (index > -1) {
      db.inventory_items[index] = {
        ...db.inventory_items[index],
        ...itemData,
        currentStock: parseFloat(itemData.currentStock) || 0,
        minStock: parseFloat(itemData.minStock) || 0,
        price: parseFloat(itemData.price) || 0
      };
      setDB(db);
      return db.inventory_items[index];
    }
    throw new Error('Item não encontrado');
  },

  // Stock Transactions
  getStockTransactions: async () => {
    const db = getDB();
    return db.stock_transactions || [];
  },

  createStockTransaction: async (txData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.stock_transactions) db.stock_transactions = [];
    if (!db.inventory_items) db.inventory_items = [];

    const newTx = {
      id: 'tx-' + Math.random().toString(36).substr(2, 9),
      ...txData,
      quantity: parseFloat(txData.quantity) || 0,
      date: new Date().toISOString()
    };

    // Update item stock based on transaction type
    const itemIndex = db.inventory_items.findIndex(i => i.id === txData.itemId);
    if (itemIndex > -1) {
      const current = parseFloat(db.inventory_items[itemIndex].currentStock) || 0;
      const change = parseFloat(txData.quantity) || 0;
      if (txData.type === 'Entrada') {
        db.inventory_items[itemIndex].currentStock = current + change;
      } else {
        db.inventory_items[itemIndex].currentStock = Math.max(0, current - change);
      }
    }

    db.stock_transactions.push(newTx);
    setDB(db);
    return newTx;
  },

  // Suppliers CRUD
  getSuppliers: async () => {
    const db = getDB();
    return db.suppliers || [];
  },

  createSupplier: async (supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.suppliers) db.suppliers = [];
    const newSupplier = {
      id: 'sup-' + Math.random().toString(36).substr(2, 9),
      ...supplierData
    };
    db.suppliers.push(newSupplier);
    setDB(db);
    return newSupplier;
  },

  updateSupplier: async (id, supplierData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.suppliers.findIndex(s => s.id === id);
    if (index > -1) {
      db.suppliers[index] = { ...db.suppliers[index], ...supplierData };
      setDB(db);
      return db.suppliers[index];
    }
    throw new Error('Fornecedor não encontrado');
  },

  // Stock Sectors CRUD
  getStockSectors: async () => {
    const db = getDB();
    return db.stock_sectors || [];
  },

  createStockSector: async (sectorData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.stock_sectors) db.stock_sectors = [];
    const newSector = {
      id: 'sec-stock-' + Math.random().toString(36).substr(2, 9),
      ...sectorData
    };
    db.stock_sectors.push(newSector);
    setDB(db);
    return newSector;
  },

  deleteInventoryItem: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.inventory_items) db.inventory_items = db.inventory_items.filter(i => i.id !== id);
    setDB(db);
    return { success: true };
  },

  deleteSupplier: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.suppliers) db.suppliers = db.suppliers.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  deleteStockSector: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_sectors) db.stock_sectors = db.stock_sectors.filter(s => s.id !== id);
    setDB(db);
    return { success: true };
  },

  // Stock Loans API (Empréstimos de Produtos / Medicamentos)
  getStockLoans: async () => {
    const db = getDB();
    if (!db.stock_loans || db.stock_loans.length === 0) {
      db.stock_loans = [
        {
          id: 'loan-1',
          type: 'Concedido', // Concedido para Terceiros
          productName: 'Erythropoietin (Epoetina) 4000UI',
          quantity: 10,
          unit: 'Caixa(s)',
          partnerName: 'Hospital São Lucas - BH',
          loanDate: '2026-07-20',
          expectedReturnDate: '2026-08-05',
          status: 'Ativo',
          notes: 'Empréstimo emergencial concedido para UTI do hospital.'
        },
        {
          id: 'loan-2',
          type: 'Recebido', // Recebido de Terceiros
          productName: 'Dialisador Capilar High-Flux 1.8m2',
          quantity: 5,
          unit: 'Unidade(s)',
          partnerName: 'Clínica NefroVida Contagem',
          loanDate: '2026-07-22',
          expectedReturnDate: '2026-08-10',
          status: 'Ativo',
          notes: 'Empréstimo recebido para suprir atraso do fornecedor.'
        }
      ];
      setDB(db);
    }
    return db.stock_loans;
  },

  saveStockLoan: async (loanData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.stock_loans) db.stock_loans = [];

    const isEdit = !!loanData.id;
    const loanId = loanData.id || 'loan-' + Math.random().toString(36).substr(2, 9);

    const updatedLoan = {
      ...loanData,
      id: loanId,
      quantity: parseFloat(loanData.quantity) || 0,
      status: loanData.status || 'Ativo',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.stock_loans.findIndex(l => l.id === loanId);
      if (idx > -1) db.stock_loans[idx] = updatedLoan;
    } else {
      db.stock_loans.push(updatedLoan);
    }

    setDB(db);
    return updatedLoan;
  },

  returnStockLoan: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_loans) {
      const idx = db.stock_loans.findIndex(l => l.id === id);
      if (idx > -1) {
        db.stock_loans[idx].status = 'Devolvido';
        db.stock_loans[idx].returnDate = new Date().toISOString().substring(0, 10);
      }
    }
    setDB(db);
    return { success: true };
  },

  deleteStockLoan: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.stock_loans) {
      db.stock_loans = db.stock_loans.filter(l => l.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Product Categories API (Gerenciamento Centralizado no Módulo T.I)
  getProductCategories: async () => {
    const db = getDB();
    if (!db.product_categories || db.product_categories.length === 0) {
      db.product_categories = [
        { id: 'cat-1', name: 'Insumo Clínico', module: 'Estoque', description: 'Linhas de sangue, dialisadores, agulhas de fístula' },
        { id: 'cat-2', name: 'Concentrado', module: 'Estoque', description: 'Solução ácida, bicarbonato de sódio para diálise' },
        { id: 'cat-3', name: 'Medicamento', module: 'Estoque', description: 'Epoetina, ferro injetável, calcitriol, heparina' },
        { id: 'cat-4', name: 'Material Médico', module: 'Estoque', description: 'Gaze, luvas estéreis, seringas, esparadrapos' },
        { id: 'cat-5', name: 'Equipamento', module: 'Estoque/Financeiro', description: 'Peças de reposição e bombas de hemodiálise' },
        { id: 'cat-6', name: 'Serviço/Utilidades', module: 'Financeiro', description: 'Energia elétrica, água, manutenção preventiva' }
      ];
      setDB(db);
    }
    return db.product_categories;
  },

  saveProductCategory: async (catData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.product_categories) db.product_categories = [];

    const isEdit = !!catData.id;
    const catId = catData.id || 'cat-' + Math.random().toString(36).substr(2, 9);

    const updatedCat = {
      ...catData,
      id: catId,
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.product_categories.findIndex(c => c.id === catId);
      if (idx > -1) db.product_categories[idx] = updatedCat;
    } else {
      db.product_categories.push(updatedCat);
    }

    setDB(db);
    return updatedCat;
  },

  deleteProductCategory: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.product_categories) {
      db.product_categories = db.product_categories.filter(c => c.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Purchase Invoices CRUD
  getPurchaseInvoices: async () => {
    const db = getDB();
    return db.purchase_invoices || [];
  },

  createPurchaseInvoice: async (invoiceData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.purchase_invoices) db.purchase_invoices = [];
    if (!db.stock_transactions) db.stock_transactions = [];
    if (!db.inventory_items) db.inventory_items = [];

    const newInvoice = {
      id: 'inv-' + Math.random().toString(36).substr(2, 9),
      ...invoiceData,
      entryDate: new Date().toISOString().substring(0, 10),
      status: 'Processada'
    };

    // Auto-create transactions and increment stock level
    for (const item of (invoiceData.items || [])) {
      const newTx = {
        id: 'tx-' + Math.random().toString(36).substr(2, 9),
        itemId: item.itemId,
        itemName: item.name,
        quantity: parseFloat(item.quantity) || 0,
        type: 'Entrada',
        batch: item.batch || 'XML-IMPORT',
        expiryDate: item.expiryDate || '',
        operator: 'Importador XML',
        date: new Date().toISOString(),
        notes: `Entrada via NF-e ${invoiceData.number}`
      };
      db.stock_transactions.push(newTx);

      const itemIndex = db.inventory_items.findIndex(i => i.id === item.itemId);
      if (itemIndex > -1) {
        const current = parseFloat(db.inventory_items[itemIndex].currentStock) || 0;
        db.inventory_items[itemIndex].currentStock = current + newTx.quantity;
      }
    }

    db.purchase_invoices.push(newInvoice);
    setDB(db);
    return newInvoice;
  },

  // Employees CRUD
  getEmployees: async () => {
    const db = getDB();
    return db.employees || [];
  },

  createEmployee: async (employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const db = getDB();
    if (!db.employees) db.employees = [];
    const newEmployee = {
      id: 'emp-' + Math.random().toString(36).substr(2, 9),
      ...employeeData,
      status: employeeData.status || 'Ativo',
      terminationDate: employeeData.terminationDate || '',
      absences: employeeData.absences || [],
      warnings: employeeData.warnings || [],
      vaccinations: employeeData.vaccinations || [],
      documents: employeeData.documents || [],
      dependents: employeeData.dependents || []
    };
    db.employees.push(newEmployee);
    recalculateRhIndicators(db);
    setDB(db);
    return newEmployee;
  },

  updateEmployee: async (id, employeeData) => {
    await new Promise(resolve => setTimeout(resolve, 350));
    const db = getDB();
    const index = db.employees.findIndex(e => e.id === id);
    if (index > -1) {
      const old = db.employees[index];
      db.employees[index] = {
        ...old,
        ...employeeData,
        status: employeeData.status || old.status || 'Ativo',
        terminationDate: employeeData.terminationDate !== undefined ? employeeData.terminationDate : (old.terminationDate || ''),
        absences: employeeData.absences !== undefined ? employeeData.absences : (old.absences || []),
        dependents: employeeData.dependents !== undefined ? employeeData.dependents : (old.dependents || []),
        warnings: employeeData.warnings !== undefined ? employeeData.warnings : (old.warnings || []),
        vaccinations: employeeData.vaccinations !== undefined ? employeeData.vaccinations : (old.vaccinations || []),
        documents: employeeData.documents !== undefined ? employeeData.documents : (old.documents || [])
      };
      recalculateRhIndicators(db);
      setDB(db);
      return db.employees[index];
    }
    throw new Error('Funcionário não encontrado');
  },

  deleteEmployee: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.employees) {
      db.employees = db.employees.filter(e => e.id !== id);
      recalculateRhIndicators(db);
      setDB(db);
    }
    return { success: true };
  },

  // Transport Vouchers CRUD
  getTransportVouchers: async () => {
    const db = getDB();
    return db.transport_vouchers || [];
  },

  createTransportVoucher: async (voucherData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.transport_vouchers) db.transport_vouchers = [];
    const newVoucher = {
      id: 'vt-' + Math.random().toString(36).substr(2, 9),
      ...voucherData,
      dailyCost: parseFloat(voucherData.dailyCost) || 0,
      daysCount: parseInt(voucherData.daysCount) || 0,
      totalValue: (parseFloat(voucherData.dailyCost) || 0) * (parseInt(voucherData.daysCount) || 0),
      discountPercent: parseFloat(voucherData.discountPercent) || 6
    };
    db.transport_vouchers.push(newVoucher);
    setDB(db);
    return newVoucher;
  },

  updateTransportVoucher: async (id, voucherData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    const index = db.transport_vouchers.findIndex(v => v.id === id);
    if (index > -1) {
      const old = db.transport_vouchers[index];
      db.transport_vouchers[index] = {
        ...old,
        ...voucherData,
        dailyCost: parseFloat(voucherData.dailyCost) || 0,
        daysCount: parseInt(voucherData.daysCount) || 0,
        totalValue: (parseFloat(voucherData.dailyCost) || 0) * (parseInt(voucherData.daysCount) || 0),
        discountPercent: parseFloat(voucherData.discountPercent) || 6
      };
      setDB(db);
      return db.transport_vouchers[index];
    }
    throw new Error('Vale-Transporte não encontrado');
  },

  deleteTransportVoucher: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 250));
    const db = getDB();
    if (db.transport_vouchers) {
      db.transport_vouchers = db.transport_vouchers.filter(v => v.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  importTransportVouchersBatch: async (period, vouchersList) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.transport_vouchers) db.transport_vouchers = [];
    if (!db.employees) db.employees = [];

    // Filter out previous vouchers for this period
    db.transport_vouchers = db.transport_vouchers.filter(v => v.period !== period);

    const newItems = vouchersList.map((v, idx) => {
      let empName = (v.employeeName || v.name || 'Sem Nome').trim();
      let emp = db.employees.find(e => e.name && e.name.trim().toLowerCase() === empName.toLowerCase());
      if (!emp && empName) {
        emp = {
          id: 'emp-imp-' + Math.random().toString(36).substr(2, 7),
          name: empName.toUpperCase(),
          role: 'Colaborador CLT',
          sectorId: 'rh',
          admissionDate: new Date().toISOString().split('T')[0],
          contractType: 'CLT',
          salary: 2500,
          status: 'Ativo',
          city: 'Betim',
          state: 'MG'
        };
        db.employees.push(emp);
      }

      const ida = parseFloat(v.idaCost || v.ida) || 0;
      const volta = parseFloat(v.voltaCost || v.volta) || 0;
      const daily = parseFloat(v.dailyCost || v.totalDia) || (ida + volta);
      const expected = parseFloat(v.expectedValue || v.previsto) || 0;
      const prevBal = parseFloat(v.balancePrevious || v.noCartao) || 0;
      const currBal = parseFloat(v.currentBalance || v.cartao) || 0;
      const req = parseFloat(v.rechargeNeeded || v.recarga) || 0;

      return {
        id: 'vt-' + period.replace('-', '') + '-' + (idx + 1),
        employeeId: emp ? emp.id : '',
        employeeName: empName.toUpperCase(),
        route: v.route || 'Linha Urbana',
        idaCost: ida,
        voltaCost: volta,
        dailyCost: daily,
        workSchedule: v.workSchedule || v.escala || 'SEGUNDA A SÁBADO',
        expectedValue: expected,
        daysCount: parseInt(v.daysCount) || (v.workSchedule === '2ª A 6ª' ? 21 : (v.workSchedule === '12X36' ? 16 : 26)),
        totalValue: expected,
        balancePrevious: prevBal,
        currentBalance: currBal,
        rechargeNeeded: Math.max(0, req),
        rawRechargeNeeded: req,
        cardType: v.cardType || 'BetimCARD / BHBus',
        cardNumber: v.cardNumber || '',
        period: period,
        highlightType: v.highlightType || (req < 0 ? 'yellow' : (prevBal === 0 && currBal === 0 ? 'orange' : null)),
        discountPercent: 6
      };
    });

    db.transport_vouchers.push(...newItems);
    setDB(db);
    return newItems;
  },

  // Audit Logs
  getAuditLogs: async () => {
    const db = getDB();
    const logs = db.audit_logs || [];
    return logs.map(l => (l.operator === 'rh@clinica.com' ? { ...l, operator: 'Ana Carolina Cerqueira Gonzaga' } : l));
  },

  createAuditLog: async (logData) => {
    const db = getDB();
    if (!db.audit_logs) db.audit_logs = [];
    const newLog = {
      id: 'log-audit-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      ...logData
    };
    db.audit_logs.push(newLog);
    setDB(db);
    return newLog;
  },

  // Financial management
  getCostCenters: async () => {
    const db = getDB();
    if (!db.cost_centers || db.cost_centers.length === 0) {
      db.cost_centers = [
        { id: '1.1', code: '1.1', name: 'Insumos Dialíticos & Linhas de Sangue', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.2', code: '1.2', name: 'Farmácia Clínica & Medicamentos (MatMed)', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.3', code: '1.3', name: 'Concentrados & Soluções para Diálise', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.4', code: '1.4', name: 'Laboratório & Análises Clínicas Especializadas', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.5', code: '1.5', name: 'Gases Medicinais & Oxigenoterapia', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.6', code: '1.6', name: 'Tratamento de Água & Osmose Reversa', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.7', code: '1.7', name: 'Enfermagem & Assistência Multidisciplinar', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.8', code: '1.8', name: 'Honorários Médicos & Nefrologia PJ', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '1.9', code: '1.9', name: 'Diálise Peritoneal (DP / DPA)', parentId: '1', parentName: '1. OPERACIONAL CLÍNICO & ASSISTENCIAL', unit: 'Betim' },
        { id: '2.1', code: '2.1', name: 'Energia Elétrica & Gerador', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.2', code: '2.2', name: 'Água Potável & Efluentes Hospitalares', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.3', code: '2.3', name: 'Engenharia Clínica & Manutenção de Máquinas', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.4', code: '2.4', name: 'Manutenção Predial & Climatização (HVAC)', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.5', code: '2.5', name: 'Higienização, Limpeza & Desinfecção Hospitalar', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.6', code: '2.6', name: 'Gestão de Resíduos Infectantes (RSS / Lixo Hospitalar)', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.7', code: '2.7', name: 'Lavanderia & Enxoval Hospitalar', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '2.8', code: '2.8', name: 'Nutrição, Dietética & Copa dos Pacientes', parentId: '2', parentName: '2. INFRAESTRUTURA, HOTELARIA & UTILIDADES', unit: 'Betim' },
        { id: '3.1', code: '3.1', name: 'Folha de Pagamento Salarial (CLT)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.2', code: '3.2', name: 'Encargos Trabalhistas (FGTS, INSS, PIS)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.3', code: '3.3', name: 'Benefícios (Vale Transporte, Alimentação, Plano de Saúde)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.4', code: '3.4', name: 'Segurança do Trabalho & Saúde Ocupacional (SESMT, EPIs, PCMSO)', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '3.5', code: '3.5', name: 'Educação Continuada, Treinamentos & SIPAT', parentId: '3', parentName: '3. RECURSOS HUMANOS & GESTÃO DE PESSOAS', unit: 'Betim' },
        { id: '4.1', code: '4.1', name: 'Tecnologia da Informação (TI), Softwares & Nuvem', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.2', code: '4.2', name: 'Contabilidade, Auditoria & Consultoria Financeira', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.3', code: '4.3', name: 'Assessoria Jurídica, Contratos & Compliance', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.4', code: '4.4', name: 'Anuidades & Licenças Regulatórias (CRM, COREN, CRF, VISA, ANVISA)', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.5', code: '4.5', name: 'Aluguel, IPTU, Condomínio & Seguros Patrimoniais', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '4.6', code: '4.6', name: 'Material de Escritório, Gráfica & Despesas Administrativas', parentId: '4', parentName: '4. GOVERNANÇA, ADMINISTRATIVO & TI', unit: 'Betim' },
        { id: '5.1', code: '5.1', name: 'Tributos e Impostos (ISS, PIS/COFINS, IRPJ, CSLL)', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' },
        { id: '5.2', code: '5.2', name: 'Despesas, Tarifas & Juros Bancários', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' },
        { id: '5.3', code: '5.3', name: 'Transporte de Pacientes, Ambulância & Logística', parentId: '5', parentName: '5. FINANCEIRO, FISCAL & LOGÍSTICA', unit: 'Betim' }
      ];
      setDB(db);
    }
    return db.cost_centers;
  },

  getBudgetPlans: async () => {
    const db = getDB();
    if (!db.budget_plans) {
      db.budget_plans = [];
      setDB(db);
    }
    return db.budget_plans;
  },

  saveBudgetPlan: async (plan) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.budget_plans) db.budget_plans = [];
    let updated;
    if (plan.id) {
      const idx = db.budget_plans.findIndex(b => b.id === plan.id);
      if (idx > -1) {
        db.budget_plans[idx] = { ...db.budget_plans[idx], ...plan };
        updated = db.budget_plans[idx];
      }
    } else {
      updated = { id: 'bp-' + Math.random().toString(36).substr(2, 9), ...plan };
      db.budget_plans.push(updated);
    }
    setDB(db);
    return updated;
  },

  getAgreements: async () => {
    const db = getDB();
    if (!db.agreements || db.agreements.length === 0) {
      db.agreements = [
        {
          id: 'agr-1',
          supplier: 'LACERDA ALIMENTAÇÃO',
          unit: 'Betim',
          totalAmount: 152185.80,
          installmentCount: 6,
          installmentAmount: 25364.30,
          paidInstallments: 3,
          dueDay: 10,
          status: 'Ativo',
          notes: 'Acordo referente a fornecimento de marmitas e lanches clínicos'
        },
        {
          id: 'agr-2',
          supplier: 'FARMARIN INDUSTRIA E COMERCIO LTDA',
          unit: 'Betim',
          totalAmount: 354371.22,
          installmentCount: 14,
          installmentAmount: 25312.23,
          paidInstallments: 2,
          dueDay: 2,
          status: 'Ativo',
          notes: 'Renegociação de fornecimento de concentrados e capilares'
        }
      ];
      setDB(db);
    }
    return db.agreements;
  },

  saveAgreement: async (agr) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.agreements) db.agreements = [];
    let updated;
    if (agr.id) {
      const idx = db.agreements.findIndex(a => a.id === agr.id);
      if (idx > -1) {
        db.agreements[idx] = { ...db.agreements[idx], ...agr };
        updated = db.agreements[idx];
      }
    } else {
      updated = { id: 'agr-' + Math.random().toString(36).substr(2, 9), ...agr };
      db.agreements.push(updated);
    }
    setDB(db);
    return updated;
  },

  getAccountsPayable: async () => {
    const db = getDB();
    if (!db.accounts_payable) {
      db.accounts_payable = [];
      setDB(db);
    }
    return db.accounts_payable;
  },

  saveAccountsPayable: async (item) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.accounts_payable) db.accounts_payable = [];
    
    let updatedItem;
    if (item.id) {
      const idx = db.accounts_payable.findIndex(p => p.id === item.id);
      if (idx > -1) {
        db.accounts_payable[idx] = { ...db.accounts_payable[idx], ...item };
        updatedItem = db.accounts_payable[idx];
      }
    } else {
      updatedItem = {
        id: 'pay-' + Math.random().toString(36).substr(2, 9),
        ...item,
        status: item.status || 'Pendente'
      };
      db.accounts_payable.push(updatedItem);
    }
    setDB(db);
    return updatedItem;
  },

  deleteAccountsPayable: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.accounts_payable) {
      db.accounts_payable = db.accounts_payable.filter(p => p.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  getAccountsReceivable: async () => {
    const db = getDB();
    return db.accounts_receivable || [];
  },

  saveAccountsReceivable: async (item) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.accounts_receivable) db.accounts_receivable = [];
    
    let updatedItem;
    if (item.id) {
      const idx = db.accounts_receivable.findIndex(r => r.id === item.id);
      if (idx > -1) {
        db.accounts_receivable[idx] = { ...db.accounts_receivable[idx], ...item };
        updatedItem = db.accounts_receivable[idx];
      }
    } else {
      updatedItem = {
        id: 'rec-' + Math.random().toString(36).substr(2, 9),
        ...item,
        status: item.status || 'Pendente'
      };
      db.accounts_receivable.push(updatedItem);
    }
    setDB(db);
    return updatedItem;
  },

  deleteAccountsReceivable: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.accounts_receivable) {
      db.accounts_receivable = db.accounts_receivable.filter(r => r.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  getXmlImports: async () => {
    const db = getDB();
    return db.xml_imports || [];
  },

  saveXmlImport: async (xmlData) => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const db = getDB();
    if (!db.xml_imports) db.xml_imports = [];
    
    const newXml = {
      id: 'xml-' + Math.random().toString(36).substr(2, 9),
      filename: xmlData.filename,
      supplier: xmlData.supplier,
      invoiceNumber: xmlData.invoiceNumber,
      amount: parseFloat(xmlData.amount),
      importDate: new Date().toISOString(),
      status: 'Conciliado'
    };
    db.xml_imports.push(newXml);

    // Also automatically create a Bill Payable linked to this XML
    if (!db.accounts_payable) db.accounts_payable = [];
    const newBill = {
      id: 'pay-' + Math.random().toString(36).substr(2, 9),
      supplier: xmlData.supplier,
      cnpj: xmlData.cnpj || '12.345.678/0001-90',
      description: `Importação XML NF-e ${xmlData.invoiceNumber}`,
      amount: parseFloat(xmlData.amount),
      dueDate: xmlData.dueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10), // 15 days from now
      status: 'Pendente',
      category: 'Insumo Clínico',
      invoiceNumber: xmlData.invoiceNumber,
      paymentDate: ''
    };
    db.accounts_payable.push(newBill);
    
    setDB(db);
    return { success: true, bill: newBill, xml: newXml };
  },

  // Tenant Settings (SaaS Configurations)
  getTenantSettings: async () => {
    const db = getDB();
    return db.tenant_settings || { 
      name: 'Nexa Nefrologia', 
      cnpj: '', 
      logo: '', 
      themeColor: '#ec4899',
      blockRequisitionZeroStock: true,
      requisitionTTLHours: 1
    };
  },

  saveTenantSettings: async (settings) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    db.tenant_settings = { ...(db.tenant_settings || {}), ...settings };
    setDB(db);
    return db.tenant_settings;
  },

  // User Profiles (RBAC Roles)
  getUserProfiles: async () => {
    const db = getDB();
    return db.user_profiles || [];
  },

  saveUserProfile: async (profile) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.user_profiles) db.user_profiles = [];
    const index = db.user_profiles.findIndex(p => p.id === profile.id);
    if (index > -1) {
      db.user_profiles[index] = { ...db.user_profiles[index], ...profile };
    } else {
      db.user_profiles.push(profile);
    }
    setDB(db);
    return profile;
  },

  // Backup and Restore
  exportBackup: async () => {
    const db = getDB();
    return JSON.stringify(db);
  },

  importBackup: async (backupJson) => {
    await new Promise(resolve => setTimeout(resolve, 800));
    try {
      const parsed = JSON.parse(backupJson);
      if (parsed.users && parsed.employees) {
        setDB(parsed);
        return { success: true };
      }
      throw new Error('Formato de backup inválido.');
    } catch (err) {
      throw new Error('Falha ao restaurar backup: ' + err.message);
    }
  },

  // Debts and Installments API
  getDebts: async () => {
    const db = getDB();
    if (!db.debts) {
      db.debts = [];
      setDB(db);
    }
    return db.debts;
  },

  saveDebt: async (debtData) => {
    await new Promise(resolve => setTimeout(resolve, 400));
    const db = getDB();
    if (!db.debts) db.debts = [];
    if (!db.accounts_payable) db.accounts_payable = [];

    const isEdit = !!debtData.id;
    const debtId = debtData.id || 'debt-' + Math.random().toString(36).substr(2, 9);
    
    const count = parseInt(debtData.installmentCount) || 1;
    const totalVal = parseFloat(debtData.totalAmount) || 0;
    const instVal = parseFloat(debtData.installmentAmount) || (totalVal / count);

    const updatedDebt = {
      ...debtData,
      id: debtId,
      totalAmount: totalVal,
      installmentCount: count,
      installmentAmount: instVal,
      status: debtData.status || 'Ativo',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.debts.findIndex(d => d.id === debtId);
      if (idx > -1) db.debts[idx] = updatedDebt;
    } else {
      db.debts.push(updatedDebt);

      // AUTOMATICALLY GENERATE N MONTHLY INSTALLMENTS IN ACCOUNTS PAYABLE
      const firstDate = new Date(debtData.firstDueDate || Date.now());
      for (let i = 0; i < count; i++) {
        const dueDate = new Date(firstDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        const padInst = String(i + 1).padStart(2, '0');
        const padCount = String(count).padStart(2, '0');

        db.accounts_payable.push({
          id: `pay-${debtId}-inst-${i + 1}`,
          debtId: debtId,
          supplier: debtData.creditor,
          cnpj: debtData.cnpj || '00.000.000/0001-00',
          description: `Dívida: ${debtData.creditor} (Parc. ${padInst}/${padCount})`,
          amount: instVal,
          dueDate: dueDate.toISOString().substring(0, 10),
          category: debtData.category || 'Equipamento',
          invoiceNumber: `DIV-${debtId.substring(0, 6)}-${padInst}`,
          status: 'Pendente',
          paymentDate: ''
        });
      }
    }

    setDB(db);
    return updatedDebt;
  },

  deleteDebt: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.debts) {
      db.debts = db.debts.filter(d => d.id !== id);
    }
    if (db.accounts_payable) {
      db.accounts_payable = db.accounts_payable.filter(p => p.debtId !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Bank Statement Reconciliation API
  getBankStatements: async () => {
    const db = getDB();
    if (!db.bank_statements) {
      db.bank_statements = [];
      setDB(db);
    }
    return db.bank_statements;
  },

  saveBankStatement: async (statementData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.bank_statements) db.bank_statements = [];
    const newTx = {
      id: 'bank-' + Math.random().toString(36).substr(2, 9),
      ...statementData,
      status: statementData.status || 'Pendente'
    };
    db.bank_statements.push(newTx);
    setDB(db);
    return newTx;
  },

  // Material Requisitions API (Salão de Hemodiálise & Estoque)
  getMaterialRequisitions: async () => {
    const db = getDB();
    if (!db.material_requisitions) {
      db.material_requisitions = [
        {
          id: 'req-1',
          requisitionCode: 'REQ-2026-0001',
          requestedBy: 'Ana Clara (Técnica)',
          userId: 'user-tech-1',
          patientId: 'pat-1',
          patientName: 'ADAIR PRAXEDES MORENO',
          status: 'Pendente',
          createdAt: new Date(Date.now() - 1800000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
          items: [
            { itemId: 'item-1', itemName: 'Capilar Dialisador FX 80', requestedQuantity: 2, deliveredQuantity: 0, unit: 'unidades' },
            { itemId: 'item-3', itemName: 'Agulha para Fístula 16G', requestedQuantity: 4, deliveredQuantity: 0, unit: 'unidades' }
          ],
          fulfillment: null
        }
      ];
      setDB(db);
    }

    // Auto-Expire requisitions based on configured TTL in tenantSettings (default 1h)
    const ttlHours = parseFloat(db.tenant_settings?.requisitionTTLHours) || 1;
    const ttlMs = ttlHours * 60 * 60 * 1000;
    const now = Date.now();
    let hasChanged = false;

    db.material_requisitions = db.material_requisitions.map(req => {
      if ((req.status === 'Pendente' || req.status === 'Parcial') && req.createdAt) {
        const createdTime = new Date(req.createdAt).getTime();
        if (!isNaN(createdTime) && (now - createdTime) > ttlMs) {
          hasChanged = true;
          return {
            ...req,
            status: 'Expirada',
            expiredAt: new Date(createdTime + ttlMs).toISOString(),
            expiredReason: `Expirada automaticamente após atingir o TTL de ${ttlHours}h sem atendimento.`
          };
        }
      }
      return req;
    });

    if (hasChanged) {
      setDB(db);
    }

    return db.material_requisitions;
  },

  saveMaterialRequisition: async (reqData) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (!db.material_requisitions) db.material_requisitions = [];
    const isEdit = !!reqData.id;
    const reqId = reqData.id || 'req-' + Date.now();
    const count = db.material_requisitions.length + 1;
    const code = reqData.requisitionCode || `REQ-2026-${String(count).padStart(4, '0')}`;

    const updatedReq = {
      ...reqData,
      id: reqId,
      requisitionCode: code,
      status: reqData.status || 'Pendente',
      updatedAt: new Date().toISOString()
    };

    if (isEdit) {
      const idx = db.material_requisitions.findIndex(r => r.id === reqId);
      if (idx > -1) {
        db.material_requisitions[idx] = { ...db.material_requisitions[idx], ...updatedReq };
      } else {
        db.material_requisitions.unshift(updatedReq);
      }
    } else {
      updatedReq.createdAt = new Date().toISOString();
      db.material_requisitions.unshift(updatedReq);
    }

    setDB(db);
    return updatedReq;
  },

  deleteMaterialRequisition: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const db = getDB();
    if (db.material_requisitions) {
      db.material_requisitions = db.material_requisitions.filter(r => r.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  // Product Batches (Lotes e Rastreabilidade)
  getProductBatches: async (itemId = null) => {
    const db = getDB();
    if (!db.product_batches) {
      db.product_batches = [];
      setDB(db);
    }
    let list = db.product_batches;
    if (itemId) {
      list = list.filter(b => b.itemId === itemId);
    }
    return list.sort((a, b) => {
      if (!a.expiryDate) return 1;
      if (!b.expiryDate) return -1;
      return new Date(a.expiryDate) - new Date(b.expiryDate);
    });
  },

  saveProductBatch: async (batchData) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    
    const currentQty = parseFloat(batchData.currentQuantity) || 0;
    let status = 'Ativo';
    if (currentQty <= 0) {
      status = 'Esgotado';
    } else if (batchData.expiryDate && new Date(batchData.expiryDate) < new Date()) {
      status = 'Vencido';
    } else if (batchData.status) {
      status = batchData.status;
    }

    const payload = {
      ...batchData,
      id: batchData.id || 'batch-' + Date.now(),
      currentQuantity: currentQty,
      status,
      updatedAt: new Date().toISOString()
    };

    const idx = db.product_batches.findIndex(b => b.id === payload.id);
    if (idx > -1) {
      db.product_batches[idx] = { ...db.product_batches[idx], ...payload };
    } else {
      payload.createdAt = new Date().toISOString();
      db.product_batches.push(payload);
    }
    setDB(db);
    return payload;
  },

  deleteProductBatch: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (db.product_batches) {
      db.product_batches = db.product_batches.filter(b => b.id !== id);
    }
    setDB(db);
    return { success: true };
  },

  upsertProductBatchOnEntry: async (entryData) => {
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    const batchNumber = (entryData.batchNumber || '').trim();
    const qty = parseFloat(entryData.quantity) || 0;
    if (!batchNumber) return null;

    const existing = db.product_batches.find(b => b.itemId === entryData.itemId && b.batchNumber === batchNumber);
    if (existing) {
      existing.currentQuantity = (parseFloat(existing.currentQuantity) || 0) + qty;
      existing.initialQuantity = (parseFloat(existing.initialQuantity) || 0) + qty;
      existing.status = (existing.expiryDate && new Date(existing.expiryDate) < new Date()) ? 'Vencido' : 'Ativo';
      existing.updatedAt = new Date().toISOString();
      setDB(db);
      return existing;
    } else {
      const newBatch = {
        id: 'batch-' + Date.now(),
        itemId: entryData.itemId,
        itemName: entryData.itemName || '',
        batchNumber: batchNumber,
        expiryDate: entryData.expiryDate || '',
        initialQuantity: qty,
        currentQuantity: qty,
        unit: entryData.unit || 'unidades',
        costPrice: parseFloat(entryData.costPrice) || 0,
        supplierName: entryData.supplierName || '',
        invoiceNumber: entryData.invoiceNumber || '',
        status: (entryData.expiryDate && new Date(entryData.expiryDate) < new Date()) ? 'Vencido' : 'Ativo',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.product_batches.push(newBatch);
      setDB(db);
      return newBatch;
    }
  },


  // NexaASSIST - Feed Assistencial
  getAssistPosts: async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.assist_posts || db.assist_posts.length === 0) {
      db.assist_posts = (syncedAssistEmails && Array.isArray(syncedAssistEmails) && syncedAssistEmails.length > 0)
        ? [...syncedAssistEmails]
        : [
            {
              id: 'post-titan-real-1',
              source: 'email',
              title: 'INFECÇÃO - ALEXANDRE JOSE DE PAULA',
              message: 'ATB: Ceftazidima 2g/vancomicina 1g com lok, por 14 dias.\nMédico Responsável: ISABELA.\nRealizado coleta de Hemocultura 1ª E 2ª amostra, hemograma e PCR.',
              category: 'Intercorrência',
              urgency: 'Urgente',
              patientId: 'pat-alexandre',
              patientName: 'ALEXANDRE JOSE DE PAULA',
              room: 'Salão 3',
              shift: '1º Turno',
              status: 'published',
              originalFrom: 'Márcia Alves Teixeira <enfermagembetim7@dialize.com.br>',
              originalSubject: 'INFECÇÃO ALEXANDRE JOSE DE PAULA',
              author: 'Márcia Alves Teixeira',
              authorRole: 'Enfermeira (Titan IMAP)',
              createdAt: new Date().toISOString(),
              readBy: []
            }
          ];
      setDB(db);
    }
    return db.assist_posts;
  },

  createAssistPost: async (postData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (!db.assist_posts) db.assist_posts = [];
    const newPost = {
      ...postData,
      id: 'post-' + Date.now(),
      createdAt: postData.createdAt || new Date().toISOString(),
      readBy: postData.readBy || []
    };
    db.assist_posts.unshift(newPost);
    setDB(db);
    return newPost;
  },

  updateAssistPost: async (id, postData) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (db.assist_posts) {
      const idx = db.assist_posts.findIndex(p => p.id === id);
      if (idx > -1) {
        db.assist_posts[idx] = { ...db.assist_posts[idx], ...postData, updatedAt: new Date().toISOString() };
        setDB(db);
        return db.assist_posts[idx];
      }
    }
    return { id, ...postData };
  },

  deleteAssistPost: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    const db = getDB();
    if (db.assist_posts) {
      db.assist_posts = db.assist_posts.filter(p => p.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  toggleAssistPostRead: async (postId, user) => {
    await new Promise(resolve => setTimeout(resolve, 150));
    const db = getDB();
    if (!db.assist_posts) return null;
    const post = db.assist_posts.find(p => p.id === postId);
    if (!post) return null;

    if (!Array.isArray(post.readBy)) post.readBy = [];
    const userId = user.id || user.uid || user.email || 'user';
    const userName = user.name || user.email || 'Profissional';
    const idx = post.readBy.findIndex(r => r.userId === userId || r.name === userName);

    if (idx > -1) {
      post.readBy.splice(idx, 1);
    } else {
      post.readBy.push({
        userId,
        name: userName,
        role: user.role || 'Profissional',
        readAt: new Date().toISOString()
      });
    }
    setDB(db);
    return post.readBy;
  },

  getProductBatches: async (itemId = null) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    if (itemId) {
      return db.product_batches.filter(b => b.itemId === itemId);
    }
    return db.product_batches;
  },

  saveProductBatch: async (batchData) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) db.product_batches = [];
    if (batchData.id) {
      const idx = db.product_batches.findIndex(b => b.id === batchData.id);
      if (idx > -1) {
        db.product_batches[idx] = { ...db.product_batches[idx], ...batchData, updatedAt: new Date().toISOString() };
        setDB(db);
        return db.product_batches[idx];
      }
    }
    const newDoc = { id: `batch_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...batchData, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.product_batches.push(newDoc);
    setDB(db);
    return newDoc;
  },

  deleteProductBatch: async (id) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (db.product_batches) {
      db.product_batches = db.product_batches.filter(b => b.id !== id);
      setDB(db);
    }
    return { success: true };
  },

  deductProductBatch: async (batchId, quantity) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.product_batches) return null;
    const batch = db.product_batches.find(b => b.id === batchId);
    if (!batch) return null;
    const qty = parseFloat(quantity) || 0;
    batch.currentQuantity = Math.max(0, (parseFloat(batch.currentQuantity) || 0) - qty);
    if (batch.currentQuantity <= 0) {
      batch.status = 'Esgotado';
    }
    batch.updatedAt = new Date().toISOString();
    setDB(db);
    return batch;
  },

  getPatientDispensations: async (patientId = null) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.patient_dispensations) db.patient_dispensations = [];
    if (patientId) {
      return db.patient_dispensations.filter(d => d.patientId === patientId).sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    }
    return [...db.patient_dispensations].sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  },

  savePatientDispensation: async (dispData) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!db.patient_dispensations) db.patient_dispensations = [];
    const newDoc = { id: `disp_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`, ...dispData, date: dispData.date || new Date().toISOString(), createdAt: new Date().toISOString() };
    db.patient_dispensations.push(newDoc);
    setDB(db);
    return newDoc;
  },

  getBatchTraceability: async (searchTerm) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    const db = getDB();
    if (!searchTerm) return { batches: [], dispensations: [] };
    const term = String(searchTerm).trim().toLowerCase();
    const batches = (db.product_batches || []).filter(b => 
      (b.batchNumber && b.batchNumber.toLowerCase().includes(term)) ||
      (b.itemName && b.itemName.toLowerCase().includes(term)) ||
      (b.invoiceNumber && b.invoiceNumber.toLowerCase().includes(term))
    );
    const batchNumbers = new Set(batches.map(b => (b.batchNumber || '').toLowerCase()).filter(Boolean));
    const batchIds = new Set(batches.map(b => b.id));
    const dispensations = (db.patient_dispensations || []).filter(d =>
      (d.batchNumber && (batchNumbers.has(d.batchNumber.toLowerCase()) || d.batchNumber.toLowerCase().includes(term))) ||
      (d.batchId && batchIds.has(d.batchId)) ||
      (d.itemName && d.itemName.toLowerCase().includes(term)) ||
      (d.patientName && d.patientName.toLowerCase().includes(term))
    );
    dispensations.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
    return { batches, dispensations };
  }
};

