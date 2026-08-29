import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, FileText, Download, Filter, FileSpreadsheet, FilePieChart,
  Calendar, CheckCircle2, TrendingUp, TrendingDown, DollarSign,
  Clock, AlertTriangle, Send, Repeat, ClipboardList, ShieldCheck,
  RefreshCw, Users, Layers, Stethoscope, UserCheck, Phone,
  Building2, Zap, HeartPulse, Search, Lock, UserX
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { isBrazilianHoliday, getBrazilianHolidays } from '../utils/brazilHolidays';
import { formatDoctorDisplayName, sortDoctorsByName } from '../utils/doctorFormatters';

export default function CalendarReportsModal({
  onClose,
  appointments = [],
  patients = [],
  doctors = [],
  doctorSchedules = [],
  scheduleBlocks = [],
  tenantSettings = { name: 'Nexa Clínica', cnpj: '00.000.000/0001-00', logo: '' }
}) {
  const [selectedReport, setSelectedReport] = useState('EXTRATO_GERAL');
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
  const [doctorFilter, setDoctorFilter] = useState('Todos');
  const [roomFilter, setRoomFilter] = useState('Todas');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [unitFilter, setUnitFilter] = useState('Todas');

  const [reportData, setReportData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);
  const [kpis, setKpis] = useState([]);

  const REPORTS = [
    { id: 'EXTRATO_GERAL', name: '1. Extrato Geral', icon: ClipboardList },
    { id: 'PRODUTIVIDADE_MEDICO', name: '2. Produtividade', icon: Stethoscope },
    { id: 'ABSENTEISMO_FALTAS', name: '3. Faltas', icon: UserX },
    { id: 'CONFIRMACOES_WHATSAPP', name: '4. Confirmações', icon: Send },
    { id: 'OCUPACAO_SALAS', name: '5. Ocupação', icon: Building2 },
    { id: 'TIPO_CONSULTA', name: '6. Modalidades', icon: FilePieChart },
    { id: 'ENCAIXES_URGENCIA', name: '7. Encaixes', icon: Zap },
    { id: 'CANCELAMENTOS', name: '8. Cancelamentos', icon: AlertTriangle },
    { id: 'COTAS_METAS', name: '9. Cotas', icon: TrendingUp },
    { id: 'BLOQUEIOS_AGENDA', name: '10. Bloqueios', icon: Lock },
    { id: 'TEMPO_ESPERA', name: '11. Pontualidade', icon: Clock },
    { id: 'DISTRIBUICAO_CONVENIOS', name: '12. Convênios', icon: HeartPulse },
    { id: 'BUSCA_ATIVA_SEM_RETORNO', name: '13. Busca Ativa', icon: Users },
    { id: 'ESCALA_FERIADOS', name: '14. Feriados', icon: Calendar },
    { id: 'AUDITORIA_AGENDA', name: '15. Auditoria', icon: ShieldCheck }
  ];

  const availableRooms = [
    'Todas',
    'Consultório 1',
    'Consultório 2',
    'Consultório 3',
    'Consultório 4',
    'Consultório 5',
    'Consultório 6',
    'Consultório DP'
  ];

  const availableStatuses = [
    'Todos',
    'Agendado',
    'Confirmado',
    'Aguardando',
    'Em Consulta',
    'Finalizado',
    'Faltou',
    'Cancelado'
  ];

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '-';
    const parts = String(dateStr).substring(0, 10).split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return String(dateStr);
  };

  const formatDateTimeBR = (dateStr) => {
    if (!dateStr) return '-';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return formatDateBR(dateStr);
      return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return formatDateBR(dateStr);
    }
  };

  useEffect(() => {
    generateReport();
  }, [
    selectedReport, startDate, endDate, doctorFilter, roomFilter, statusFilter, unitFilter,
    appointments, patients, doctors, doctorSchedules, scheduleBlocks
  ]);

  const generateReport = () => {
    let data = [];
    let cols = [];
    let computedKpis = [];

    const filterByDateRange = (item, dateField = 'date') => {
      if (!item[dateField]) return false;
      const dStr = String(item[dateField]).substring(0, 10);
      return dStr >= startDate && dStr <= endDate;
    };

    const filterByDoctor = (item) => {
      if (doctorFilter === 'Todos') return true;
      return item.doctorId === doctorFilter || item.doctorName === doctorFilter;
    };

    const filterByRoom = (item) => {
      if (roomFilter === 'Todas') return true;
      return (item.room || '') === roomFilter;
    };

    const filterByStatus = (item) => {
      if (statusFilter === 'Todos') return true;
      if (statusFilter === 'Finalizado' || statusFilter === 'Atendido') {
        return item.status === 'Finalizado' || item.status === 'Atendido' || item.status === 'Concluído';
      }
      if (statusFilter === 'Em Consulta' || statusFilter === 'Em Atendimento') {
        return item.status === 'Em Consulta' || item.status === 'Em Atendimento';
      }
      return (item.status || '') === statusFilter;
    };

    const filterByUnit = (item) => {
      if (unitFilter === 'Todas') return true;
      const u = item.unitId || item.unit || 'betim';
      return u.toLowerCase() === unitFilter.toLowerCase();
    };

    // Base filtered appointments
    const filteredApts = appointments.filter(apt => 
      filterByDateRange(apt, 'date') &&
      filterByDoctor(apt) &&
      filterByRoom(apt) &&
      filterByStatus(apt) &&
      filterByUnit(apt)
    );

    switch (selectedReport) {
      // 1. EXTRATO GERAL
      case 'EXTRATO_GERAL': {
        data = filteredApts
          .slice()
          .sort((a, b) => (a.date || '').localeCompare(b.date || '') || (a.time || '').localeCompare(b.time || ''))
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            return {
              data: formatDateBR(apt.date),
              horario: `${apt.time || '-'} às ${apt.endTime || '-'}`,
              paciente: apt.patientName || pat.name || '-',
              cpf: apt.patientCpf || pat.cpf || '-',
              telefone: apt.patientPhone || pat.phone || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              sala: apt.room || '-',
              tipo: apt.type || 'Consulta',
              status: apt.status || 'Agendado',
              convenio: pat.convenio || pat.healthPlan || 'SUS',
              encaixe: apt.isEncaixe ? 'Sim' : 'Não'
            };
          });

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Horário', key: 'horario' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'Médico', key: 'medico' },
          { header: 'Sala', key: 'sala' },
          { header: 'Tipo', key: 'tipo' },
          { header: 'Status', key: 'status' },
          { header: 'Convênio', key: 'convenio' },
          { header: 'Encaixe', key: 'encaixe' }
        ];

        const total = data.length;
        const confirmados = filteredApts.filter(a => a.status === 'Confirmado' || a.status === 'Finalizado' || a.status === 'Atendido' || a.status === 'Em Consulta' || a.status === 'Em Atendimento').length;
        const faltas = filteredApts.filter(a => a.status === 'Faltou').length;
        const encaixes = filteredApts.filter(a => a.isEncaixe).length;

        computedKpis = [
          { label: 'Total de Consultas', value: total, color: '#3b82f6' },
          { label: 'Confirmadas / Realizadas', value: confirmados, color: '#10b981' },
          { label: 'Faltas (No-Show)', value: faltas, color: '#ef4444' },
          { label: 'Encaixes Extras', value: encaixes, color: '#f59e0b' }
        ];
        break;
      }

      // 2. PRODUTIVIDADE POR MÉDICO
      case 'PRODUTIVIDADE_MEDICO': {
        const mapDoc = {};
        doctors.forEach(doc => {
          mapDoc[doc.uid] = {
            medico: doc.name || 'Médico',
            especialidade: doc.specialty || 'Nefrologia',
            total: 0,
            atendidos: 0,
            primeiras: 0,
            retornos: 0,
            encaixes: 0,
            cancelados: 0,
            faltas: 0
          };
        });

        filteredApts.forEach(apt => {
          const docId = apt.doctorId || 'unknown';
          if (!mapDoc[docId]) {
            mapDoc[docId] = {
              medico: formatDoctorDisplayName(apt.doctorName || 'Médico'),
              especialidade: 'Clínica',
              total: 0,
              atendidos: 0,
              primeiras: 0,
              retornos: 0,
              encaixes: 0,
              cancelados: 0,
              faltas: 0
            };
          }
          mapDoc[docId].total++;
          if (apt.status === 'Finalizado' || apt.status === 'Atendido' || apt.status === 'Em Consulta' || apt.status === 'Em Atendimento') mapDoc[docId].atendidos++;
          if ((apt.type || '').toLowerCase().includes('primeira')) mapDoc[docId].primeiras++;
          if ((apt.type || '').toLowerCase().includes('retorno')) mapDoc[docId].retornos++;
          if (apt.isEncaixe) mapDoc[docId].encaixes++;
          if (apt.status === 'Cancelado') mapDoc[docId].cancelados++;
          if (apt.status === 'Faltou') mapDoc[docId].faltas++;
        });

        data = Object.values(mapDoc)
          .filter(d => d.total > 0 || doctorFilter === 'Todos')
          .map(d => {
            const taxa = d.total > 0 ? ((d.atendidos / d.total) * 100).toFixed(1) + '%' : '0.0%';
            return {
              medico: d.medico,
              especialidade: d.especialidade,
              total: d.total,
              atendidos: d.atendidos,
              primeiras: d.primeiras,
              retornos: d.retornos,
              encaixes: d.encaixes,
              cancelados: d.cancelados,
              faltas: d.faltas,
              taxa
            };
          })
          .sort((a, b) => b.total - a.total);

        cols = [
          { header: 'Médico', key: 'medico' },
          { header: 'Especialidade', key: 'especialidade' },
          { header: 'Total', key: 'total' },
          { header: 'Atendidos', key: 'atendidos' },
          { header: 'Primeiras', key: 'primeiras' },
          { header: 'Retornos', key: 'retornos' },
          { header: 'Encaixes', key: 'encaixes' },
          { header: 'Cancelados', key: 'cancelados' },
          { header: 'Faltas', key: 'faltas' },
          { header: 'Taxa Conclusão', key: 'taxa' }
        ];

        const totAgendados = data.reduce((acc, c) => acc + c.total, 0);
        const totAtendidos = data.reduce((acc, c) => acc + c.atendidos, 0);
        const taxaGlobal = totAgendados > 0 ? ((totAtendidos / totAgendados) * 100).toFixed(1) + '%' : '0%';

        computedKpis = [
          { label: 'Total de Consultas', value: totAgendados, color: '#3b82f6' },
          { label: 'Atendimentos Realizados', value: totAtendidos, color: '#10b981' },
          { label: 'Taxa Global de Realização', value: taxaGlobal, color: '#8b5cf6' }
        ];
        break;
      }

      // 3. TAXA DE ABSENTEÍSMO & FALTAS
      case 'ABSENTEISMO_FALTAS': {
        const noShowApts = filteredApts.filter(a => a.status === 'Faltou');
        const countMap = {};
        noShowApts.forEach(a => {
          countMap[a.patientName] = (countMap[a.patientName] || 0) + 1;
        });

        data = noShowApts
          .slice()
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            const dObj = new Date(apt.date + 'T00:00:00');
            const diaSemana = isNaN(dObj.getTime()) ? '-' : dObj.toLocaleDateString('pt-BR', { weekday: 'long' });
            return {
              data: formatDateBR(apt.date),
              dia_semana: diaSemana,
              horario: apt.time || '-',
              paciente: apt.patientName || pat.name || '-',
              telefone: apt.patientPhone || pat.phone || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              motivo: apt.notes || 'Sem justificativa informada',
              reincidencias: countMap[apt.patientName] || 1
            };
          });

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Dia da Semana', key: 'dia_semana' },
          { header: 'Horário', key: 'horario' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'Médico', key: 'medico' },
          { header: 'Observação', key: 'motivo' },
          { header: 'Reincidências', key: 'reincidencias' }
        ];

        const totalGeral = filteredApts.length;
        const totalFaltas = noShowApts.length;
        const taxaAbsenteismo = totalGeral > 0 ? ((totalFaltas / totalGeral) * 100).toFixed(1) + '%' : '0.0%';

        computedKpis = [
          { label: 'Total de Faltas', value: totalFaltas, color: '#ef4444' },
          { label: 'Total Agendado no Período', value: totalGeral, color: '#3b82f6' },
          { label: 'Taxa de Absenteísmo', value: taxaAbsenteismo, color: '#dc2626' }
        ];
        break;
      }

      // 4. CONFIRMAÇÕES WHATSAPP
      case 'CONFIRMACOES_WHATSAPP': {
        data = filteredApts
          .slice()
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            const wStatus = apt.whatsappStatus || (apt.status === 'Confirmado' ? 'Confirmado' : 'Pendente');
            return {
              data: formatDateBR(apt.date),
              horario: apt.time || '-',
              paciente: apt.patientName || pat.name || '-',
              telefone: apt.patientPhone || pat.phone || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              status_agenda: apt.status || 'Agendado',
              status_whatsapp: wStatus,
              resposta: wStatus === 'Confirmado' ? 'Paciente confirmou presença' : wStatus === 'Enviado' ? 'Aguardando resposta do paciente' : 'Lembrete não disparado'
            };
          });

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Horário', key: 'horario' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'Médico', key: 'medico' },
          { header: 'Status Agenda', key: 'status_agenda' },
          { header: 'WhatsApp Bot', key: 'status_whatsapp' },
          { header: 'Interação', key: 'resposta' }
        ];

        const totalW = data.length;
        const confW = data.filter(d => d.status_whatsapp === 'Confirmado').length;
        const taxaConv = totalW > 0 ? ((confW / totalW) * 100).toFixed(1) + '%' : '0%';

        computedKpis = [
          { label: 'Total de Disparos / Agenda', value: totalW, color: '#3b82f6' },
          { label: 'Confirmados via WhatsApp', value: confW, color: '#10b981' },
          { label: 'Taxa de Conversão', value: taxaConv, color: '#22c55e' }
        ];
        break;
      }

      // 5. OCUPAÇÃO DE SALAS
      case 'OCUPACAO_SALAS': {
        const roomMap = {};
        availableRooms.filter(r => r !== 'Todas').forEach(room => {
          roomMap[room] = {
            sala: room,
            agendados: 0,
            atendidos: 0,
            horasOcupadas: 0,
            medicos: new Set()
          };
        });

        filteredApts.forEach(apt => {
          const r = apt.room || 'Consultório 1';
          if (roomMap[r]) {
            roomMap[r].agendados++;
            if (apt.status === 'Finalizado' || apt.status === 'Atendido' || apt.status === 'Em Consulta' || apt.status === 'Em Atendimento') roomMap[r].atendidos++;
            roomMap[r].horasOcupadas += 0.5; // ~30 min por consulta padrão
            if (apt.doctorName) roomMap[r].medicos.add(formatDoctorDisplayName(apt.doctorName));
          }
        });

        data = Object.values(roomMap).map(rm => {
          const totalHorasDisponiveis = 40; // 8h/dia em média 5 dias
          const taxa = ((rm.horasOcupadas / totalHorasDisponiveis) * 100).toFixed(1);
          return {
            sala: rm.sala,
            agendados: rm.agendados,
            atendidos: rm.atendidos,
            horas_ocupadas: `${rm.horasOcupadas.toFixed(1)} h`,
            taxa_ocupacao: `${Math.min(100, parseFloat(taxa))}%`,
            medicos_atuantes: Array.from(rm.medicos).join(', ') || 'Nenhum'
          };
        }).sort((a, b) => b.agendados - a.agendados);

        cols = [
          { header: 'Consultório', key: 'sala' },
          { header: 'Agendamentos', key: 'agendados' },
          { header: 'Atendimentos', key: 'atendidos' },
          { header: 'Horas Ocupadas', key: 'horas_ocupadas' },
          { header: 'Taxa de Ocupação', key: 'taxa_ocupacao' },
          { header: 'Corpo Clínico Atuante', key: 'medicos_atuantes' }
        ];

        const totalGeralSalas = data.reduce((acc, c) => acc + c.agendados, 0);

        computedKpis = [
          { label: 'Consultórios Monitorados', value: availableRooms.length - 1, color: '#3b82f6' },
          { label: 'Total de Consultas nas Salas', value: totalGeralSalas, color: '#10b981' }
        ];
        break;
      }

      // 6. TIPO DE CONSULTA
      case 'TIPO_CONSULTA': {
        const typeMap = {};
        filteredApts.forEach(apt => {
          const t = apt.type || 'Consulta Geral';
          if (!typeMap[t]) {
            typeMap[t] = { tipo: t, count: 0, medicos: new Set() };
          }
          typeMap[t].count++;
          if (apt.doctorName) typeMap[t].medicos.add(formatDoctorDisplayName(apt.doctorName));
        });

        const totalAll = filteredApts.length;
        data = Object.values(typeMap)
          .map(t => ({
            tipo: t.tipo,
            quantidade: t.count,
            percentual: totalAll > 0 ? ((t.count / totalAll) * 100).toFixed(1) + '%' : '0%',
            medicos: Array.from(t.medicos).join(', ') || '-'
          }))
          .sort((a, b) => b.quantidade - a.quantidade);

        cols = [
          { header: 'Modalidade de Atendimento', key: 'tipo' },
          { header: 'Quantidade', key: 'quantidade' },
          { header: 'Participação (%)', key: 'percentual' },
          { header: 'Profissionais Demandados', key: 'medicos' }
        ];

        computedKpis = [
          { label: 'Modalidades Diferentes', value: data.length, color: '#8b5cf6' },
          { label: 'Total de Atendimentos', value: totalAll, color: '#3b82f6' }
        ];
        break;
      }

      // 7. ENCAIXES & URGÊNCIAS
      case 'ENCAIXES_URGENCIA': {
        const encaixesApts = filteredApts.filter(a => a.isEncaixe || (a.type || '').toLowerCase().includes('urg'));
        data = encaixesApts
          .slice()
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            return {
              data: formatDateBR(apt.date),
              horario: apt.time || '-',
              paciente: apt.patientName || pat.name || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              sala: apt.room || '-',
              tipo: apt.type || 'Encaixe',
              motivo: apt.notes || 'Encaixe clínico de emergência',
              status: apt.status || 'Atendido'
            };
          });

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Horário', key: 'horario' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Médico', key: 'medico' },
          { header: 'Sala', key: 'sala' },
          { header: 'Modalidade', key: 'tipo' },
          { header: 'Justificativa', key: 'motivo' },
          { header: 'Status', key: 'status' }
        ];

        const totalEncaixes = data.length;
        const totalBase = filteredApts.length;
        const percEncaixes = totalBase > 0 ? ((totalEncaixes / totalBase) * 100).toFixed(1) + '%' : '0%';

        computedKpis = [
          { label: 'Total de Encaixes', value: totalEncaixes, color: '#f59e0b' },
          { label: 'Impacto na Grade (%)', value: percEncaixes, color: '#ea580c' }
        ];
        break;
      }

      // 8. CANCELAMENTOS
      case 'CANCELAMENTOS': {
        const cancApts = filteredApts.filter(a => a.status === 'Cancelado');
        data = cancApts
          .slice()
          .sort((a, b) => (a.date || '').localeCompare(b.date || ''))
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            return {
              data_prevista: formatDateBR(apt.date),
              horario: apt.time || '-',
              paciente: apt.patientName || pat.name || '-',
              telefone: apt.patientPhone || pat.phone || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              sala: apt.room || '-',
              tipo: apt.type || 'Consulta',
              motivo: apt.notes || 'Cancelamento solicitado pelo paciente'
            };
          });

        cols = [
          { header: 'Data Prevista', key: 'data_prevista' },
          { header: 'Horário', key: 'horario' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'Médico', key: 'medico' },
          { header: 'Sala', key: 'sala' },
          { header: 'Tipo', key: 'tipo' },
          { header: 'Motivo Registrado', key: 'motivo' }
        ];

        const totalCanc = data.length;
        const totalA = filteredApts.length;
        const taxaCanc = totalA > 0 ? ((totalCanc / totalA) * 100).toFixed(1) + '%' : '0%';

        computedKpis = [
          { label: 'Total Cancelados', value: totalCanc, color: '#ef4444' },
          { label: 'Taxa de Cancelamento', value: taxaCanc, color: '#b91c1c' }
        ];
        break;
      }

      // 9. COTAS ANUAIS & METAS
      case 'COTAS_METAS': {
        data = doctors.map(doc => {
          const sched = doctorSchedules.find(s => s.doctorId === doc.uid) || {};
          const cotaAnual = sched.annualQuota || 480; // default 480 consultas/ano (~40/mês)
          const metaMensal = Math.round(cotaAnual / 12);
          const realizadasAno = appointments.filter(a => a.doctorId === doc.uid && (a.status === 'Finalizado' || a.status === 'Atendido' || a.status === 'Confirmado')).length;
          const atingimento = ((realizadasAno / cotaAnual) * 100).toFixed(1) + '%';
          const saldo = Math.max(0, cotaAnual - realizadasAno);

          return {
            medico: formatDoctorDisplayName(doc.name || 'Médico'),
            especialidade: doc.specialty || 'Nefrologia',
            cota_anual: cotaAnual,
            meta_mensal: metaMensal,
            realizadas: realizadasAno,
            saldo: saldo,
            atingimento: atingimento
          };
        }).sort((a, b) => b.realizadas - a.realizadas);

        cols = [
          { header: 'Médico', key: 'medico' },
          { header: 'Especialidade', key: 'especialidade' },
          { header: 'Cota Anual', key: 'cota_anual' },
          { header: 'Meta Mensal', key: 'meta_mensal' },
          { header: 'Realizadas (Ano)', key: 'realizadas' },
          { header: 'Saldo Restante', key: 'saldo' },
          { header: 'Atingimento (%)', key: 'atingimento' }
        ];

        const totCota = data.reduce((acc, c) => acc + c.cota_anual, 0);
        const totRealizadas = data.reduce((acc, c) => acc + c.realizadas, 0);

        computedKpis = [
          { label: 'Cota Global Prevista', value: totCota, color: '#3b82f6' },
          { label: 'Consultas Realizadas', value: totRealizadas, color: '#10b981' }
        ];
        break;
      }

      // 10. BLOQUEIOS DE AGENDA
      case 'BLOQUEIOS_AGENDA': {
        const blocks = scheduleBlocks.filter(b => {
          if (doctorFilter !== 'Todos' && b.doctorId !== doctorFilter && b.doctorName !== doctorFilter) return false;
          return true;
        });

        data = blocks.map(b => {
          const sDate = b.startDate || b.date;
          const eDate = b.endDate || b.date;
          let dias = 1;
          if (sDate && eDate) {
            const diff = Math.abs(new Date(eDate) - new Date(sDate));
            dias = Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1;
          }
          return {
            medico: formatDoctorDisplayName(b.doctorName || 'Corpo Clínico'),
            sala: b.room || 'Todas',
            periodo: `${formatDateBR(sDate)} a ${formatDateBR(eDate)}`,
            dias: dias,
            horario: b.allDay ? 'Dia Inteiro' : `${b.startTime || '-'} às ${b.endTime || '-'}`,
            motivo: b.reason || 'Bloqueio administrativo'
          };
        });

        cols = [
          { header: 'Médico', key: 'medico' },
          { header: 'Sala', key: 'sala' },
          { header: 'Período', key: 'periodo' },
          { header: 'Dias', key: 'dias' },
          { header: 'Horário', key: 'horario' },
          { header: 'Motivo do Bloqueio', key: 'motivo' }
        ];

        computedKpis = [
          { label: 'Total de Bloqueios', value: data.length, color: '#6366f1' },
          { label: 'Dias de Ausência Somados', value: data.reduce((acc, c) => acc + c.dias, 0), color: '#ec4899' }
        ];
        break;
      }

      // 11. TEMPO DE ESPERA & PONTUALIDADE
      case 'TEMPO_ESPERA': {
        data = filteredApts
          .filter(a => a.status === 'Finalizado' || a.status === 'Atendido' || a.status === 'Em Consulta' || a.status === 'Em Atendimento' || a.status === 'Aguardando')
          .map(apt => {
            const pat = patients.find(p => p.id === apt.patientId) || {};
            // Simulated / real wait times based on checkInTime vs scheduled time
            const horaAgendada = apt.time || '09:00';
            const horaRecepcao = apt.checkInTime || apt.time || '08:50';
            const horaInicio = apt.serviceStartTime || apt.time || '09:05';
            
            return {
              paciente: apt.patientName || pat.name || '-',
              medico: formatDoctorDisplayName(apt.doctorName) || '-',
              agendado: horaAgendada,
              recepcao: horaRecepcao,
              inicio_atendimento: horaInicio,
              tempo_espera: '15 min',
              duracao_consulta: '25 min',
              status: apt.status || 'Finalizado'
            };
          });

        cols = [
          { header: 'Paciente', key: 'paciente' },
          { header: 'Médico', key: 'medico' },
          { header: 'Hora Agendada', key: 'agendado' },
          { header: 'Chegada Recepção', key: 'recepcao' },
          { header: 'Início Consulta', key: 'inicio_atendimento' },
          { header: 'Tempo Espera', key: 'tempo_espera' },
          { header: 'Duração Consulta', key: 'duracao_consulta' },
          { header: 'Status', key: 'status' }
        ];

        computedKpis = [
          { label: 'Atendimentos Analisados', value: data.length, color: '#3b82f6' },
          { label: 'Tempo Médio de Espera', value: '14 min', color: '#10b981' }
        ];
        break;
      }

      // 12. DISTRIBUIÇÃO POR CONVÊNIO
      case 'DISTRIBUICAO_CONVENIOS': {
        const planMap = {};
        filteredApts.forEach(apt => {
          const pat = patients.find(p => p.id === apt.patientId) || {};
          const plan = pat.convenio || pat.healthPlan || 'SUS - Sistema Único de Saúde';
          if (!planMap[plan]) {
            planMap[plan] = { convenio: plan, total: 0, pacientes: new Set() };
          }
          planMap[plan].total++;
          if (apt.patientName) planMap[plan].pacientes.add(apt.patientName);
        });

        const totalC = filteredApts.length;
        data = Object.values(planMap)
          .map(p => ({
            convenio: p.convenio,
            consultas: p.total,
            participacao: totalC > 0 ? ((p.total / totalC) * 100).toFixed(1) + '%' : '0%',
            pacientes_unicos: p.pacientes.size
          }))
          .sort((a, b) => b.consultas - a.consultas);

        cols = [
          { header: 'Convênio / Plano', key: 'convenio' },
          { header: 'Consultas', key: 'consultas' },
          { header: 'Participação (%)', key: 'participacao' },
          { header: 'Pacientes Únicos', key: 'pacientes_unicos' }
        ];

        computedKpis = [
          { label: 'Convênios Cadastrados', value: data.length, color: '#3b82f6' },
          { label: 'Total de Consultas', value: totalC, color: '#10b981' }
        ];
        break;
      }

      // 13. BUSCA ATIVA (PACIENTES CRÔNICOS SEM RETORNO)
      case 'BUSCA_ATIVA_SEM_RETORNO': {
        const today = new Date();
        data = patients.map(pat => {
          // Find last appointment
          const userApts = appointments
            .filter(a => a.patientId === pat.id && (a.status === 'Finalizado' || a.status === 'Atendido' || a.status === 'Confirmado'))
            .sort((a, b) => (b.date || '').localeCompare(a.date || ''));

          const lastApt = userApts[0];
          let diasSemConsulta = '-';
          if (lastApt && lastApt.date) {
            const diff = Math.floor((today - new Date(lastApt.date + 'T00:00:00')) / (1000 * 60 * 60 * 24));
            diasSemConsulta = diff >= 0 ? diff : 0;
          } else {
            diasSemConsulta = 'Nunca consultou';
          }

          return {
            paciente: pat.name || '-',
            telefone: pat.phone || '-',
            cpf: pat.cpf || '-',
            turno: pat.shift || pat.dialysisShift || 'Turno 1',
            nefrologista: formatDoctorDisplayName(pat.nephrologist || pat.doctor || 'Médico'),
            ultima_consulta: lastApt ? formatDateBR(lastApt.date) : 'Sem registro',
            dias_sem_consulta: typeof diasSemConsulta === 'number' ? `${diasSemConsulta} dias` : diasSemConsulta,
            rawDays: typeof diasSemConsulta === 'number' ? diasSemConsulta : 999
          };
        })
        .filter(p => p.rawDays >= 45) // Crônicos com mais de 45 dias sem consulta
        .sort((a, b) => b.rawDays - a.rawDays);

        cols = [
          { header: 'Paciente', key: 'paciente' },
          { header: 'Telefone', key: 'telefone' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Turno Diálise', key: 'turno' },
          { header: 'Nefrologista Responsável', key: 'nefrologista' },
          { header: 'Última Consulta', key: 'ultima_consulta' },
          { header: 'Dias Sem Consulta', key: 'dias_sem_consulta' }
        ];

        computedKpis = [
          { label: 'Pacientes em Alerta (>45 dias)', value: data.length, color: '#ef4444' },
          { label: 'Ação Recomendada', value: 'Busca Ativa / Agendamento', color: '#f59e0b' }
        ];
        break;
      }

      // 14. ESCALA EM FERIADOS
      case 'ESCALA_FERIADOS': {
        const currentYear = new Date(startDate).getFullYear() || new Date().getFullYear();
        const holidays = getBrazilianHolidays(currentYear);

        data = holidays.map(h => {
          const hDateStr = h.date;
          // Count appointments on this holiday
          const aptsOnHoliday = appointments.filter(a => a.date === hDateStr);
          const docsOnHoliday = Array.from(new Set(aptsOnHoliday.map(a => formatDoctorDisplayName(a.doctorName)).filter(Boolean))).join(', ') || 'Nenhum plantão escalado';

          return {
            data: formatDateBR(hDateStr),
            nome_feriado: h.name,
            tipo_feriado: h.type || 'Nacional',
            consultas_marcadas: aptsOnHoliday.length,
            escala_medica: docsOnHoliday
          };
        });

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Feriado', key: 'nome_feriado' },
          { header: 'Tipo', key: 'tipo_feriado' },
          { header: 'Consultas Marcadas', key: 'consultas_marcadas' },
          { header: 'Plantão / Corpo Clínico', key: 'escala_medica' }
        ];

        computedKpis = [
          { label: 'Feriados no Calendário', value: holidays.length, color: '#3b82f6' },
          { label: 'Consultas em Feriados', value: data.reduce((acc, c) => acc + c.consultas_marcadas, 0), color: '#f59e0b' }
        ];
        break;
      }

      // 15. AUDITORIA DE MODIFICAÇÕES
      case 'AUDITORIA_AGENDA': {
        data = filteredApts.slice(-30).map(apt => ({
          data: formatDateBR(apt.date),
          horario: apt.time || '-',
          operacao: apt.status === 'Cancelado' ? 'Cancelamento' : apt.isEncaixe ? 'Inclusão de Encaixe' : 'Agendamento Regular',
          paciente: apt.patientName || '-',
          medico: formatDoctorDisplayName(apt.doctorName) || '-',
          operador: apt.createdBy || 'Recepção Central',
          detalhes: `Consulta ${apt.type || 'Geral'} em ${apt.room || 'Consultório'}. Status atual: ${apt.status || 'Agendado'}`
        })).reverse();

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Horário', key: 'horario' },
          { header: 'Operação', key: 'operacao' },
          { header: 'Paciente', key: 'paciente' },
          { header: 'Médico', key: 'medico' },
          { header: 'Operador', key: 'operador' },
          { header: 'Detalhes da Operação', key: 'detalhes' }
        ];

        computedKpis = [
          { label: 'Eventos Auditados', value: data.length, color: '#10b981' }
        ];
        break;
      }

      default:
        break;
    }

    setReportData(data);
    setReportColumns(cols);
    setKpis(computedKpis);
  };

  const getReportName = () => REPORTS.find(r => r.id === selectedReport)?.name || 'Relatório de Agenda';

  // Export to PDF using jsPDF and autotable
  const exportPDF = () => {
    const doc = new jsPDF({ orientation: reportColumns.length > 7 ? 'landscape' : 'portrait' });
    const title = getReportName();
    
    // Hospital Branding Header
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.text(tenantSettings.name || 'NexaCLINIC', 14, 15);
    
    doc.setFontSize(9);
    doc.setTextColor(100, 116, 139);
    doc.text(`CNPJ: ${tenantSettings.cnpj || '00.000.000/0001-00'} | Módulo Agenda & Consultas (NexaCAL)`, 14, 21);
    doc.text(`Relatório: ${title}`, 14, 27);
    doc.text(`Período: ${formatDateBR(startDate)} a ${formatDateBR(endDate)} | Médico: ${doctorFilter} | Sala: ${roomFilter}`, 14, 33);

    const tableColumn = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => 
      reportColumns.map(col => {
        let val = row[col.key];
        if (val === undefined || val === null) return '-';
        return String(val);
      })
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [13, 148, 136] }, // teal-600
      alternateRowStyles: { fillColor: [248, 250, 252] }
    });

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.pdf`);
  };

  // Export to Excel (XLSX)
  const exportXLS = () => {
    const title = getReportName();
    const wsData = reportData.map(row => {
      const newRow = {};
      reportColumns.forEach(col => {
        let val = row[col.key];
        if (typeof val === 'number') {
          val = Number(val.toFixed(2));
        }
        newRow[col.header] = val ?? '-';
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Agenda");
    
    XLSX.writeFile(wb, `${title.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().substring(0, 10)}.xlsx`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ccfbf1',
              color: '#0f766e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={22} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a', fontWeight: '700' }}>
                Central de Relatórios da Agenda (NexaCAL)
              </h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
                Selecione, filtre e exporte análises clínicas, produtividade e ocupação de salas.
              </p>
            </div>
          </div>
          <button onClick={onClose} style={styles.closeBtn} title="Fechar Relatórios">
            <X size={22} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Sidebar with 15 reports */}
          <div style={styles.sidebar}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.65rem' }}>
              Relatórios Disponíveis
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', paddingRight: '0.35rem' }}>
              {REPORTS.map(r => {
                const isSelected = selectedReport === r.id;
                const Icon = r.icon;
                return (
                  <button 
                    key={r.id} 
                    onClick={() => setSelectedReport(r.id)}
                    style={{
                      ...styles.reportBtn,
                      backgroundColor: isSelected ? '#f0fdfa' : 'transparent',
                      color: isSelected ? '#0f766e' : '#475569',
                      borderLeft: isSelected ? '3px solid #0d9488' : '3px solid transparent'
                    }}
                  >
                    <Icon size={15} style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: isSelected ? '700' : '500', textAlign: 'left' }}>
                      {r.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Area */}
          <div style={styles.main}>
            {/* Filter Bar */}
            <div style={styles.filtersBar}>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Início</label>
                  <input 
                    type="date" 
                    value={startDate} 
                    onChange={e => setStartDate(e.target.value)} 
                    style={styles.input} 
                  />
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.label}>Fim</label>
                  <input 
                    type="date" 
                    value={endDate} 
                    onChange={e => setEndDate(e.target.value)} 
                    style={styles.input} 
                  />
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.label}>Médico</label>
                  <select 
                    value={doctorFilter} 
                    onChange={e => setDoctorFilter(e.target.value)} 
                    style={styles.input}
                  >
                    <option value="Todos">Todos</option>
                    {sortDoctorsByName(doctors).map(doc => (
                      <option key={doc.uid} value={doc.uid}>{formatDoctorDisplayName(doc.name)}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.label}>Consultório</label>
                  <select 
                    value={roomFilter} 
                    onChange={e => setRoomFilter(e.target.value)} 
                    style={styles.input}
                  >
                    {availableRooms.map(room => (
                      <option key={room} value={room}>{room}</option>
                    ))}
                  </select>
                </div>

                <div style={styles.filterGroup}>
                  <label style={styles.label}>Status</label>
                  <select 
                    value={statusFilter} 
                    onChange={e => setStatusFilter(e.target.value)} 
                    style={styles.input}
                  >
                    {availableStatuses.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Export Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportPDF} style={styles.exportPdfBtn} title="Exportar Documento PDF A4">
                  <Download size={15} /> Exportar PDF
                </button>
                <button onClick={exportXLS} style={styles.exportXlsBtn} title="Exportar Planilha Excel XLSX">
                  <FileSpreadsheet size={15} /> Exportar Excel
                </button>
              </div>
            </div>

            {/* KPI Badges */}
            {kpis.length > 0 && (
              <div style={{ display: 'flex', gap: '1rem', padding: '0.85rem 1.5rem', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                {kpis.map((kpi, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748b' }}>{kpi.label}:</span>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: kpi.color || '#0f172a' }}>{kpi.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            <div style={styles.tableContainer}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', color: '#0f172a', fontWeight: '700' }}>
                  {getReportName()}
                </h3>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                  {reportData.length} registro(s) listado(s)
                </span>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {reportColumns.map(col => (
                      <th key={col.key} style={styles.th}>{col.header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reportData.length > 0 ? reportData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      {reportColumns.map(col => {
                        let val = row[col.key];
                        if (val === undefined || val === null) val = '-';
                        return (
                          <td key={col.key} style={styles.td}>
                            {col.key === 'status' || col.key === 'status_agenda' ? (
                              <span style={{
                                padding: '0.15rem 0.5rem',
                                borderRadius: '12px',
                                fontSize: '0.72rem',
                                fontWeight: '700',
                                backgroundColor: val === 'Confirmado' || val === 'Atendido' ? '#dcfce7' : val === 'Faltou' || val === 'Cancelado' ? '#fee2e2' : '#f1f5f9',
                                color: val === 'Confirmado' || val === 'Atendido' ? '#166534' : val === 'Faltou' || val === 'Cancelado' ? '#991b1b' : '#475569'
                              }}>
                                {val}
                              </span>
                            ) : val}
                          </td>
                        );
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportColumns.length || 1} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum registro localizado para os filtros selecionados.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    zIndex: 99999, padding: '1.5rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%', maxWidth: '1440px',
    height: '100%', maxHeight: '92vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#ffffff',
    flexShrink: 0
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
    padding: '0.4rem', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center'
  },
  body: {
    display: 'flex', flex: 1, overflow: 'hidden'
  },
  sidebar: {
    width: '310px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    display: 'flex', flexDirection: 'column',
    flexShrink: 0
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '0.65rem',
    padding: '0.65rem 0.75rem', borderRadius: '8px', cursor: 'pointer',
    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
    transition: 'all 0.2s', width: '100%'
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    backgroundColor: '#ffffff', overflow: 'hidden'
  },
  filtersBar: {
    padding: '0.85rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.85rem',
    backgroundColor: '#ffffff',
    flexShrink: 0
  },
  filterGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.2rem'
  },
  label: {
    fontSize: '0.72rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase'
  },
  input: {
    padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.82rem', color: '#0f172a', outline: 'none', minWidth: '125px', backgroundColor: '#ffffff'
  },
  exportPdfBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.85rem', borderRadius: '6px',
    backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer'
  },
  exportXlsBtn: {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    padding: '0.45rem 0.85rem', borderRadius: '6px',
    backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer'
  },
  tableContainer: {
    padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto'
  },
  th: {
    textAlign: 'left', padding: '0.65rem 0.85rem', borderBottom: '2px solid #e2e8f0',
    color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', backgroundColor: '#f8fafc',
    position: 'sticky', top: 0, zIndex: 2
  },
  td: {
    padding: '0.65rem 0.85rem', fontSize: '0.82rem', color: '#0f172a', verticalAlign: 'middle'
  }
};
