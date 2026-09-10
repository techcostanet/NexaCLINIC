import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, FileSpreadsheet, Calendar, 
  Users, Activity, MapPin, Printer, ShieldCheck,
  Clock, Heart, CheckCircle2, AlertTriangle, UserCheck,
  Ambulance, Building2, Stethoscope, Search
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../../firebase';

export default function ReceptionReportsModal({
  isOpen,
  onClose,
  patients = [],
  schedules = [],
  currentUser
}) {
  // Seletor de Categoria e Relatório
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'PATIENTS' | 'NEFROLOGIA' | 'LOGISTICA' | 'RONDA'
  const [selectedReport, setSelectedReport] = useState('PACIENTES_CENSO_GERAL');

  // Filtros Globais
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    d.setDate(0);
    return d.toISOString().substring(0, 10);
  });
  const [filterShift, setFilterShift] = useState('Todos');
  const [filterRoom, setFilterRoom] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [filterSearch, setFilterSearch] = useState('');

  // Configurações da Clínica
  const [tenantSettings, setTenantSettings] = useState({ 
    name: 'Nexa Clínica & Nefrologia', 
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
        console.error('Erro ao carregar configurações para relatório:', err);
      }
    };
    loadTenant();
    return () => { isMounted = false; };
  }, []);

  // Catálogo de Relatórios da Recepção (12 Relatórios)
  const REPORTS = [
    // Seção Pacientes
    { id: 'PACIENTES_CENSO_GERAL', section: 'PATIENTS', name: '1. Censo Geral de Cadastros', icon: Users, desc: 'Relação nominal completa de pacientes cadastrados com status e prontuário.' },
    { id: 'PACIENTES_ATIVOS_DIALISE', section: 'PATIENTS', name: '2. Pacientes Ativos em Diálise', icon: CheckCircle2, desc: 'Pacientes em tratamento dialítico regular com frequência semanal, turno e sala.' },
    { id: 'PACIENTES_MAPA_POLTRONAS', section: 'PATIENTS', name: '3. Mapa de Poltronas & Ocupação', icon: Activity, desc: 'Mapeamento de alocação de pacientes por salão, turno e poltrona.' },
    { id: 'PACIENTES_DEMOGRAFICO', section: 'PATIENTS', name: '4. Censo Demográfico & Faixa Etária', icon: Users, desc: 'Perfil etário, gênero, naturalidade e município de residência.' },

    // Seção Nefrologia
    { id: 'NEFRO_ACESSOS_VASCULARES', section: 'NEFROLOGIA', name: '5. Censo de Acessos Vasculares', icon: Activity, desc: 'Distribuição dos pacientes por FAV, CDL, Permcath e prótese.' },
    { id: 'NEFRO_MODALIDADES', section: 'NEFROLOGIA', name: '6. Modalidades de Terapia Renal', icon: Stethoscope, desc: 'Distribuição entre Hemodiálise (HD), CAPD, APD e TTO Conservador.' },
    { id: 'NEFRO_TRANSPLANTE', section: 'NEFROLOGIA', name: '7. Fila de Transplante Renal', icon: Heart, desc: 'Pacientes inscritos em lista de transplante e centros transplantadores.' },

    // Seção Logística & Faturamento
    { id: 'LOGISTICA_TRANSPORTE', section: 'LOGISTICA', name: '8. Transporte Sanitário & Logística', icon: Ambulance, desc: 'Relação por tipo de transporte (van, ambulância, próprio) e município.' },
    { id: 'LOGISTICA_MUNICIPIOS', section: 'LOGISTICA', name: '9. Censo por Município de Origem', icon: MapPin, desc: 'Distribuição geográfica por prefeituras conveniadas e cidades.' },
    { id: 'LOGISTICA_CONVENIOS', section: 'LOGISTICA', name: '10. Censo de Convênios & SUS', icon: Building2, desc: 'Proporção e relação analítica de pacientes do SUS e convênios privados.' },

    // Seção Ronda Médica
    { id: 'RONDA_AUDITORIA_PRESENCIAL', section: 'RONDA', name: '11. Auditoria Presencial de Ronda', icon: UserCheck, desc: 'Espelho de conformidade presencial dos médicos nos turnos e salões.' },
    { id: 'RONDA_DESFALQUES_OCORRENCIAS', section: 'RONDA', name: '12. Ocorrências & Desfalques de Ronda', icon: AlertTriangle, desc: 'Histórico de atrasos, ausências, substituições e observações da ronda.' }
  ];

  const filteredReportsList = useMemo(() => {
    if (activeSection === 'ALL') return REPORTS;
    return REPORTS.filter(r => r.section === activeSection);
  }, [activeSection]);

  // Funções Auxiliares de Cálculo
  const calculateAge = (birthDate) => {
    if (!birthDate) return '-';
    const diff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

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

  // Base Filtrada de Pacientes
  const filteredPatients = useMemo(() => {
    return (patients || []).filter(p => {
      const matchesShift = filterShift === 'Todos' || p.shift === filterShift;
      const matchesRoom = filterRoom === 'Todas' || p.room === filterRoom;
      const matchesStatus = filterStatus === 'Todos' || (p.treatmentStatus || 'Ativo') === filterStatus;
      
      const searchNorm = filterSearch.trim().toLowerCase();
      const matchesSearch = !searchNorm || 
        (p.name && p.name.toLowerCase().includes(searchNorm)) ||
        (p.cpf && p.cpf.replace(/\D/g, '').includes(searchNorm)) ||
        (p.chartNumber && p.chartNumber.toLowerCase().includes(searchNorm)) ||
        (p.city && p.city.toLowerCase().includes(searchNorm));

      return matchesShift && matchesRoom && matchesStatus && matchesSearch;
    });
  }, [patients, filterShift, filterRoom, filterStatus, filterSearch]);

  // Base Filtrada de Ronda Médica
  const filteredRondaSchedules = useMemo(() => {
    return (schedules || []).filter(s => {
      const sDate = s.date || '';
      const inDateRange = (!startDate || sDate >= startDate) && (!endDate || sDate <= endDate);
      const matchesShift = filterShift === 'Todos' || (s.shift || '').includes(filterShift);
      const matchesRoom = filterRoom === 'Todas' || (s.sector || s.room || '').includes(filterRoom);
      return inDateRange && matchesShift && matchesRoom;
    });
  }, [schedules, startDate, endDate, filterShift, filterRoom]);

  // Geração de Dados, Colunas e KPIs do Relatório Selecionado
  const { reportData, reportColumns, reportKpis, currentReportMeta } = useMemo(() => {
    const meta = REPORTS.find(r => r.id === selectedReport) || REPORTS[0];
    let data = [];
    let cols = [];
    let kpis = [];

    switch (selectedReport) {
      case 'PACIENTES_CENSO_GERAL': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Nome', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'CPF', key: 'cpf' },
          { header: 'CNS', key: 'cns' },
          { header: 'Idade', key: 'age' },
          { header: 'Gênero', key: 'gender' },
          { header: 'Telefone', key: 'phone' },
          { header: 'Convênio', key: 'insurance' },
          { header: 'Status', key: 'status' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || 'Sem Nome',
          chartNumber: p.chartNumber || '-',
          cpf: p.cpf || '-',
          cns: p.cns || '-',
          age: calculateAge(p.birthDate),
          gender: p.gender || '-',
          phone: p.phone || p.whatsapp || '-',
          insurance: p.insurance || 'SUS',
          status: p.treatmentStatus || 'Ativo'
        }));

        const total = data.length;
        const ativos = data.filter(d => d.status === 'Ativo').length;
        const suspensos = data.filter(d => d.status === 'Suspenso').length;
        kpis = [
          { label: 'Total Cadastrados', value: total, color: '#0f172a' },
          { label: 'Ativos', value: ativos, color: '#10b981' },
          { label: 'Suspensos / Inativos', value: suspensos, color: '#f59e0b' }
        ];
        break;
      }

      case 'PACIENTES_ATIVOS_DIALISE': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Nome', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Frequência', key: 'freq' },
          { header: 'Turno', key: 'shift' },
          { header: 'Sala', key: 'room' },
          { header: 'Poltrona', key: 'chair' },
          { header: 'Acesso', key: 'accessType' },
          { header: 'Convênio', key: 'insurance' }
        ];
        const activeList = filteredPatients.filter(p => (p.treatmentStatus || 'Ativo') === 'Ativo');
        data = activeList.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          freq: p.dialysisFrequency || 'Seg/Qua/Sex',
          shift: p.shift || '1º Turno',
          room: p.room || 'Salão 1',
          chair: p.chairNumber || p.point || '-',
          accessType: p.accessType || 'FAV',
          insurance: p.insurance || 'SUS'
        }));

        const segQuaSex = data.filter(d => (d.freq || '').includes('Seg')).length;
        const terQuiSab = data.filter(d => (d.freq || '').includes('Ter')).length;
        kpis = [
          { label: 'Pacientes Ativos', value: data.length, color: '#10b981' },
          { label: 'Seg / Qua / Sex', value: segQuaSex, color: '#4f46e5' },
          { label: 'Ter / Qui / Sáb', value: terQuiSab, color: '#0284c7' }
        ];
        break;
      }

      case 'PACIENTES_MAPA_POLTRONAS': {
        cols = [
          { header: 'Sala', key: 'room' },
          { header: 'Turno', key: 'shift' },
          { header: 'Poltrona', key: 'chair' },
          { header: 'Paciente', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Frequência', key: 'freq' },
          { header: 'Acesso', key: 'accessType' }
        ];
        const activeList = filteredPatients.filter(p => (p.treatmentStatus || 'Ativo') === 'Ativo');
        data = activeList.map(p => ({
          room: p.room || 'Salão 1',
          shift: p.shift || '1º Turno',
          chair: p.chairNumber || p.point || 'P-01',
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          freq: p.dialysisFrequency || 'Seg/Qua/Sex',
          accessType: p.accessType || 'FAV'
        })).sort((a, b) => (a.room + a.shift + a.chair).localeCompare(b.room + b.shift + b.chair));

        const totalChairs = data.length;
        const sala1 = data.filter(d => d.room.includes('1')).length;
        const sala2 = data.filter(d => d.room.includes('2')).length;
        kpis = [
          { label: 'Poltronas Alocadas', value: totalChairs, color: '#0f172a' },
          { label: 'Salão 1', value: sala1, color: '#0284c7' },
          { label: 'Salão 2 / Outros', value: sala2, color: '#8b5cf6' }
        ];
        break;
      }

      case 'PACIENTES_DEMOGRAFICO': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Nome', key: 'name' },
          { header: 'Idade', key: 'age' },
          { header: 'Gênero', key: 'gender' },
          { header: 'Estado Civil', key: 'maritalStatus' },
          { header: 'Município', key: 'city' },
          { header: 'Bairro', key: 'neighborhood' },
          { header: 'Etnia', key: 'race' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          age: calculateAge(p.birthDate),
          gender: p.gender || 'Masculino',
          maritalStatus: p.maritalStatus || 'Não informado',
          city: p.city || 'Betim',
          neighborhood: p.neighborhood || '-',
          race: p.race || '-'
        }));

        const masc = data.filter(d => d.gender === 'Masculino').length;
        const fem = data.filter(d => d.gender === 'Feminino').length;
        const ages = data.map(d => parseInt(d.age)).filter(n => !isNaN(n));
        const mediaIdade = ages.length > 0 ? Math.round(ages.reduce((a, b) => a + b, 0) / ages.length) : '-';
        kpis = [
          { label: 'Idade Média', value: `${mediaIdade} anos`, color: '#0f172a' },
          { label: 'Gênero Masculino', value: masc, color: '#2563eb' },
          { label: 'Gênero Feminino', value: fem, color: '#ec4899' }
        ];
        break;
      }

      case 'NEFRO_ACESSOS_VASCULARES': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Paciente', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Tipo Acesso', key: 'accessType' },
          { header: 'Localização', key: 'accessLocation' },
          { header: 'Data Implante', key: 'accessDate' },
          { header: 'Turno', key: 'shift' },
          { header: 'Status', key: 'status' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          accessType: p.accessType || 'FAV',
          accessLocation: p.accessLocation || p.limb || 'MSE',
          accessDate: p.accessDate ? formatDateBR(p.accessDate) : '-',
          shift: p.shift || '-',
          status: p.treatmentStatus || 'Ativo'
        }));

        const fav = data.filter(d => (d.accessType || '').toUpperCase().includes('FAV')).length;
        const perm = data.filter(d => (d.accessType || '').toUpperCase().includes('PERM')).length;
        const cdl = data.filter(d => (d.accessType || '').toUpperCase().includes('CDL')).length;
        kpis = [
          { label: 'Fístulas (FAV)', value: fav, color: '#10b981' },
          { label: 'Permcath', value: perm, color: '#0284c7' },
          { label: 'Duplo Lúmen (CDL)', value: cdl, color: '#f59e0b' }
        ];
        break;
      }

      case 'NEFRO_MODALIDADES': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Paciente', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Modalidade', key: 'treatmentType' },
          { header: 'Etiologia DRC', key: 'etiology' },
          { header: 'Início Diálise', key: 'startDialysis' },
          { header: 'Tipo Paciente', key: 'patientType' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          treatmentType: p.treatmentType || 'HD',
          etiology: p.primaryDisease || p.etiology || 'DM / HAS',
          startDialysis: p.firstDialysisDate ? formatDateBR(p.firstDialysisDate) : '-',
          patientType: p.patientType || 'Crônico'
        }));

        const hd = data.filter(d => d.treatmentType === 'HD').length;
        const peritoneal = data.filter(d => ['CAPD', 'APD', 'DPI'].includes(d.treatmentType)).length;
        const outros = data.length - hd - peritoneal;
        kpis = [
          { label: 'Hemodiálise (HD)', value: hd, color: '#2563eb' },
          { label: 'Diálise Peritoneal', value: peritoneal, color: '#8b5cf6' },
          { label: 'Outras Modalidades', value: outros, color: '#64748b' }
        ];
        break;
      }

      case 'NEFRO_TRANSPLANTE': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Paciente', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Status Fila', key: 'txStatus' },
          { header: 'Centro Transplantador', key: 'txCenter' },
          { header: 'Tipo Sanguíneo', key: 'bloodType' },
          { header: 'Data Inscrição', key: 'txDate' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          txStatus: p.transplantStatus || p.txStatus || 'Inscrito',
          txCenter: p.transplantCenter || 'Hospital Felício Rocho',
          bloodType: p.bloodType || 'O+',
          txDate: p.transplantListDate ? formatDateBR(p.transplantListDate) : '-'
        }));

        const inscritos = data.filter(d => d.txStatus === 'Inscrito' || d.txStatus === 'Ativo').length;
        const avaliacao = data.filter(d => d.txStatus === 'Em Avaliação' || d.txStatus === 'Pendente').length;
        kpis = [
          { label: 'Inscritos em Fila', value: inscritos, color: '#10b981' },
          { label: 'Em Avaliação Pré-Tx', value: avaliacao, color: '#f59e0b' },
          { label: 'Total Mapeados', value: data.length, color: '#0f172a' }
        ];
        break;
      }

      case 'LOGISTICA_TRANSPORTE': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Paciente', key: 'name' },
          { header: 'Transporte', key: 'transportType' },
          { header: 'Município', key: 'city' },
          { header: 'Turno', key: 'shift' },
          { header: 'Dias', key: 'freq' },
          { header: 'Telefone', key: 'phone' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          transportType: p.transportType || 'Van da Prefeitura',
          city: p.city || 'Betim',
          shift: p.shift || '1º Turno',
          freq: p.dialysisFrequency || 'Seg/Qua/Sex',
          phone: p.phone || '-'
        }));

        const van = data.filter(d => (d.transportType || '').toLowerCase().includes('van')).length;
        const amb = data.filter(d => (d.transportType || '').toLowerCase().includes('ambul')).length;
        const prop = data.filter(d => (d.transportType || '').toLowerCase().includes('próp') || (d.transportType || '').toLowerCase().includes('prop')).length;
        kpis = [
          { label: 'Van Prefeitura', value: van, color: '#0284c7' },
          { label: 'Ambulância', value: amb, color: '#ef4444' },
          { label: 'Transporte Próprio', value: prop || (data.length - van - amb), color: '#10b981' }
        ];
        break;
      }

      case 'LOGISTICA_MUNICIPIOS': {
        cols = [
          { header: 'Município', key: 'city' },
          { header: 'UF', key: 'state' },
          { header: 'Pacientes', key: 'count' },
          { header: 'SUS', key: 'susCount' },
          { header: 'Convênio', key: 'privCount' }
        ];

        const grouped = {};
        filteredPatients.forEach(p => {
          const c = p.city || 'Betim';
          if (!grouped[c]) grouped[c] = { city: c, state: p.state || 'MG', count: 0, susCount: 0, privCount: 0 };
          grouped[c].count++;
          if ((p.insurance || 'SUS').toUpperCase() === 'SUS') grouped[c].susCount++;
          else grouped[c].privCount++;
        });

        data = Object.values(grouped).sort((a, b) => b.count - a.count);
        const totalCidades = data.length;
        const cidadePrincipal = data[0] ? `${data[0].city} (${data[0].count})` : '-';
        kpis = [
          { label: 'Municípios Atendidos', value: totalCidades, color: '#0f172a' },
          { label: 'Maior Concentração', value: cidadePrincipal, color: '#2563eb' },
          { label: 'Total Pacientes', value: filteredPatients.length, color: '#10b981' }
        ];
        break;
      }

      case 'LOGISTICA_CONVENIOS': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Paciente', key: 'name' },
          { header: 'Prontuário', key: 'chartNumber' },
          { header: 'Convênio', key: 'insurance' },
          { header: 'Número Carteira', key: 'insuranceNumber' },
          { header: 'Plano', key: 'plan' },
          { header: 'Status', key: 'status' }
        ];
        data = filteredPatients.map((p, idx) => ({
          idx: idx + 1,
          name: p.name || '-',
          chartNumber: p.chartNumber || '-',
          insurance: p.insurance || 'SUS',
          insuranceNumber: p.insuranceNumber || p.cns || '-',
          plan: p.plan || 'Padrão',
          status: p.treatmentStatus || 'Ativo'
        }));

        const sus = data.filter(d => (d.insurance || '').toUpperCase() === 'SUS').length;
        const conv = data.length - sus;
        const percSus = data.length > 0 ? Math.round((sus / data.length) * 100) : 0;
        kpis = [
          { label: 'Pacientes SUS', value: `${sus} (${percSus}%)`, color: '#0284c7' },
          { label: 'Convênios Privados', value: `${conv} (${100 - percSus}%)`, color: '#8b5cf6' },
          { label: 'Total Cobertos', value: data.length, color: '#0f172a' }
        ];
        break;
      }

      case 'RONDA_AUDITORIA_PRESENCIAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Salão', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Médico', key: 'doctor' },
          { header: 'CRM', key: 'crm' },
          { header: 'Presença', key: 'status' },
          { header: 'Horário', key: 'time' },
          { header: 'Substituto', key: 'substitute' }
        ];
        data = filteredRondaSchedules.map(s => ({
          date: formatDateBR(s.date),
          sector: s.sector || s.room || 'Salão 1',
          shift: s.shift || '1º Turno',
          doctor: s.doctorName || s.doctor || 'Dr. Plantonista',
          crm: s.doctorCrm || s.crm || 'CRM Ativo',
          status: s.checkinStatus || 'Presente',
          time: s.checkinTime || '07:00',
          substitute: s.substituteName || '-'
        }));

        const pres = data.filter(d => d.status === 'Presente').length;
        const atrasos = data.filter(d => d.status === 'Atraso').length;
        const subst = data.filter(d => d.status === 'Substituído').length;
        kpis = [
          { label: 'Rondas Auditadas', value: data.length, color: '#0f172a' },
          { label: 'Presenças Confirmadas', value: pres, color: '#10b981' },
          { label: 'Atrasos / Trocas', value: atrasos + subst, color: '#f59e0b' }
        ];
        break;
      }

      case 'RONDA_DESFALQUES_OCORRENCIAS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Salão', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Médico Titular', key: 'doctor' },
          { header: 'Ocorrência', key: 'status' },
          { header: 'Médico Substituto', key: 'substitute' },
          { header: 'Observações', key: 'notes' }
        ];
        const occurrences = filteredRondaSchedules.filter(s => 
          s.checkinStatus === 'Atraso' || 
          s.checkinStatus === 'Substituído' || 
          s.checkinStatus === 'Ausente' ||
          Boolean(s.substituteName) ||
          Boolean(s.notes)
        );

        data = occurrences.map(s => ({
          date: formatDateBR(s.date),
          sector: s.sector || s.room || 'Salão 1',
          shift: s.shift || '1º Turno',
          doctor: s.doctorName || s.doctor || 'Dr. Titular',
          status: s.checkinStatus || 'Ocorrência',
          substitute: s.substituteName || '-',
          notes: s.notes || 'Ronda regular ajustada com coordenação.'
        }));

        const ausencias = data.filter(d => d.status === 'Ausente').length;
        const substitutos = data.filter(d => d.substitute !== '-').length;
        kpis = [
          { label: 'Total de Ocorrências', value: data.length, color: '#f59e0b' },
          { label: 'Substituições Realizadas', value: substitutos, color: '#0284c7' },
          { label: 'Ausências Registradas', value: ausencias, color: '#ef4444' }
        ];
        break;
      }

      default:
        break;
    }

    return { reportData: data, reportColumns: cols, reportKpis: kpis, currentReportMeta: meta };
  }, [selectedReport, filteredPatients, filteredRondaSchedules]);

  // Exportação em PDF Formatado
  const exportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const title = currentReportMeta.name;

      // Header institucional
      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(tenantSettings.name || 'Nexa Clínica & Nefrologia', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | Módulo Recepção & Admissão (.RECEPTION)`, 14, 21);
      doc.text(`Relatório: ${title}`, 14, 27);
      doc.text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} | Turno: ${filterShift} | Sala: ${filterRoom}`, 14, 33);

      const tableColumn = reportColumns.map(c => c.header);
      const tableRows = reportData.map(row => 
        reportColumns.map(col => row[col.key] ?? '-')
      );

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [13, 148, 136] }, // teal-600
        alternateRowStyles: { fillColor: [240, 253, 250] }
      });

      doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_NexaReception.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF da Recepção:', err);
      alert('Erro ao gerar relatório em PDF.');
    }
  };

  // Exportação em Planilha Excel
  const exportXLS = () => {
    try {
      const title = currentReportMeta.name;
      const wsData = reportData.map(row => {
        const newRow = {};
        reportColumns.forEach(col => {
          newRow[col.header] = row[col.key] ?? '';
        });
        return newRow;
      });

      const ws = XLSX.utils.json_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Relatório');

      const dateStr = new Date().toISOString().substring(0, 10);
      XLSX.writeFile(wb, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.xlsx`);
    } catch (err) {
      console.error('Erro ao exportar Excel da Recepção:', err);
      alert('Erro ao gerar planilha Excel.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const sectionColors = {
    PATIENTS: '#0d9488',
    NEFROLOGIA: '#0284c7',
    LOGISTICA: '#f59e0b',
    RONDA: '#6366f1'
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header do Modal */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <div style={styles.headerIconBadge}>
              <FileText size={22} color="#ffffff" />
            </div>
            <div>
              <h2 style={styles.headerTitle}>Central de Relatórios da Recepção</h2>
              <p style={styles.headerSubtitle}>
                Relatórios especializados de Admissão, Censo Clínico, Transporte Sanitário e Auditoria de Ronda Médica.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar modal">
            <X size={22} />
          </button>
        </div>

        {/* Abas Superiores Rápidas (Sem contagens numéricas nas abas) */}
        <div style={styles.tabBar}>
          <div style={styles.tabButtonGroup}>
            <button
              type="button"
              onClick={() => setActiveSection('ALL')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'ALL' ? '#0f172a' : 'transparent',
                color: activeSection === 'ALL' ? '#ffffff' : '#64748b'
              }}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PATIENTS')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'PATIENTS' ? '#0d9488' : 'transparent',
                color: activeSection === 'PATIENTS' ? '#ffffff' : '#64748b'
              }}
            >
              <Users size={14} />
              <span>Pacientes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('NEFROLOGIA')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'NEFROLOGIA' ? '#0284c7' : 'transparent',
                color: activeSection === 'NEFROLOGIA' ? '#ffffff' : '#64748b'
              }}
            >
              <Activity size={14} />
              <span>Nefrologia</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('LOGISTICA')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'LOGISTICA' ? '#f59e0b' : 'transparent',
                color: activeSection === 'LOGISTICA' ? '#ffffff' : '#64748b'
              }}
            >
              <Ambulance size={14} />
              <span>Logística</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('RONDA')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'RONDA' ? '#6366f1' : 'transparent',
                color: activeSection === 'RONDA' ? '#ffffff' : '#64748b'
              }}
            >
              <UserCheck size={14} />
              <span>Ronda</span>
            </button>
          </div>
        </div>

        <div style={styles.body}>
          {/* Sidebar de Relatórios */}
          <div style={styles.sidebar}>
            <div style={styles.sidebarTitle}>Relatórios Disponíveis</div>
            <div style={styles.sidebarList}>
              {filteredReportsList.map(r => {
                const isSelected = selectedReport === r.id;
                const Icon = r.icon;
                const sectionColor = sectionColors[r.section] || '#0d9488';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReport(r.id)}
                    style={{
                      ...styles.reportItemBtn,
                      backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                      color: isSelected ? '#0f766e' : '#334155',
                      borderLeft: isSelected ? `4px solid ${sectionColor}` : '4px solid transparent'
                    }}
                  >
                    <Icon size={16} color={isSelected ? sectionColor : '#94a3b8'} />
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: isSelected ? '700' : '600' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: '1.2' }}>
                        {r.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Área Principal de Filtros e Visualização */}
          <div style={styles.main}>
            {/* Barra Superior de Filtros */}
            <div style={styles.filtersBar}>
              <div style={styles.filtersLeft}>
                {selectedReport.startsWith('RONDA') ? (
                  <>
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>Inicial</label>
                      <input
                        type="date"
                        value={startDate}
                        onChange={e => setStartDate(e.target.value)}
                        style={styles.filterInput}
                      />
                    </div>
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>Final</label>
                      <input
                        type="date"
                        value={endDate}
                        onChange={e => setEndDate(e.target.value)}
                        style={styles.filterInput}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>Turno</label>
                      <select
                        value={filterShift}
                        onChange={e => setFilterShift(e.target.value)}
                        style={styles.filterSelect}
                      >
                        <option value="Todos">Todos</option>
                        <option value="1º Turno">1º Turno</option>
                        <option value="2º Turno">2º Turno</option>
                        <option value="3º Turno">3º Turno</option>
                        <option value="4º Turno">4º Turno</option>
                      </select>
                    </div>
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>Sala</label>
                      <select
                        value={filterRoom}
                        onChange={e => setFilterRoom(e.target.value)}
                        style={styles.filterSelect}
                      >
                        <option value="Todas">Todas</option>
                        <option value="Salão 1">Salão 1</option>
                        <option value="Salão 2">Salão 2</option>
                        <option value="Agudos">Agudos</option>
                        <option value="Peritoneal">Peritoneal</option>
                      </select>
                    </div>
                    <div style={styles.filterGroup}>
                      <label style={styles.filterLabel}>Status</label>
                      <select
                        value={filterStatus}
                        onChange={e => setFilterStatus(e.target.value)}
                        style={styles.filterSelect}
                      >
                        <option value="Todos">Todos</option>
                        <option value="Ativo">Ativo</option>
                        <option value="Suspenso">Suspenso</option>
                        <option value="Em Trânsito">Em Trânsito</option>
                        <option value="Transplantado">Transplantado</option>
                      </select>
                    </div>
                  </>
                )}

                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Busca</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <Search size={14} style={{ position: 'absolute', left: '8px', color: '#94a3b8' }} />
                    <input
                      type="text"
                      placeholder="Filtrar por nome, CPF..."
                      value={filterSearch}
                      onChange={e => setFilterSearch(e.target.value)}
                      style={{ ...styles.filterInput, paddingLeft: '26px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div style={styles.actionButtons}>
                <button onClick={exportPDF} style={styles.exportPdfBtn} title="Exportar para arquivo PDF formatado">
                  <Download size={15} />
                  <span>PDF</span>
                </button>
                <button onClick={exportXLS} style={styles.exportXlsBtn} title="Exportar para planilha Excel">
                  <FileSpreadsheet size={15} />
                  <span>Excel</span>
                </button>
                <button onClick={handlePrint} style={styles.printBtn} title="Imprimir diretamente no navegador">
                  <Printer size={15} />
                  <span>Imprimir</span>
                </button>
              </div>
            </div>

            {/* Cards de Indicadores Rápidos (KPIs) */}
            {reportKpis.length > 0 && (
              <div style={styles.kpiContainer}>
                {reportKpis.map((k, idx) => (
                  <div key={idx} style={styles.kpiCard}>
                    <span style={styles.kpiLabel}>{k.label}</span>
                    <span style={{ ...styles.kpiValue, color: k.color || '#0f172a' }}>{k.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Tabela de Pré-visualização */}
            <div style={styles.tableCard}>
              <div style={styles.tableHeaderBar}>
                <h3 style={styles.tableTitle}>Pré-visualização: {currentReportMeta.name}</h3>
                <span style={styles.tableCountBadge}>{reportData.length} registros</span>
              </div>

              <div style={styles.tableScrollArea}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      {reportColumns.map(col => (
                        <th key={col.key} style={styles.th}>{col.header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.length === 0 ? (
                      <tr>
                        <td colSpan={reportColumns.length} style={styles.emptyTd}>
                          Nenhum registro encontrado para os filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, rIdx) => (
                        <tr key={rIdx} style={rIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                          {reportColumns.map(col => (
                            <td key={col.key} style={styles.td}>
                              {col.key === 'status' ? (
                                <span style={{
                                  ...styles.statusBadge,
                                  backgroundColor: row.status === 'Ativo' || row.status === 'Presente' ? '#ecfdf5' : '#fef3c7',
                                  color: row.status === 'Ativo' || row.status === 'Presente' ? '#047857' : '#b45309'
                                }}>
                                  {row[col.key]}
                                </span>
                              ) : (
                                row[col.key] ?? '-'
                              )}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '1280px',
    height: '92vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  headerIconBadge: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #0d9488 0%, #0f766e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(13, 148, 136, 0.25)'
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  headerSubtitle: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: '0.2rem 0 0 0'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.15s ease'
  },
  tabBar: {
    padding: '0.65rem 1.5rem',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0'
  },
  tabButtonGroup: {
    display: 'inline-flex',
    backgroundColor: '#e2e8f0',
    padding: '3px',
    borderRadius: '10px',
    gap: '3px'
  },
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.45rem 0.95rem',
    border: 'none',
    borderRadius: '7px',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  body: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    width: '320px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0
  },
  sidebarTitle: {
    padding: '1rem 1.25rem 0.5rem 1.25rem',
    fontSize: '0.75rem',
    fontWeight: '800',
    textTransform: 'uppercase',
    color: '#94a3b8',
    letterSpacing: '0.05em'
  },
  sidebarList: {
    padding: '0.5rem',
    overflowY: 'auto',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem'
  },
  reportItemBtn: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.65rem',
    padding: '0.65rem 0.75rem',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    width: '100%'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    overflowY: 'auto',
    padding: '1.25rem'
  },
  filtersBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    backgroundColor: '#ffffff',
    padding: '0.85rem 1.25rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    flexWrap: 'wrap'
  },
  filtersLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.35rem'
  },
  filterLabel: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#475569'
  },
  filterInput: {
    padding: '0.4rem 0.6rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.825rem',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff'
  },
  filterSelect: {
    padding: '0.4rem 0.6rem',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.825rem',
    color: '#0f172a',
    outline: 'none',
    backgroundColor: '#ffffff',
    cursor: 'pointer'
  },
  actionButtons: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem'
  },
  exportPdfBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#0d9488',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  exportXlsBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#10b981',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  printBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.45rem 0.85rem',
    backgroundColor: '#ffffff',
    color: '#475569',
    border: '1px solid #cbd5e1',
    borderRadius: '6px',
    fontSize: '0.825rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.15s ease'
  },
  kpiContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  kpiCard: {
    backgroundColor: '#ffffff',
    padding: '0.85rem 1.15rem',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem'
  },
  kpiLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase'
  },
  kpiValue: {
    fontSize: '1.35rem',
    fontWeight: '800'
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1
  },
  tableHeaderBar: {
    padding: '0.85rem 1.25rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ffffff'
  },
  tableTitle: {
    fontSize: '0.95rem',
    fontWeight: '800',
    color: '#0f172a',
    margin: 0
  },
  tableCountBadge: {
    padding: '0.2rem 0.55rem',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700'
  },
  tableScrollArea: {
    overflowX: 'auto',
    overflowY: 'auto',
    maxHeight: '480px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left'
  },
  th: {
    backgroundColor: '#f8fafc',
    color: '#475569',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '0.65rem 0.85rem',
    borderBottom: '1px solid #e2e8f0',
    whiteSpace: 'nowrap'
  },
  td: {
    padding: '0.65rem 0.85rem',
    fontSize: '0.825rem',
    color: '#1e293b',
    borderBottom: '1px solid #f1f5f9',
    whiteSpace: 'nowrap'
  },
  trEven: {
    backgroundColor: '#ffffff'
  },
  trOdd: {
    backgroundColor: '#f8fafc'
  },
  emptyTd: {
    padding: '2.5rem',
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: '0.875rem'
  },
  statusBadge: {
    display: 'inline-flex',
    padding: '0.2rem 0.55rem',
    borderRadius: '6px',
    fontSize: '0.75rem',
    fontWeight: '700'
  }
};
