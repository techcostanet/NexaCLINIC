import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, FileSpreadsheet, Calendar, 
  Users, Activity, DollarSign, Printer, ShieldCheck,
  Clock, CheckCircle2, AlertTriangle, UserCheck,
  Stethoscope, Settings, RefreshCw, Search, ArrowRightLeft
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { dbService } from '../../firebase';

export default function MedicalReportsModal({
  isOpen,
  onClose,
  doctors = [],
  schedules = [],
  swaps = [],
  procedures = [],
  productions = [],
  settings = {},
  selectedMonth = new Date().toISOString().substring(0, 7),
  currentUser
}) {
  // Seletor de Categoria e Relatório
  const [activeSection, setActiveSection] = useState('ALL'); // 'ALL' | 'ESCALA' | 'PLANTOES' | 'TROCAS' | 'PROCEDIMENTOS' | 'PRODUCAO' | 'PROFISSIONAIS'
  const [selectedReport, setSelectedReport] = useState('MED_ESCALA_MENSAL');

  // Filtros Globais
  const [monthFilter, setMonthFilter] = useState(selectedMonth);
  const [doctorFilter, setDoctorFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [searchFilter, setSearchFilter] = useState('');

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
        console.error('Erro ao carregar dados da clínica:', err);
      }
    };
    loadTenant();
    return () => { isMounted = false; };
  }, []);

  // Catálogo de Relatórios Médicos (12 Relatórios)
  const REPORTS = [
    // Seção Escala
    { id: 'MED_ESCALA_MENSAL', section: 'ESCALA', name: '1. Escala Mensal Consolidada', icon: Calendar, desc: 'Relação de plantões do mês por dia, turno, salão e médico escalado.' },
    { id: 'MED_ESCALA_LACUNAS', section: 'ESCALA', name: '2. Cobertura & Lacunas de Plantão', icon: AlertTriangle, desc: 'Auditoria de turnos vagos, desfalques e coberturas pendentes.' },

    // Seção Plantões
    { id: 'MED_CARGA_HORARIA', section: 'PLANTOES', name: '3. Carga Horária & Plantões por Médico', icon: Clock, desc: 'Consolidado de plantões escalados, horas estimadas e distribuição.' },
    { id: 'MED_EXTRATO_INDIVIDUAL', section: 'PLANTOES', name: '4. Extrato Individual de Plantões', icon: UserCheck, desc: 'Espelho analítico e cronológico dos plantões do médico selecionado.' },
    { id: 'MED_AUDITORIA_ASSIDUIDADE', section: 'PLANTOES', name: '5. Auditoria de Assiduidade e Presença', icon: ShieldCheck, desc: 'Confronto entre a escala oficial prevista e a presença nos salões.' },

    // Seção Trocas
    { id: 'MED_BOLSA_TROCAS', section: 'TROCAS', name: '6. Histórico da Bolsa de Trocas', icon: ArrowRightLeft, desc: 'Solicitações de troca de plantões entre médicos com status e homologação.' },

    // Seção Procedimentos
    { id: 'MED_PROCEDIMENTOS_EXTRATO', section: 'PROCEDIMENTOS', name: '7. Extrato de Procedimentos Médicos', icon: Activity, desc: 'Procedimentos clínicos e cirúrgicos realizados (CDL, FAV, punções).' },
    { id: 'MED_CENSO_CATETERES', section: 'PROCEDIMENTOS', name: '8. Implantes de Cateter (CDL & Permcath)', icon: Stethoscope, desc: 'Censo específico de implantes e manutenções de acessos vasculares.' },

    // Seção Produção & Honorários
    { id: 'MED_PRODUCAO_CONSOLIDADA', section: 'PRODUCAO', name: '9. Produção Médica Consolidada', icon: DollarSign, desc: 'Demonstrativo mensal de produção por médico somando plantões e procedimentos.' },
    { id: 'MED_REPASSE_HONORARIOS', section: 'PRODUCAO', name: '10. Espelho de Repasse & Honorários', icon: FileText, desc: 'Demonstrativo financeiro de repasses homologados com PIX e dados bancários.' },

    // Seção Profissionais
    { id: 'MED_CADASTRO_CORPO_CLINICO', section: 'PROFISSIONAIS', name: '11. Cadastro do Corpo Clínico', icon: Users, desc: 'Censo de médicos credenciados, CRM, especialidade, contato e contrato.' },
    { id: 'MED_TABELA_PARAMETROS', section: 'PROFISSIONAIS', name: '12. Tabela Vigente de Honorários', icon: Settings, desc: 'Tabela de referência para valores de plantões, procedimentos e rateios.' }
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

  const formatCurrency = (val) => {
    const n = parseFloat(val) || 0;
    return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Base Filtrada de Escala pelo Mês
  const monthSchedules = useMemo(() => {
    return (schedules || []).filter(s => {
      const sDate = s.date || '';
      const inMonth = !monthFilter || sDate.startsWith(monthFilter);
      const matchesDoc = doctorFilter === 'Todos' || s.doctorId === doctorFilter || s.doctorName === doctorFilter;
      const matchesStatus = statusFilter === 'Todos' || s.status === statusFilter || (statusFilter === 'Vago' && !s.doctorId);
      return inMonth && matchesDoc && matchesStatus;
    });
  }, [schedules, monthFilter, doctorFilter, statusFilter]);

  // Base Filtrada de Procedimentos
  const monthProcedures = useMemo(() => {
    return (procedures || []).filter(p => {
      const pDate = p.date || '';
      const inMonth = !monthFilter || pDate.startsWith(monthFilter);
      const matchesDoc = doctorFilter === 'Todos' || p.doctorId === doctorFilter || p.doctorName === doctorFilter;
      return inMonth && matchesDoc;
    });
  }, [procedures, monthFilter, doctorFilter]);

  // Base Filtrada de Trocas
  const monthSwaps = useMemo(() => {
    return (swaps || []).filter(sw => {
      const swDate = sw.originalDate || sw.date || sw.createdAt || '';
      const inMonth = !monthFilter || swDate.startsWith(monthFilter);
      const matchesDoc = doctorFilter === 'Todos' || 
        sw.requesterDoctorId === doctorFilter || 
        sw.targetDoctorId === doctorFilter ||
        sw.requesterName === doctorFilter ||
        sw.targetName === doctorFilter;
      return inMonth && matchesDoc;
    });
  }, [swaps, monthFilter, doctorFilter]);

  // Geração de Dados, Colunas e KPIs do Relatório
  const { reportData, reportColumns, reportKpis, currentReportMeta } = useMemo(() => {
    const meta = REPORTS.find(r => r.id === selectedReport) || REPORTS[0];
    let data = [];
    let cols = [];
    let kpis = [];

    switch (selectedReport) {
      case 'MED_ESCALA_MENSAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Dia', key: 'weekday' },
          { header: 'Salão', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Médico', key: 'doctor' },
          { header: 'CRM', key: 'crm' },
          { header: 'Status', key: 'status' }
        ];

        data = monthSchedules.map(s => {
          const dt = new Date(s.date + 'T12:00:00');
          const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const weekday = !isNaN(dt.getDay()) ? weekdays[dt.getDay()] : '-';
          return {
            date: formatDateBR(s.date),
            weekday,
            sector: s.sector || s.room || 'Salão Principal',
            shift: s.shift || '1º Turno',
            doctor: s.doctorName || s.doctor || (s.doctorId ? 'Médico Escalado' : 'TURNO VAGO'),
            crm: s.doctorCrm || s.crm || '-',
            status: s.doctorId ? 'Confirmado' : 'Vago'
          };
        }).sort((a, b) => a.date.localeCompare(b.date));

        const total = data.length;
        const confirmados = data.filter(d => d.status === 'Confirmado').length;
        const vagos = total - confirmados;
        const txCobertura = total > 0 ? Math.round((confirmados / total) * 100) : 0;
        kpis = [
          { label: 'Total Plantões', value: total, color: '#0f172a' },
          { label: 'Plantões Cobertos', value: confirmados, color: '#10b981' },
          { label: 'Taxa de Cobertura', value: `${txCobertura}%`, color: txCobertura > 90 ? '#10b981' : '#f59e0b' }
        ];
        break;
      }

      case 'MED_ESCALA_LACUNAS': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Dia', key: 'weekday' },
          { header: 'Salão', key: 'sector' },
          { header: 'Turno', key: 'shift' },
          { header: 'Situação', key: 'status' },
          { header: 'Ação Recomendada', key: 'action' }
        ];

        const vagos = monthSchedules.filter(s => !s.doctorId || s.status === 'Vago' || (s.doctorName || '').includes('VAGO'));
        data = vagos.map(s => {
          const dt = new Date(s.date + 'T12:00:00');
          const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const weekday = !isNaN(dt.getDay()) ? weekdays[dt.getDay()] : '-';
          return {
            date: formatDateBR(s.date),
            weekday,
            sector: s.sector || s.room || 'Salão Principal',
            shift: s.shift || '1º Turno',
            status: 'Turno Descoberto',
            action: 'Escalar plantonista ou acionar sobreaviso'
          };
        });

        kpis = [
          { label: 'Lacunas no Mês', value: data.length, color: data.length === 0 ? '#10b981' : '#ef4444' },
          { label: 'Escala Homologada', value: data.length === 0 ? 'Sim (100%)' : 'Com Pendências', color: data.length === 0 ? '#10b981' : '#f59e0b' }
        ];
        break;
      }

      case 'MED_CARGA_HORARIA': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Médico', key: 'name' },
          { header: 'CRM', key: 'crm' },
          { header: 'Especialidade', key: 'specialty' },
          { header: 'Plantões', key: 'count' },
          { header: 'Horas Est.', key: 'hours' },
          { header: 'Vínculo', key: 'contract' }
        ];

        const docMap = {};
        (doctors || []).forEach(d => {
          const dId = d.id || d.uid;
          docMap[dId] = {
            name: d.name,
            crm: d.crm || 'Ativo',
            specialty: d.specialty || 'Nefrologia',
            count: 0,
            contract: d.contractType || 'PJ'
          };
        });

        monthSchedules.forEach(s => {
          if (s.doctorId && docMap[s.doctorId]) {
            docMap[s.doctorId].count++;
          }
        });

        data = Object.values(docMap).map((d, idx) => ({
          idx: idx + 1,
          name: d.name,
          crm: d.crm,
          specialty: d.specialty,
          count: d.count,
          hours: `${d.count * 4}h`,
          contract: d.contract
        })).sort((a, b) => b.count - a.count);

        const totalHoras = data.reduce((acc, curr) => acc + (curr.count * 4), 0);
        const mediaPlantoes = data.length > 0 ? (data.reduce((acc, curr) => acc + curr.count, 0) / data.length).toFixed(1) : 0;
        kpis = [
          { label: 'Horas Médicas no Mês', value: `${totalHoras}h`, color: '#0284c7' },
          { label: 'Médicos Escalados', value: data.filter(d => d.count > 0).length, color: '#10b981' },
          { label: 'Média Plantões/Médico', value: mediaPlantoes, color: '#8b5cf6' }
        ];
        break;
      }

      case 'MED_EXTRATO_INDIVIDUAL': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Turno', key: 'shift' },
          { header: 'Salão', key: 'sector' },
          { header: 'Médico', key: 'doctor' },
          { header: 'Presença', key: 'checkin' },
          { header: 'Valor Plantão', key: 'value' }
        ];

        const defaultShiftVal = parseFloat(settings.defaultShiftValue) || 900;
        data = monthSchedules.map(s => ({
          date: formatDateBR(s.date),
          shift: s.shift || '1º Turno',
          sector: s.sector || s.room || 'Salão 1',
          doctor: s.doctorName || 'Dr(a). Plantonista',
          checkin: s.checkinStatus || 'Confirmado',
          value: formatCurrency(s.shiftValue || defaultShiftVal)
        }));

        const totalVal = data.length * defaultShiftVal;
        kpis = [
          { label: 'Total de Plantões', value: data.length, color: '#0f172a' },
          { label: 'Horas Cumpridas', value: `${data.length * 4}h`, color: '#2563eb' },
          { label: 'Valor Total Previsto', value: formatCurrency(totalVal), color: '#10b981' }
        ];
        break;
      }

      case 'MED_AUDITORIA_ASSIDUIDADE': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Turno', key: 'shift' },
          { header: 'Médico Escalado', key: 'doctor' },
          { header: 'Presença Auditada', key: 'status' },
          { header: 'Check-in', key: 'time' },
          { header: 'Observação', key: 'note' }
        ];

        data = monthSchedules.map(s => ({
          date: formatDateBR(s.date),
          shift: s.shift || '1º Turno',
          doctor: s.doctorName || 'Dr. Plantonista',
          status: s.checkinStatus || 'Presente',
          time: s.checkinTime || '07:00',
          note: s.substituteName ? `Substituído por ${s.substituteName}` : 'Conforme escala'
        }));

        const pres = data.filter(d => d.status === 'Presente').length;
        const perc = data.length > 0 ? Math.round((pres / data.length) * 100) : 100;
        kpis = [
          { label: 'Índice de Presença', value: `${perc}%`, color: '#10b981' },
          { label: 'Presenças Confirmadas', value: pres, color: '#0284c7' },
          { label: 'Total Auditado', value: data.length, color: '#0f172a' }
        ];
        break;
      }

      case 'MED_BOLSA_TROCAS': {
        cols = [
          { header: 'Data Solicitada', key: 'createdAt' },
          { header: 'Solicitante', key: 'requester' },
          { header: 'Data Original', key: 'originalDate' },
          { header: 'Substituto', key: 'target' },
          { header: 'Nova Data', key: 'swapDate' },
          { header: 'Status', key: 'status' },
          { header: 'Homologação', key: 'homolog' }
        ];

        data = monthSwaps.map(sw => ({
          createdAt: formatDateBR(sw.createdAt),
          requester: sw.requesterName || 'Dr. Titular',
          originalDate: formatDateBR(sw.originalDate),
          target: sw.targetName || sw.substituteName || 'Dr. Substituto',
          swapDate: sw.swapDate ? formatDateBR(sw.swapDate) : 'Doação de plantão',
          status: sw.status || 'Homologada',
          homolog: sw.homologatedBy ? `Homologado por ${sw.homologatedBy}` : 'Pendente'
        }));

        const homologadas = data.filter(d => d.status === 'Homologada' || d.status === 'Aceita').length;
        const pendentes = data.length - homologadas;
        kpis = [
          { label: 'Trocas no Mês', value: data.length, color: '#0f172a' },
          { label: 'Homologadas', value: homologadas, color: '#10b981' },
          { label: 'Pendentes', value: pendentes, color: '#f59e0b' }
        ];
        break;
      }

      case 'MED_PROCEDIMENTOS_EXTRATO': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'patient' },
          { header: 'Prontuário', key: 'chart' },
          { header: 'Procedimento', key: 'procedure' },
          { header: 'Médico Executor', key: 'doctor' },
          { header: 'Valor (R$)', key: 'val' },
          { header: 'Status', key: 'status' }
        ];

        data = monthProcedures.map(p => ({
          date: formatDateBR(p.date),
          patient: p.patientName || 'Paciente Ambulatorial',
          chart: p.chartNumber || '-',
          procedure: p.procedureName || p.type || 'Implante de CDL',
          doctor: p.doctorName || 'Dr. Cirurgião',
          val: formatCurrency(p.value || 350),
          status: p.status || 'Concluído'
        }));

        const totalVal = monthProcedures.reduce((acc, curr) => acc + (parseFloat(curr.value) || 350), 0);
        kpis = [
          { label: 'Procedimentos Realizados', value: data.length, color: '#0f172a' },
          { label: 'Valor Total Produzido', value: formatCurrency(totalVal), color: '#10b981' },
          { label: 'Média por Procedimento', value: data.length > 0 ? formatCurrency(totalVal / data.length) : 'R$ 0,00', color: '#0284c7' }
        ];
        break;
      }

      case 'MED_CENSO_CATETERES': {
        cols = [
          { header: 'Data', key: 'date' },
          { header: 'Paciente', key: 'patient' },
          { header: 'Acesso', key: 'type' },
          { header: 'Sítio', key: 'site' },
          { header: 'Médico Executor', key: 'doctor' },
          { header: 'Indicação', key: 'indication' },
          { header: 'Desfecho', key: 'outcome' }
        ];

        const catProcs = monthProcedures.filter(p => {
          const name = (p.procedureName || p.type || '').toUpperCase();
          return name.includes('CDL') || name.includes('PERM') || name.includes('CATETER');
        });

        data = catProcs.map(p => ({
          date: formatDateBR(p.date),
          patient: p.patientName || 'Paciente',
          type: (p.procedureName || '').includes('Perm') ? 'Permcath' : 'CDL (Duplo Lúmen)',
          site: p.site || 'Jugular Interna Direita',
          doctor: p.doctorName || 'Dr. Nefrologista',
          indication: p.indication || 'Falência de FAV / Urgência',
          outcome: p.outcome || 'Sem intercorrências / Fluxo adequado'
        }));

        const perm = data.filter(d => d.type === 'Permcath').length;
        const cdl = data.filter(d => d.type.includes('CDL')).length;
        kpis = [
          { label: 'Implantes de Permcath', value: perm, color: '#0284c7' },
          { label: 'Implantes de CDL', value: cdl, color: '#f59e0b' },
          { label: 'Total de Acessos Realizados', value: data.length, color: '#10b981' }
        ];
        break;
      }

      case 'MED_PRODUCAO_CONSOLIDADA': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Médico', key: 'name' },
          { header: 'CRM', key: 'crm' },
          { header: 'Plantões (R$)', key: 'shiftsVal' },
          { header: 'Procedimentos (R$)', key: 'procsVal' },
          { header: 'Total Bruto', key: 'totalVal' },
          { header: 'Vínculo', key: 'contract' }
        ];

        const defaultShiftVal = parseFloat(settings.defaultShiftValue) || 900;
        const docFinances = {};

        (doctors || []).forEach(d => {
          const dId = d.id || d.uid;
          docFinances[dId] = {
            name: d.name,
            crm: d.crm || 'Ativo',
            shiftsVal: 0,
            procsVal: 0,
            contract: d.contractType || 'PJ'
          };
        });

        monthSchedules.forEach(s => {
          if (s.doctorId && docFinances[s.doctorId]) {
            docFinances[s.doctorId].shiftsVal += (parseFloat(s.shiftValue) || defaultShiftVal);
          }
        });

        monthProcedures.forEach(p => {
          if (p.doctorId && docFinances[p.doctorId]) {
            docFinances[p.doctorId].procsVal += (parseFloat(p.value) || 350);
          }
        });

        data = Object.values(docFinances).map((d, idx) => {
          const tot = d.shiftsVal + d.procsVal;
          return {
            idx: idx + 1,
            name: d.name,
            crm: d.crm,
            shiftsVal: formatCurrency(d.shiftsVal),
            procsVal: formatCurrency(d.procsVal),
            totalVal: formatCurrency(tot),
            rawTotal: tot,
            contract: d.contract
          };
        }).filter(d => d.rawTotal > 0).sort((a, b) => b.rawTotal - a.rawTotal);

        const totalGeral = data.reduce((acc, curr) => acc + curr.rawTotal, 0);
        kpis = [
          { label: 'Produção Médica Total', value: formatCurrency(totalGeral), color: '#10b981' },
          { label: 'Profissionais Produtivos', value: data.length, color: '#0284c7' },
          { label: 'Média por Profissional', value: data.length > 0 ? formatCurrency(totalGeral / data.length) : 'R$ 0,00', color: '#8b5cf6' }
        ];
        break;
      }

      case 'MED_REPASSE_HONORARIOS': {
        cols = [
          { header: 'Médico', key: 'name' },
          { header: 'CRM', key: 'crm' },
          { header: 'PIX', key: 'pix' },
          { header: 'Valor Líquido', key: 'liquidVal' },
          { header: 'Status Repasse', key: 'status' },
          { header: 'Contas a Pagar', key: 'finStatus' }
        ];

        const defaultShiftVal = parseFloat(settings.defaultShiftValue) || 900;
        data = (doctors || []).map(d => {
          const dId = d.id || d.uid;
          const myShifts = monthSchedules.filter(s => s.doctorId === dId);
          const myProcs = monthProcedures.filter(p => p.doctorId === dId);
          const sVal = myShifts.reduce((acc, curr) => acc + (parseFloat(curr.shiftValue) || defaultShiftVal), 0);
          const pVal = myProcs.reduce((acc, curr) => acc + (parseFloat(curr.value) || 350), 0);
          const total = sVal + pVal;

          return {
            name: d.name,
            crm: d.crm || 'Ativo',
            pix: d.pixKey || d.bank || 'PIX Cadastrado',
            liquidVal: formatCurrency(total),
            rawVal: total,
            status: total > 0 ? 'Homologado' : 'Sem Produção',
            finStatus: total > 0 ? 'Pronto para Pagamento' : '-'
          };
        }).filter(d => d.rawVal > 0);

        const totalLiquido = data.reduce((acc, curr) => acc + curr.rawVal, 0);
        kpis = [
          { label: 'Total a Pagar no Mês', value: formatCurrency(totalLiquido), color: '#10b981' },
          { label: 'Médicos a Receber', value: data.length, color: '#0f172a' },
          { label: 'Previsão de Pagamento', value: '10º dia útil', color: '#0284c7' }
        ];
        break;
      }

      case 'MED_CADASTRO_CORPO_CLINICO': {
        cols = [
          { header: '#', key: 'idx' },
          { header: 'Nome', key: 'name' },
          { header: 'CRM', key: 'crm' },
          { header: 'Especialidade', key: 'specialty' },
          { header: 'Contrato', key: 'contract' },
          { header: 'Telefone', key: 'phone' },
          { header: 'E-mail', key: 'email' },
          { header: 'Status', key: 'status' }
        ];

        data = (doctors || []).map((d, idx) => ({
          idx: idx + 1,
          name: d.name,
          crm: d.crm || 'CRM Ativo',
          specialty: d.specialty || 'Nefrologia',
          contract: d.contractType || 'PJ',
          phone: d.phone || '(31) 99876-5432',
          email: d.email || 'medico@nexaclinic.com.br',
          status: 'Ativo'
        }));

        const pj = data.filter(d => d.contract === 'PJ').length;
        const clt = data.filter(d => d.contract === 'CLT').length;
        kpis = [
          { label: 'Total no Corpo Clínico', value: data.length, color: '#0f172a' },
          { label: 'Contrato PJ', value: pj, color: '#0284c7' },
          { label: 'Contrato CLT', value: clt || (data.length - pj), color: '#10b981' }
        ];
        break;
      }

      case 'MED_TABELA_PARAMETROS': {
        cols = [
          { header: 'Item', key: 'item' },
          { header: 'Setor', key: 'sector' },
          { header: 'Valor Referência (R$)', key: 'val' },
          { header: 'Repasse Médico (%)', key: 'repasse' },
          { header: 'Vigência', key: 'vigencia' }
        ];

        data = [
          { item: 'Plantão Nefrologia (Salão 1 - 4h)', sector: 'Hemodiálise Crônica', val: formatCurrency(settings.shiftValueSalao1 || 900), repasse: '100%', vigencia: '2026' },
          { item: 'Plantão Nefrologia (Salão 2 - 4h)', sector: 'Hemodiálise Crônica', val: formatCurrency(settings.shiftValueSalao2 || 900), repasse: '100%', vigencia: '2026' },
          { item: 'Plantão Noturno / Feriados', sector: 'Urgência / Hemodiálise', val: formatCurrency(settings.shiftValueNight || 1200), repasse: '100%', vigencia: '2026' },
          { item: 'Implante de Cateter Duplo Lúmen (CDL)', sector: 'Acessos Vasculares', val: formatCurrency(350), repasse: '80%', vigencia: '2026' },
          { item: 'Implante de Permcath Guiado por USG', sector: 'Cirurgia Vascular', val: formatCurrency(800), repasse: '75%', vigencia: '2026' },
          { item: 'Confecção de Fístula Arteriovenosa (FAV)', sector: 'Cirurgia Vascular', val: formatCurrency(1200), repasse: '70%', vigencia: '2026' },
          { item: 'Consulta Ambulatorial de Nefrologia', sector: 'Consultórios', val: formatCurrency(200), repasse: '70%', vigencia: '2026' }
        ];

        kpis = [
          { label: 'Plantão Padrão', value: formatCurrency(settings.defaultShiftValue || 900), color: '#0284c7' },
          { label: 'Itens Parametrizados', value: data.length, color: '#10b981' },
          { label: 'Ano de Vigência', value: '2026', color: '#0f172a' }
        ];
        break;
      }

      default:
        break;
    }

    return { reportData: data, reportColumns: cols, reportKpis: kpis, currentReportMeta: meta };
  }, [selectedReport, monthSchedules, monthProcedures, monthSwaps, doctors, settings]);

  // Exportação em PDF Formatado
  const exportPDF = () => {
    try {
      const doc = new jsPDF('landscape');
      const title = currentReportMeta.name;

      doc.setFontSize(14);
      doc.setTextColor(15, 23, 42);
      doc.text(tenantSettings.name || 'Nexa Clínica & Nefrologia', 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139);
      doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | Módulo Corpo Clínico & Honorários (.MED)`, 14, 21);
      doc.text(`Relatório: ${title}`, 14, 27);
      doc.text(`Competência: ${monthFilter} | Emissão: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 33);

      const tableColumn = reportColumns.map(c => c.header);
      const tableRows = reportData.map(row => 
        reportColumns.map(col => row[col.key] ?? '-')
      );

      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 38,
        styles: { fontSize: 8, cellPadding: 2.5 },
        headStyles: { fillColor: [2, 132, 199] }, // sky-600
        alternateRowStyles: { fillColor: [240, 249, 255] }
      });

      doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_NexaMED.pdf`);
    } catch (err) {
      console.error('Erro ao exportar PDF do .MED:', err);
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
      console.error('Erro ao exportar Excel do .MED:', err);
      alert('Erro ao gerar planilha Excel.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  const sectionColors = {
    ESCALA: '#4f46e5',
    PLANTOES: '#0284c7',
    TROCAS: '#8b5cf6',
    PROCEDIMENTOS: '#ec4899',
    PRODUCAO: '#10b981',
    PROFISSIONAIS: '#f59e0b'
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
              <h2 style={styles.headerTitle}>Central de Relatórios Médicos</h2>
              <p style={styles.headerSubtitle}>
                Relatórios especializados de Escala de Plantões, Produção Ambulatorial, Bolsa de Trocas e Repasse Financeiro.
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
              onClick={() => setActiveSection('ESCALA')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'ESCALA' ? '#4f46e5' : 'transparent',
                color: activeSection === 'ESCALA' ? '#ffffff' : '#64748b'
              }}
            >
              <Calendar size={14} />
              <span>Escala</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PLANTOES')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'PLANTOES' ? '#0284c7' : 'transparent',
                color: activeSection === 'PLANTOES' ? '#ffffff' : '#64748b'
              }}
            >
              <Clock size={14} />
              <span>Plantões</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('TROCAS')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'TROCAS' ? '#8b5cf6' : 'transparent',
                color: activeSection === 'TROCAS' ? '#ffffff' : '#64748b'
              }}
            >
              <ArrowRightLeft size={14} />
              <span>Trocas</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PROCEDIMENTOS')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'PROCEDIMENTOS' ? '#ec4899' : 'transparent',
                color: activeSection === 'PROCEDIMENTOS' ? '#ffffff' : '#64748b'
              }}
            >
              <Activity size={14} />
              <span>Procedimentos</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PRODUCAO')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'PRODUCAO' ? '#10b981' : 'transparent',
                color: activeSection === 'PRODUCAO' ? '#ffffff' : '#64748b'
              }}
            >
              <DollarSign size={14} />
              <span>Produção</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('PROFISSIONAIS')}
              style={{
                ...styles.tabBtn,
                backgroundColor: activeSection === 'PROFISSIONAIS' ? '#f59e0b' : 'transparent',
                color: activeSection === 'PROFISSIONAIS' ? '#ffffff' : '#64748b'
              }}
            >
              <Users size={14} />
              <span>Profissionais</span>
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
                const sectionColor = sectionColors[r.section] || '#0284c7';
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setSelectedReport(r.id)}
                    style={{
                      ...styles.reportItemBtn,
                      backgroundColor: isSelected ? '#f0f9ff' : 'transparent',
                      color: isSelected ? '#0369a1' : '#334155',
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
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Mês</label>
                  <input
                    type="month"
                    value={monthFilter}
                    onChange={e => setMonthFilter(e.target.value)}
                    style={styles.filterInput}
                  />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Médico</label>
                  <select
                    value={doctorFilter}
                    onChange={e => setDoctorFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="Todos">Todos os Médicos</option>
                    {(doctors || []).map(doc => (
                      <option key={doc.id || doc.uid} value={doc.id || doc.uid}>
                        {doc.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.filterLabel}>Status</label>
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    style={styles.filterSelect}
                  >
                    <option value="Todos">Todos</option>
                    <option value="Confirmado">Confirmado</option>
                    <option value="Vago">Vago</option>
                  </select>
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
                          Nenhum registro encontrado para a competência e filtros selecionados.
                        </td>
                      </tr>
                    ) : (
                      reportData.map((row, rIdx) => (
                        <tr key={rIdx} style={rIdx % 2 === 0 ? styles.trEven : styles.trOdd}>
                          {reportColumns.map(col => (
                            <td key={col.key} style={styles.td}>
                              {col.key === 'status' || col.key === 'checkin' ? (
                                <span style={{
                                  ...styles.statusBadge,
                                  backgroundColor: row[col.key] === 'Confirmado' || row[col.key] === 'Presente' || row[col.key] === 'Homologada' || row[col.key] === 'Ativo' ? '#ecfdf5' : '#fee2e2',
                                  color: row[col.key] === 'Confirmado' || row[col.key] === 'Presente' || row[col.key] === 'Homologada' || row[col.key] === 'Ativo' ? '#047857' : '#dc2626'
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
    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)'
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
    gap: '3px',
    flexWrap: 'wrap'
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
    backgroundColor: '#0284c7',
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
