import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, FileSpreadsheet, Calendar, 
  Users, Activity, DollarSign, Printer, ShieldCheck,
  Clock, CheckCircle2, AlertTriangle, UserCheck,
  HeartPulse, Pill, Search, ClipboardList, TrendingUp,
  Droplets, ShieldAlert, Sparkles, Filter
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../../firebase';

export default function ClinicalReportsModal({
  isOpen,
  onClose,
  patients = [],
  prescriptions = [],
  sessionsLogs = [],
  clinicalNotes = [],
  medications = [],
  labExams = [],
  apacRecords = [],
  patientDispensations = [],
  assistPosts = [],
  currentUser
}) {
  if (!isOpen) return null;

  // Seletor de Seção e Relatório
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'CENSO' | 'DIALISE' | 'LAB' | 'REGULACAO' | 'MULTI'
  const [selectedReport, setSelectedReport] = useState('CLINIC_CENSO_PACIENTES');

  // Filtros Globais
  const [roomFilter, setRoomFilter] = useState('Todos');
  const [shiftFilter, setShiftFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');

  // Dados da Clínica
  const [tenantSettings, setTenantSettings] = useState({ 
    name: 'NexaCLINIC • Centro Nefrológico Especializado', 
    cnpj: '00.000.000/0001-00', 
    logo: '' 
  });

  useEffect(() => {
    let isMounted = true;
    const loadTenant = async () => {
      try {
        if (dbService.getTenantSettings) {
          const s = await dbService.getTenantSettings();
          if (isMounted && s) setTenantSettings(s);
        }
      } catch (err) {
        console.error('Erro ao carregar dados da clínica:', err);
      }
    };
    loadTenant();
    return () => { isMounted = false; };
  }, []);

  // Catálogo Oficial dos 12 Relatórios Clínicos
  const REPORTS = [
    // Seção Censo & Cadastros
    { id: 'CLINIC_CENSO_PACIENTES', section: 'CENSO', name: '1. Censo Geral de Pacientes Renais', icon: Users, desc: 'Relação unificada dos pacientes com dados cadastrais, acesso vascular, turno e salão.' },
    { id: 'CLINIC_ACESSOS_VASCULARES', section: 'CENSO', name: '2. Mapa de Acessos Vasculares', icon: HeartPulse, desc: 'Censo anatômico de fístulas (FAV), próteses e cateteres centrais (CDL e Permcath).' },

    // Seção Diálise & Sessões
    { id: 'CLINIC_PRESCRICOES_ATIVAS', section: 'DIALISE', name: '3. Prescrições Dialíticas Vigentes', icon: ClipboardList, desc: 'Parâmetros operacionais: capilar, tempo de sessão, fluxo QB/QD, heparina e peso seco.' },
    { id: 'CLINIC_SESSOES_HORARIAS', section: 'DIALISE', name: '4. Monitoramento Horário de Sessões', icon: Activity, desc: 'Registros intradialíticos de pressão arterial, frequência cardíaca, perda ponderal e máquina.' },
    { id: 'CLINIC_ALERTA_UF', section: 'DIALISE', name: '5. Auditoria de Taxa de Ultrafiltração (> 13 mL/kg/h)', icon: AlertTriangle, desc: 'Identificação preventiva de risco hemodinâmico por perda ponderal excessiva por hora.' },

    // Seção Laboratório & Metas SBN
    { id: 'CLINIC_PAINEL_LABORATORIAL', section: 'LAB', name: '6. Painel Laboratorial Consolidado', icon: TrendingUp, desc: 'Mapeamento geral de biomarcadores séricos mensais conforme metas clínicas da SBN.' },
    { id: 'CLINIC_CONTROLE_ANEMIA', section: 'LAB', name: '7. Controle de Anemia & Cinética de Ferro', icon: Droplets, desc: 'Acompanhamento de Hemoglobina, Ferritina e Saturação de Transferrina com alerta de anemia.' },
    { id: 'CLINIC_METABOLISMO_OSSEO', section: 'LAB', name: '8. Metabolismo Ósseo e Mineral (DMO)', icon: ShieldCheck, desc: 'Valores de Cálcio, Fósforo, produto Ca x P e PTH intacto para profilaxia de osteodistrofia.' },

    // Seção Regulação & APAC
    { id: 'CLINIC_LAUDOS_APAC', section: 'REGULACAO', name: '9. Regulação & Validade de Laudos APAC', icon: FileText, desc: 'Controle de vigência das autorizações de hemodiálise SUS com semáforo de expiração.' },

    // Seção Equipe Multiprofissional & Farmácia
    { id: 'CLINIC_FARMACOTERAPIA', section: 'MULTI', name: '10. Farmacoterapia & Dispensação Clínica', icon: Pill, desc: 'Prescrição medicamentosa intradialítica e contínua (Eritropoetina, Ferro, etc.).' },
    { id: 'CLINIC_EVOLUCOES_MULTIPROF', section: 'MULTI', name: '11. Auditoria de Evoluções no Prontuário', icon: CheckCircle2, desc: 'Histórico cronológico de anotações médicas, enfermagem, nutrição, psicologia e serviço social.' },
    { id: 'CLINIC_COMUNICADOS_MURAL', section: 'MULTI', name: '12. Alertas Assistenciais & Ocorrências', icon: Sparkles, desc: 'Mural de intercorrências, altas hospitalares, transferências e avisos de segurança.' }
  ];

  const filteredReportsList = useMemo(() => {
    if (activeSection === 'ALL') return REPORTS;
    return REPORTS.filter(r => r.section === activeSection);
  }, [activeSection]);

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const parts = dateStr.substring(0, 10).split('-');
      if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
      return new Date(dateStr).toLocaleDateString('pt-BR');
    } catch {
      return dateStr;
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  // Base de Pacientes com filtros de salão, turno e busca
  const filteredPatients = useMemo(() => {
    return patients.filter(p => {
      const pRoom = p.room || 'Salão 1';
      const pShift = p.shift || '1º Turno';
      const pStatus = p.treatmentStatus || 'Ativo';

      const matchRoom = roomFilter === 'Todos' || pRoom === roomFilter;
      const matchShift = shiftFilter === 'Todos' || pShift === shiftFilter;
      const matchStatus = statusFilter === 'Todos' || pStatus === statusFilter;

      let matchSearch = true;
      if (searchFilter.trim()) {
        const term = searchFilter.toLowerCase();
        const pName = (p.name || '').toLowerCase();
        const pCpf = (p.cpf || '').replace(/\D/g, '');
        const pTermDigits = term.replace(/\D/g, '');
        matchSearch = pName.includes(term) || (pTermDigits && pCpf.includes(pTermDigits));
      }

      return matchRoom && matchShift && matchStatus && matchSearch;
    });
  }, [patients, roomFilter, shiftFilter, statusFilter, searchFilter]);

  // Montagem dinâmica dos dados do relatório selecionado
  const { reportData, reportColumns, reportKpis, currentReportMeta } = useMemo(() => {
    const meta = REPORTS.find(r => r.id === selectedReport) || REPORTS[0];
    let data = [];
    let cols = [];
    let kpis = [];

    switch (selectedReport) {
      // 1. Censo Geral de Pacientes Renais
      case 'CLINIC_CENSO_PACIENTES': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Idade', key: 'age' },
          { header: 'Salão', key: 'room' },
          { header: 'Turno', key: 'shift' },
          { header: 'Frequência', key: 'frequency' },
          { header: 'Acesso', key: 'access' },
          { header: 'Status', key: 'status' }
        ];

        data = filteredPatients.map(p => ({
          name: p.name || 'Sem nome',
          cpf: p.cpf || '-',
          age: `${calculateAge(p.birthDate)} anos`,
          room: p.room || 'Salão 1',
          shift: p.shift || '1º Turno',
          frequency: p.dialysisFrequency || 'Seg/Qua/Sex',
          access: p.accessType || 'Fístula AV',
          status: p.treatmentStatus || 'Ativo'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const total = data.length;
        const ativos = data.filter(d => d.status === 'Ativo').length;
        const favs = data.filter(d => (d.access || '').includes('Fístula') || (d.access || '').includes('FAV')).length;
        const txFav = total > 0 ? Math.round((favs / total) * 100) : 0;

        kpis = [
          { label: 'Pacientes', value: total, color: '#8b5cf6' },
          { label: 'Ativos', value: ativos, color: '#10b981' },
          { label: 'Acesso FAV', value: `${favs} (${txFav}%)`, color: '#0284c7' }
        ];
        break;
      }

      // 2. Mapa de Acessos Vasculares
      case 'CLINIC_ACESSOS_VASCULARES': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'Salão', key: 'room' },
          { header: 'Turno', key: 'shift' },
          { header: 'Tipo de Acesso', key: 'accessType' },
          { header: 'Sítio / Membro', key: 'site' },
          { header: 'Confecção / Implante', key: 'implantDate' },
          { header: 'Status Acesso', key: 'status' }
        ];

        data = filteredPatients.map(p => ({
          name: p.name,
          room: p.room || 'Salão 1',
          shift: p.shift || '1º Turno',
          accessType: p.accessType || 'Fístula AV',
          site: p.accessSite || 'MSE (Rádio-Cefálica)',
          implantDate: p.accessDate ? formatDateBR(p.accessDate) : 'Em uso',
          status: p.accessStatus || 'Pervio e Funcional'
        })).sort((a, b) => a.name.localeCompare(b.name));

        const total = data.length;
        const fav = data.filter(d => (d.accessType || '').toLowerCase().includes('fístula') || (d.accessType || '').includes('FAV')).length;
        const cdl = data.filter(d => (d.accessType || '').toLowerCase().includes('duplo') || (d.accessType || '').toLowerCase().includes('cdl')).length;
        const permcath = data.filter(d => (d.accessType || '').toLowerCase().includes('permcath') || (d.accessType || '').toLowerCase().includes('longa')).length;

        kpis = [
          { label: 'Total Acessos', value: total, color: '#8b5cf6' },
          { label: 'FAV Pervia', value: fav, color: '#10b981' },
          { label: 'Cateter Curto', value: cdl, color: '#ef4444' },
          { label: 'Permcath', value: permcath, color: '#f59e0b' }
        ];
        break;
      }

      // 3. Prescrições Dialíticas Vigentes
      case 'CLINIC_PRESCRICOES_ATIVAS': {
        cols = [
          { header: 'Paciente', key: 'patientName' },
          { header: 'Salão', key: 'room' },
          { header: 'Terapia', key: 'type' },
          { header: 'Capilar', key: 'dialyzer' },
          { header: 'Tempo', key: 'time' },
          { header: 'QB (mL/min)', key: 'qb' },
          { header: 'QD (mL/min)', key: 'qd' },
          { header: 'Heparina', key: 'heparin' },
          { header: 'Peso Seco', key: 'dryWeight' }
        ];

        const patientMap = new Map(patients.map(p => [p.id, p]));

        data = prescriptions.map(pr => {
          const pat = patientMap.get(pr.patientId) || {};
          return {
            patientName: pat.name || pr.patientName || 'Paciente',
            room: pat.room || 'Salão 1',
            shift: pat.shift || '1º Turno',
            type: pr.type || 'HD',
            dialyzer: pr.dialyzerModel || 'HF80 (Alto Fluxo)',
            time: `${pr.sessionTime || '4.0'}h`,
            qb: pr.bloodFlow || '300',
            qd: pr.dialysateFlow || '500',
            heparin: pr.heparinDose ? `${pr.heparinType || 'Interm.'} (${pr.heparinDose})` : 'Sem Heparina',
            dryWeight: pr.dryWeight ? `${pr.dryWeight} kg` : '-'
          };
        }).filter(d => {
          const matchRoom = roomFilter === 'Todos' || d.room === roomFilter;
          const matchShift = shiftFilter === 'Todos' || d.shift === shiftFilter;
          let matchSearch = true;
          if (searchFilter.trim()) {
            matchSearch = d.patientName.toLowerCase().includes(searchFilter.toLowerCase());
          }
          return matchRoom && matchShift && matchSearch;
        }).sort((a, b) => a.patientName.localeCompare(b.patientName));

        const total = data.length;
        const altoFluxo = data.filter(d => d.dialyzer.includes('HF') || d.dialyzer.toLowerCase().includes('alto')).length;
        const qbAdequado = data.filter(d => Number(d.qb) >= 300).length;

        kpis = [
          { label: 'Prescrições', value: total, color: '#8b5cf6' },
          { label: 'Alto Fluxo', value: altoFluxo, color: '#10b981' },
          { label: 'QB ≥ 300 mL', value: qbAdequado, color: '#0284c7' }
        ];
        break;
      }

      // 4. Monitoramento Horário de Sessões
      case 'CLINIC_SESSOES_HORARIAS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'name' },
          { header: 'Salão / Turno', key: 'roomShift' },
          { header: 'Máquina', key: 'machine' },
          { header: 'Peso Pré', key: 'preWeight' },
          { header: 'Peso Pós', key: 'finalWeight' },
          { header: 'Perda Real', key: 'weightLoss' },
          { header: 'Intercorrências', key: 'complications' }
        ];

        data = (sessionsLogs || []).map(log => {
          const loss = (Number(log.preWeight || 0) - Number(log.finalWeight || 0)).toFixed(1);
          return {
            date: formatDateBR(log.date),
            name: log.patientName || 'Paciente',
            roomShift: `${log.room || 'Salão 1'} • ${log.shift || '1º Turno'}`,
            machine: (log.machineId || 'Máquina').replace('Máquina ', 'M-'),
            preWeight: `${log.preWeight || 0} kg`,
            finalWeight: `${log.finalWeight || 0} kg`,
            weightLoss: Number(loss) > 0 ? `${loss} kg` : '0 kg',
            complications: (log.complications && log.complications.length > 0) ? log.complications.join(', ') : 'Sem queixas'
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase()) || d.machine.toLowerCase().includes(searchFilter.toLowerCase());
        }).sort((a, b) => b.date.localeCompare(a.date));

        const total = data.length;
        const comIntercorrencia = data.filter(d => d.complications !== 'Sem queixas').length;
        const estaveis = total - comIntercorrencia;

        kpis = [
          { label: 'Sessões Registradas', value: total, color: '#8b5cf6' },
          { label: 'Sem Intercorrências', value: estaveis, color: '#10b981' },
          { label: 'Intercorrências', value: comIntercorrencia, color: comIntercorrencia > 0 ? '#ef4444' : '#64748b' }
        ];
        break;
      }

      // 5. Auditoria de Taxa de Ultrafiltração (> 13 mL/kg/h)
      case 'CLINIC_ALERTA_UF': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'name' },
          { header: 'Peso Seco / Pós', key: 'weights' },
          { header: 'Volume Retirado', key: 'loss' },
          { header: 'Duração', key: 'duration' },
          { header: 'Taxa UF Calculada', key: 'ufRate' },
          { header: 'Classificação Risco', key: 'risk' }
        ];

        data = (sessionsLogs || []).map(log => {
          const lossKg = Math.max(0, Number(log.preWeight || 0) - Number(log.finalWeight || 0));
          const lossMl = lossKg * 1000;
          const dryWeight = Number(log.finalWeight) || 65;
          const durationHours = 4.0;
          // UF Rate = (lossMl) / (dryWeight * durationHours)
          const ufRateVal = dryWeight > 0 ? (lossMl / (dryWeight * durationHours)).toFixed(1) : '0';
          const isExcessive = Number(ufRateVal) > 13.0;

          return {
            date: formatDateBR(log.date),
            name: log.patientName || 'Paciente',
            weights: `${log.preWeight || '-'} / ${log.finalWeight || '-'} kg`,
            loss: `${lossKg.toFixed(1)} L (${lossMl} mL)`,
            duration: '4.0h',
            ufRate: `${ufRateVal} mL/kg/h`,
            risk: isExcessive ? 'CRÍTICO (> 13 mL/kg/h)' : 'Seguro (≤ 13 mL/kg/h)',
            isExcessive
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase());
        });

        const total = data.length;
        const criticos = data.filter(d => d.isExcessive).length;
        const seguros = total - criticos;

        kpis = [
          { label: 'Sessões Auditadas', value: total, color: '#8b5cf6' },
          { label: 'Taxa Segura', value: seguros, color: '#10b981' },
          { label: 'Alerta (> 13 mL/kg/h)', value: criticos, color: criticos > 0 ? '#dc2626' : '#64748b' }
        ];
        break;
      }

      // 6. Painel Laboratorial Consolidado
      case 'CLINIC_PAINEL_LABORATORIAL': {
        cols = [
          { header: 'Data Coleta', key: 'date' },
          { header: 'Paciente', key: 'name' },
          { header: 'Hb (g/dL)', key: 'hb' },
          { header: 'Ferritina (ng/mL)', key: 'ferritin' },
          { header: 'SAT (%)', key: 'sat' },
          { header: 'Fósforo (mg/dL)', key: 'phos' },
          { header: 'Cálcio (mg/dL)', key: 'ca' },
          { header: 'PTH (pg/mL)', key: 'pth' },
          { header: 'Kt/V', key: 'ktv' }
        ];

        data = (labExams || []).map(exam => {
          const pat = patients.find(p => p.id === exam.patientId);
          return {
            date: formatDateBR(exam.collectionDate || exam.date),
            name: pat ? pat.name : (exam.patientName || 'Paciente'),
            hb: exam.hemoglobin ? `${exam.hemoglobin}` : '-',
            ferritin: exam.ferritin ? `${exam.ferritin}` : '-',
            sat: exam.transferrinSat ? `${exam.transferrinSat}%` : '-',
            phos: exam.phosphorus ? `${exam.phosphorus}` : '-',
            ca: exam.calcium ? `${exam.calcium}` : '-',
            pth: exam.pth ? `${exam.pth}` : '-',
            ktv: exam.ktv ? `${exam.ktv}` : '-'
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase());
        }).sort((a, b) => b.date.localeCompare(a.date));

        const total = data.length;
        const hbAdequada = data.filter(d => {
          const val = parseFloat(d.hb);
          return !isNaN(val) && val >= 10.0 && val <= 12.0;
        }).length;
        const txMetaHb = total > 0 ? Math.round((hbAdequada / total) * 100) : 0;

        kpis = [
          { label: 'Exames Cadastrados', value: total, color: '#8b5cf6' },
          { label: 'Hb na Meta (10-12)', value: `${hbAdequada} (${txMetaHb}%)`, color: '#10b981' },
          { label: 'Diretriz SBN', value: 'Conforme RDC 11', color: '#0284c7' }
        ];
        break;
      }

      // 7. Controle de Anemia & Cinética de Ferro
      case 'CLINIC_CONTROLE_ANEMIA': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'Data', key: 'date' },
          { header: 'Hemoglobina', key: 'hb' },
          { header: 'Ferritina', key: 'ferritin' },
          { header: 'SAT Ferro', key: 'sat' },
          { header: 'Status SBN', key: 'status' },
          { header: 'Conduta Sugerida', key: 'action' }
        ];

        data = (labExams || []).map(exam => {
          const pat = patients.find(p => p.id === exam.patientId);
          const hb = parseFloat(exam.hemoglobin) || 11.0;
          const ferr = parseFloat(exam.ferritin) || 350;
          const sat = parseFloat(exam.transferrinSat) || 28;

          let status = 'Meta SBN Atingida';
          let action = 'Manter terapia atual';

          if (hb < 10.0) {
            status = 'Anemia Moderada/Grave';
            action = 'Ajustar Dose de EPO (+20%)';
          } else if (hb > 12.5) {
            status = 'Hb Acima da Meta';
            action = 'Reduzir EPO / Suspender';
          }

          if (ferr < 200 || sat < 20) {
            action += ' + Reposição Noripurum EV';
          }

          return {
            name: pat ? pat.name : (exam.patientName || 'Paciente'),
            date: formatDateBR(exam.collectionDate || exam.date),
            hb: `${hb} g/dL`,
            ferritin: `${ferr} ng/mL`,
            sat: `${sat}%`,
            status,
            action
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase());
        });

        const total = data.length;
        const anemicos = data.filter(d => d.status.includes('Anemia')).length;
        const controlados = total - anemicos;

        kpis = [
          { label: 'Pacientes Avaliados', value: total, color: '#8b5cf6' },
          { label: 'Dentro da Meta', value: controlados, color: '#10b981' },
          { label: 'Hb < 10 g/dL', value: anemicos, color: anemicos > 0 ? '#ef4444' : '#64748b' }
        ];
        break;
      }

      // 8. Metabolismo Ósseo e Mineral (DMO)
      case 'CLINIC_METABOLISMO_OSSEO': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'Data', key: 'date' },
          { header: 'Cálcio (8.4-9.5)', key: 'ca' },
          { header: 'Fósforo (3.5-5.5)', key: 'phos' },
          { header: 'Produto Ca x P (< 55)', key: 'caxp' },
          { header: 'PTH (150-600)', key: 'pth' },
          { header: 'Classificação DMO', key: 'dmoStatus' }
        ];

        data = (labExams || []).map(exam => {
          const pat = patients.find(p => p.id === exam.patientId);
          const ca = parseFloat(exam.calcium) || 9.0;
          const phos = parseFloat(exam.phosphorus) || 4.8;
          const pth = parseFloat(exam.pth) || 320;
          const caxp = (ca * phos).toFixed(1);

          let dmoStatus = 'Normotrófico (Controlado)';
          if (phos > 5.5) dmoStatus = 'Hiperfosfatemia (Quelante)';
          if (pth > 600) dmoStatus = 'Hiperparatireoidismo Secundário';
          if (pth < 150) dmoStatus = 'Doença Óssea Adinâmica';
          if (Number(caxp) > 55) dmoStatus = 'Risco Calcificação Vascular';

          return {
            name: pat ? pat.name : (exam.patientName || 'Paciente'),
            date: formatDateBR(exam.collectionDate || exam.date),
            ca: `${ca} mg/dL`,
            phos: `${phos} mg/dL`,
            caxp: `${caxp} mg²/dL²`,
            pth: `${pth} pg/mL`,
            dmoStatus
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase());
        });

        const total = data.length;
        const controlados = data.filter(d => d.dmoStatus.includes('Controlado')).length;
        const hiperfosf = data.filter(d => d.dmoStatus.includes('Hiperfosfatemia')).length;

        kpis = [
          { label: 'Exames DMO', value: total, color: '#8b5cf6' },
          { label: 'DMO Controlado', value: controlados, color: '#10b981' },
          { label: 'Fósforo > 5.5', value: hiperfosf, color: hiperfosf > 0 ? '#f59e0b' : '#64748b' }
        ];
        break;
      }

      // 9. Regulação & Validade de Laudos APAC
      case 'CLINIC_LAUDOS_APAC': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'CNS / Cartão SUS', key: 'cns' },
          { header: 'Nº Autorização APAC', key: 'apacNumber' },
          { header: 'Procedimento', key: 'procedure' },
          { header: 'Vigência Até', key: 'validUntil' },
          { header: 'Dias Restantes', key: 'daysLeft' },
          { header: 'Situação Regulatória', key: 'status' }
        ];

        data = (apacRecords || []).map(ap => {
          const pat = patients.find(p => p.id === ap.patientId);
          const validDate = ap.validUntil ? new Date(ap.validUntil) : new Date(Date.now() + 45 * 86400000);
          const daysLeft = Math.ceil((validDate.getTime() - Date.now()) / (1000 * 3600 * 24));
          
          let status = 'Vigente';
          if (daysLeft <= 0) status = 'EXPIRADA (Renovação Urgente)';
          else if (daysLeft <= 30) status = 'A Vencer (Em Renovação)';

          return {
            name: pat ? pat.name : (ap.patientName || 'Paciente'),
            cns: pat?.cns || ap.cns || '7000.0000.0000.0000',
            apacNumber: ap.apacNumber || '3124000000000',
            procedure: ap.procedureName || 'Hemodiálise Contínua (Três Vezes/Semana)',
            validUntil: validDate.toLocaleDateString('pt-BR'),
            daysLeft: `${daysLeft} dias`,
            status,
            daysLeftNum: daysLeft
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase());
        }).sort((a, b) => a.daysLeftNum - b.daysLeftNum);

        const total = data.length;
        const expiram30 = data.filter(d => d.daysLeftNum <= 30 && d.daysLeftNum > 0).length;
        const vencidas = data.filter(d => d.daysLeftNum <= 0).length;

        kpis = [
          { label: 'APACs Mapeadas', value: total, color: '#8b5cf6' },
          { label: 'Vence em 30 Dias', value: expiram30, color: expiram30 > 0 ? '#f59e0b' : '#64748b' },
          { label: 'Expiradas', value: vencidas, color: vencidas > 0 ? '#ef4444' : '#10b981' }
        ];
        break;
      }

      // 10. Farmacoterapia & Dispensação Clínica
      case 'CLINIC_FARMACOTERAPIA': {
        cols = [
          { header: 'Paciente', key: 'name' },
          { header: 'Medicamento', key: 'medication' },
          { header: 'Dosagem', key: 'dosage' },
          { header: 'Via', key: 'route' },
          { header: 'Frequência', key: 'frequency' },
          { header: 'Tipo / Categoria', key: 'category' }
        ];

        data = (medications || []).map(m => {
          const pat = patients.find(p => p.id === m.patientId);
          return {
            name: pat ? pat.name : (m.patientName || 'Paciente'),
            medication: m.name || m.medicationName || 'Medicamento',
            dosage: m.dosage || '1 ampola',
            route: m.route || 'Endovenoso (EV)',
            frequency: m.frequency || 'Pós-HD',
            category: m.category || 'Intradialítico'
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase()) || d.medication.toLowerCase().includes(searchFilter.toLowerCase());
        }).sort((a, b) => a.name.localeCompare(b.name));

        const total = data.length;
        const epoFerro = data.filter(d => {
          const n = d.medication.toLowerCase();
          return n.includes('eritro') || n.includes('epo') || n.includes('ferro') || n.includes('noripurum');
        }).length;

        kpis = [
          { label: 'Prescrições Medicamentosas', value: total, color: '#8b5cf6' },
          { label: 'Anemia (EPO/Ferro)', value: epoFerro, color: '#10b981' },
          { label: 'Via Endovenosa', value: data.filter(d => d.route.includes('EV')).length, color: '#0284c7' }
        ];
        break;
      }

      // 11. Auditoria de Evoluções no Prontuário
      case 'CLINIC_EVOLUCOES_MULTIPROF': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'name' },
          { header: 'Especialidade', key: 'category' },
          { header: 'Profissional', key: 'author' },
          { header: 'Conduta Registrada', key: 'text' }
        ];

        data = (clinicalNotes || []).map(note => {
          const pat = patients.find(p => p.id === note.patientId);
          return {
            date: formatDateBR(note.date),
            name: pat ? pat.name : (note.patientName || 'Paciente'),
            category: note.category || 'Médica',
            author: note.author || 'Profissional',
            text: note.text || 'Sem anotações'
          };
        }).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.name.toLowerCase().includes(searchFilter.toLowerCase()) || d.author.toLowerCase().includes(searchFilter.toLowerCase());
        }).sort((a, b) => b.date.localeCompare(a.date));

        const total = data.length;
        const medicas = data.filter(d => d.category === 'Médica').length;
        const enfermagem = data.filter(d => d.category === 'Enfermagem').length;
        const multi = total - medicas - enfermagem;

        kpis = [
          { label: 'Evoluções Totais', value: total, color: '#8b5cf6' },
          { label: 'Médicas', value: medicas, color: '#0284c7' },
          { label: 'Enfermagem', value: enfermagem, color: '#10b981' },
          { label: 'Multiprofissional', value: multi, color: '#ec4899' }
        ];
        break;
      }

      // 12. Alertas Assistenciais & Ocorrências
      case 'CLINIC_COMUNICADOS_MURAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'patient' },
          { header: 'Salão / Turno', key: 'location' },
          { header: 'Categoria', key: 'category' },
          { header: 'Urgência', key: 'urgency' },
          { header: 'Descrição do Comunicado', key: 'content' }
        ];

        data = (assistPosts || []).map(post => ({
          date: formatDateBR(post.createdAt || post.date),
          patient: post.patientName || 'Geral / Sem paciente',
          location: `${post.room || 'Salão 1'} • ${post.shift || '1º Turno'}`,
          category: post.category || 'Aviso',
          urgency: post.urgency || 'Normal',
          content: post.content || post.text || '-'
        })).filter(d => {
          if (!searchFilter.trim()) return true;
          return d.patient.toLowerCase().includes(searchFilter.toLowerCase()) || d.content.toLowerCase().includes(searchFilter.toLowerCase());
        });

        const total = data.length;
        const urgentes = data.filter(d => d.urgency === 'Urgente' || d.urgency === 'Crítico').length;

        kpis = [
          { label: 'Comunicados', value: total, color: '#8b5cf6' },
          { label: 'Urgentes', value: urgentes, color: urgentes > 0 ? '#ef4444' : '#10b981' },
          { label: 'Mural Ativo', value: 'Sincronizado', color: '#0284c7' }
        ];
        break;
      }

      default:
        break;
    }

    return { reportData: data, reportColumns: cols, reportKpis: kpis, currentReportMeta: meta };
  }, [selectedReport, filteredPatients, prescriptions, sessionsLogs, labExams, apacRecords, medications, clinicalNotes, assistPosts, roomFilter, shiftFilter, searchFilter, patients]);

  // Exportar para Excel (.xlsx)
  const handleExportExcel = () => {
    if (reportData.length === 0) {
      alert('Não há dados disponíveis para exportação com os filtros selecionados.');
      return;
    }

    const excelData = reportData.map(row => {
      const cleanRow = {};
      reportColumns.forEach(c => {
        cleanRow[c.header] = row[c.key] !== undefined ? row[c.key] : '';
      });
      return cleanRow;
    });

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório Clínico');
    const fileName = `${selectedReport}_${new Date().toISOString().substring(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // Exportar para PDF
  const handleExportPdf = () => {
    if (reportData.length === 0) {
      alert('Não há dados disponíveis para exportação com os filtros selecionados.');
      return;
    }

    const doc = new jsPDF('landscape');
    const title = currentReportMeta.name;

    // Cabeçalho da Clínica
    doc.setFontSize(14);
    doc.setTextColor(109, 40, 217); // purple
    doc.text(tenantSettings.name.toUpperCase(), 14, 15);

    doc.setFontSize(10);
    doc.setTextColor(51, 65, 85);
    doc.text(`RELATÓRIO CLÍNICO: ${title}`, 14, 22);

    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text(`Emitido em: ${new Date().toLocaleString('pt-BR')} | Usuário: ${currentUser?.name || 'Clínico'}`, 14, 28);

    const tableHeaders = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => reportColumns.map(c => row[c.key] || '-'));

    doc.autoTable({
      head: [tableHeaders],
      body: tableRows,
      startY: 32,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      margin: { left: 14, right: 14 }
    });

    doc.save(`${selectedReport}_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header do Modal */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={styles.headerIconWrap}>
              <HeartPulse size={22} color="#8b5cf6" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Central de Relatórios Clínicos & Nefrológicos</h2>
              <p style={styles.headerSub}>Exportação analítica oficial, auditoria assistencial, metas laboratoriais e prontuário.</p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} title="Fechar Relatórios">
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Navegação Lateral e Visualizador */}
        <div style={styles.body}>
          {/* Coluna Esquerda: Seletor de Categorias e Lista de Relatórios */}
          <div style={styles.sidebar}>
            {/* Abas de Seção */}
            <div style={styles.sectionTabs}>
              {[
                { id: 'ALL', label: 'Todos' },
                { id: 'CENSO', label: 'Censo' },
                { id: 'DIALISE', label: 'Diálise' },
                { id: 'LAB', label: 'Exames' },
                { id: 'REGULACAO', label: 'APAC' },
                { id: 'MULTI', label: 'Equipe' }
              ].map(sec => (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => setActiveSection(sec.id)}
                  style={{
                    ...styles.sectionTabBtn,
                    ...(activeSection === sec.id ? styles.sectionTabBtnActive : {})
                  }}
                >
                  {sec.label}
                </button>
              ))}
            </div>

            {/* Lista dos Relatórios */}
            <div style={styles.reportsList}>
              {filteredReportsList.map(rep => {
                const Icon = rep.icon;
                const isSelected = selectedReport === rep.id;
                return (
                  <div
                    key={rep.id}
                    onClick={() => setSelectedReport(rep.id)}
                    style={{
                      ...styles.reportItem,
                      ...(isSelected ? styles.reportItemActive : {})
                    }}
                  >
                    <div style={{
                      ...styles.reportItemIcon,
                      backgroundColor: isSelected ? 'rgba(139, 92, 246, 0.15)' : '#f1f5f9',
                      color: isSelected ? '#7c3aed' : '#64748b'
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ flexGrow: 1 }}>
                      <span style={{
                        ...styles.reportItemTitle,
                        color: isSelected ? '#7c3aed' : '#0f172a'
                      }}>
                        {rep.name}
                      </span>
                      <p style={styles.reportItemDesc}>{rep.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coluna Direita: Área de Visualização e Ações */}
          <div style={styles.contentArea}>
            {/* Topbar do Relatório Selecionado */}
            <div style={styles.reportMetaCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <h3 style={styles.reportTitle}>{currentReportMeta.name}</h3>
                  <p style={styles.reportSubtitle}>{currentReportMeta.desc}</p>
                </div>
                {/* Botões de Ação */}
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button type="button" onClick={handleExportExcel} style={styles.excelBtn} title="Exportar planilha Excel">
                    <FileSpreadsheet size={15} />
                    <span>Excel</span>
                  </button>
                  <button type="button" onClick={handleExportPdf} style={styles.pdfBtn} title="Exportar documento PDF">
                    <Download size={15} />
                    <span>PDF</span>
                  </button>
                  <button type="button" onClick={handlePrint} style={styles.printBtn} title="Imprimir relatório">
                    <Printer size={15} />
                    <span>Imprimir</span>
                  </button>
                </div>
              </div>

              {/* Filtros em Linha */}
              <div style={styles.filterRow}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexGrow: 1, minWidth: '180px' }}>
                  <Search size={14} color="#94a3b8" />
                  <input
                    type="text"
                    placeholder="Buscar por paciente ou máquina..."
                    value={searchFilter}
                    onChange={e => setSearchFilter(e.target.value)}
                    style={styles.searchInput}
                  />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={styles.filterLabel}>Salão:</span>
                  <select
                    value={roomFilter}
                    onChange={e => setRoomFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="Todos">Todos os Salões</option>
                    <option value="Salão 1">Salão 1</option>
                    <option value="Salão 2">Salão 2</option>
                    <option value="Salão 3">Salão 3</option>
                    <option value="Isolamento">Isolamento</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={styles.filterLabel}>Turno:</span>
                  <select
                    value={shiftFilter}
                    onChange={e => setShiftFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="Todos">Todos os Turnos</option>
                    <option value="1º Turno">1º Turno (Manhã)</option>
                    <option value="2º Turno">2º Turno (Tarde)</option>
                    <option value="3º Turno">3º Turno (Noite)</option>
                  </select>
                </div>
              </div>

              {/* Mini KPIs do Relatório */}
              {reportKpis.length > 0 && (
                <div style={styles.kpiCardsRow}>
                  {reportKpis.map((kpi, idx) => (
                    <div key={idx} style={{ ...styles.kpiMiniCard, borderLeft: `3px solid ${kpi.color}` }}>
                      <span style={styles.kpiMiniLabel}>{kpi.label}</span>
                      <span style={{ ...styles.kpiMiniVal, color: kpi.color }}>{kpi.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabela de Dados */}
            <div style={styles.tableWrap}>
              {reportData.length === 0 ? (
                <div style={styles.emptyState}>
                  <AlertTriangle size={32} color="#94a3b8" />
                  <p>Nenhum registro encontrado para este relatório com os filtros aplicados.</p>
                </div>
              ) : (
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {reportColumns.map(col => (
                        <th key={col.key} style={styles.th}>{col.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, rIdx) => (
                      <tr key={rIdx} style={rIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                        {reportColumns.map(col => {
                          const val = row[col.key];
                          const isAlert = typeof val === 'string' && (val.includes('CRÍTICO') || val.includes('EXPIRADA') || val.includes('Alerta'));
                          const isSuccess = typeof val === 'string' && (val.includes('Ativo') || val.includes('Seguro') || val.includes('Meta SBN'));
                          return (
                            <td key={col.key} style={{
                              ...styles.td,
                              fontWeight: (col.key === 'name' || col.key === 'patientName') ? '700' : 'normal',
                              color: isAlert ? '#dc2626' : (isSuccess ? '#059669' : '#1e293b')
                            }}>
                              {val !== undefined ? val : '-'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    padding: '1rem',
    backdropFilter: 'blur(3px)'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '14px',
    width: '100%',
    maxWidth: '1240px',
    height: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#faf5ff'
  },
  headerIconWrap: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#f3e8ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #e9d5ff'
  },
  headerTitle: {
    margin: 0,
    fontSize: '1.15rem',
    fontWeight: '800',
    color: '#581c87',
    letterSpacing: '-0.02em'
  },
  headerSub: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.8rem',
    color: '#7e22ce'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#64748b',
    cursor: 'pointer',
    padding: '0.4rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    display: 'grid',
    gridTemplateColumns: '320px 1fr',
    flexGrow: 1,
    overflow: 'hidden'
  },
  sidebar: {
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden'
  },
  sectionTabs: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.3rem',
    padding: '0.65rem',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#ffffff'
  },
  sectionTabBtn: {
    padding: '0.3rem 0.6rem',
    fontSize: '0.75rem',
    fontWeight: '700',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    color: '#64748b',
    cursor: 'pointer',
    transition: 'all 0.15s'
  },
  sectionTabBtnActive: {
    backgroundColor: '#8b5cf6',
    color: '#ffffff',
    borderColor: '#8b5cf6'
  },
  reportsList: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '0.5rem'
  },
  reportItem: {
    display: 'flex',
    gap: '0.65rem',
    padding: '0.65rem',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '0.3rem',
    border: '1px solid transparent',
    transition: 'all 0.15s ease'
  },
  reportItemActive: {
    backgroundColor: '#ffffff',
    borderColor: '#ddd6fe',
    boxShadow: '0 2px 4px rgba(139, 92, 246, 0.08)'
  },
  reportItemIcon: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0
  },
  reportItemTitle: {
    fontSize: '0.82rem',
    fontWeight: '700',
    display: 'block',
    lineHeight: 1.25
  },
  reportItemDesc: {
    fontSize: '0.72rem',
    color: '#64748b',
    margin: '0.15rem 0 0 0',
    lineHeight: 1.3
  },
  contentArea: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    padding: '1rem'
  },
  reportMetaCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '10px',
    padding: '0.85rem 1rem',
    border: '1px solid #e2e8f0',
    marginBottom: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.65rem'
  },
  reportTitle: {
    margin: 0,
    fontSize: '1rem',
    fontWeight: '800',
    color: '#0f172a'
  },
  reportSubtitle: {
    margin: '0.15rem 0 0 0',
    fontSize: '0.78rem',
    color: '#64748b'
  },
  excelBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    backgroundColor: '#ecfdf5',
    color: '#047857',
    border: '1px solid #a7f3d0',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  pdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    backgroundColor: '#f5f3ff',
    color: '#7c3aed',
    border: '1px solid #ddd6fe',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.8rem',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    border: '1px solid #cbd5e1',
    fontSize: '0.8rem',
    fontWeight: '700',
    cursor: 'pointer'
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    borderTop: '1px solid #e2e8f0',
    paddingTop: '0.5rem'
  },
  searchInput: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    fontSize: '0.8rem',
    width: '100%'
  },
  filterLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#475569'
  },
  filterSelect: {
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    padding: '0.35rem 0.5rem',
    fontSize: '0.78rem',
    backgroundColor: '#ffffff'
  },
  kpiCardsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
    gap: '0.5rem',
    marginTop: '0.2rem'
  },
  kpiMiniCard: {
    backgroundColor: '#ffffff',
    padding: '0.45rem 0.75rem',
    borderRadius: '6px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column'
  },
  kpiMiniLabel: {
    fontSize: '0.68rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiMiniVal: {
    fontSize: '1.05rem',
    fontWeight: '800',
    marginTop: '0.1rem'
  },
  tableWrap: {
    flexGrow: 1,
    overflow: 'auto',
    border: '1px solid #e2e8f0',
    borderRadius: '8px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.8rem'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    padding: '0.55rem 0.75rem',
    textAlign: 'left',
    borderBottom: '2px solid #e2e8f0',
    position: 'sticky',
    top: 0,
    zIndex: 1
  },
  td: {
    padding: '0.55rem 0.75rem',
    borderBottom: '1px solid #f1f5f9'
  },
  trEven: {
    backgroundColor: '#ffffff'
  },
  trOdd: {
    backgroundColor: '#fafafa'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '240px',
    gap: '0.75rem',
    color: '#64748b',
    fontSize: '0.85rem'
  }
};
