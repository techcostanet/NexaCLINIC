import React, { useState, useEffect } from 'react';
import { 
  X, FileText, Download, Filter, FileSpreadsheet, FilePieChart,
  Calendar, CheckCircle2, TrendingUp, TrendingDown, DollarSign,
  Users, Bus, Trophy, ShieldAlert, Award, Clock, HeartPulse, 
  Baby, CreditCard, FileCheck, Layers, ShieldCheck, AlertTriangle
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { STANDARD_SECTORS, normalizeSingleWord, normalizeSectorName } from '../data/hrConstants';

export default function HRReportsModal({ 
  onClose, 
  employees = [], 
  sectors = [], 
  transportVouchers = [], 
  auditLogs = [],
  awardValue = 300,
  selectedVtPeriod = '2026-08',
  tenantSettings = { name: 'Nexa Clínica - Recursos Humanos', cnpj: '00.000.000/0001-00', logo: '' }
}) {
  const [selectedReport, setSelectedReport] = useState('CADASTRO_GERAL');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setFullYear(2026);
    d.setMonth(0);
    d.setDate(1);
    return d.toISOString().substring(0, 10);
  });
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(2026);
    d.setMonth(11);
    d.setDate(31);
    return d.toISOString().substring(0, 10);
  });
  const [sectorFilter, setSectorFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Ativo'); // 'Ativo' | 'Inativo' | 'Todos'
  const [monthFilter, setMonthFilter] = useState(() => {
    const m = new Date().getMonth() + 1;
    return m < 10 ? `0${m}` : `${m}`;
  });
  const [vtPeriodFilter, setVtPeriodFilter] = useState(selectedVtPeriod || '2026-08');

  const [reportData, setReportData] = useState([]);
  const [reportColumns, setReportColumns] = useState([]);
  const [summaryMetrics, setSummaryMetrics] = useState([]);

  const REPORTS = [
    { id: 'CADASTRO_GERAL', name: '1. Cadastro Geral & Ficha Funcional', icon: Users },
    { id: 'VALE_TRANSPORTE', name: '2. Vale-Transporte Consolidado', icon: Bus },
    { id: 'PRESENCA_PREMIADA', name: '3. Presença Premiada & Assiduidade', icon: Trophy },
    { id: 'ANIVERSARIANTES', name: '4. Aniversariantes do Mês & Período', icon: Calendar },
    { id: 'ADVERTENCIAS_DISCIPLINARES', name: '5. Advertências Disciplinares & Ocorrências', icon: ShieldAlert },
    { id: 'ABSENTEISMO_FALTAS', name: '6. Absenteísmo & Histórico de Faltas', icon: Clock },
    { id: 'TURNOVER_MOVIMENTACAO', name: '7. Turnover & Movimentação de Pessoal', icon: TrendingDown },
    { id: 'CONTRATOS_EXPERIENCIA', name: '8. Contratos de Experiência (45 / 90 Dias)', icon: FileCheck },
    { id: 'CONTROLE_VACINAL', name: '9. Controle Vacinal & Imunização', icon: HeartPulse },
    { id: 'QUADRO_DEPENDENTES', name: '10. Dependentes & Benefícios Familiares', icon: Baby },
    { id: 'FOLHA_SINTETICA', name: '11. Folha de Pagamento Sintética', icon: FilePieChart },
    { id: 'DADOS_BANCARIOS', name: '12. Dados Bancários & Contas para PIX', icon: CreditCard },
    { id: 'DOCUMENTOS_VENCIMENTOS', name: '13. Documentos Ocupacionais & Vencimentos', icon: FileText },
    { id: 'DISTRIBUICAO_EFETIVO', name: '14. Distribuição do Efetivo por Setor', icon: Layers },
    { id: 'AUDITORIA_GOVERNANCA', name: '15. Auditoria de Governança & LGPD', icon: ShieldCheck }
  ];

  const formatDateBR = (dateStr) => {
    if (!dateStr) return '-';
    const clean = String(dateStr).substring(0, 10);
    const parts = clean.split('-');
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

  const getSectorName = (sectorId) => {
    if (!sectorId) return 'Geral';
    const activeList = (sectors && sectors.length > 0 ? sectors : STANDARD_SECTORS);
    const sec = activeList.find(s => s.id === sectorId || s.name.toLowerCase() === sectorId.toLowerCase());
    return sec ? normalizeSectorName(sec.name) : normalizeSectorName(sectorId);
  };

  useEffect(() => {
    generateReport();
  }, [
    selectedReport, startDate, endDate, sectorFilter, statusFilter, 
    monthFilter, vtPeriodFilter, employees, sectors, transportVouchers, 
    auditLogs, awardValue
  ]);

  const generateReport = () => {
    let data = [];
    let cols = [];
    let metrics = [];

    const filterByDateRange = (itemDate) => {
      if (!itemDate) return false;
      const clean = String(itemDate).substring(0, 10);
      return clean >= startDate && clean <= endDate;
    };

    const filterSectorMatch = (secIdOrName) => {
      if (sectorFilter === 'Todos') return true;
      const secName = getSectorName(secIdOrName);
      return secName === sectorFilter || secIdOrName === sectorFilter;
    };

    const filterStatusMatch = (empStatus) => {
      if (statusFilter === 'Todos') return true;
      if (statusFilter === 'Ativo') return empStatus !== 'Inativo' && empStatus !== 'Demitido';
      if (statusFilter === 'Inativo') return empStatus === 'Inativo' || empStatus === 'Demitido';
      return true;
    };

    switch (selectedReport) {
      // 1. CADASTRO GERAL & FICHA FUNCIONAL
      case 'CADASTRO_GERAL': {
        data = employees
          .filter(e => filterStatusMatch(e.status) && filterSectorMatch(e.sectorId))
          .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
          .map(e => ({
            nome: e.name || '-',
            cpf: e.cpf || '-',
            cargo: normalizeSingleWord(e.role) || '-',
            setor: getSectorName(e.sectorId),
            admissao: formatDateBR(e.admissionDate),
            contrato: e.contractType || 'CLT',
            salario: parseFloat(e.salary) || 0,
            status: e.status || 'Ativo',
            telefone: e.phone || '-'
          }));

        cols = [
          { header: 'Colaborador', key: 'nome' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Admissão', key: 'admissao' },
          { header: 'Contrato', key: 'contrato' },
          { header: 'Salário', key: 'salario', format: 'currency' },
          { header: 'Status', key: 'status' },
          { header: 'Telefone', key: 'telefone' }
        ];

        const totalSal = data.reduce((sum, r) => sum + r.salario, 0);
        metrics = [
          { label: 'Total de Registros', value: data.length, color: '#3b82f6' },
          { label: 'Colaboradores Ativos', value: data.filter(d => d.status !== 'Inativo').length, color: '#10b981' },
          { label: 'Folha Base Bruta', value: `R$ ${totalSal.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ec4899' }
        ];
        break;
      }

      // 2. VALE-TRANSPORTE CONSOLIDADO
      case 'VALE_TRANSPORTE': {
        const periodVouchers = (transportVouchers || []).filter(v => {
          const matchPeriod = !vtPeriodFilter || v.month === vtPeriodFilter;
          const emp = employees.find(e => e.id === v.employeeId);
          const matchSector = !emp || filterSectorMatch(emp.sectorId);
          const matchStatus = !emp || filterStatusMatch(emp.status);
          return matchPeriod && matchSector && matchStatus;
        });

        data = periodVouchers.map(v => {
          const emp = employees.find(e => e.id === v.employeeId);
          const daily = (parseFloat(v.tariffIda) || 0) + (parseFloat(v.tariffVolta) || 0) || (parseFloat(v.dailyTariff) || 0);
          const expected = parseFloat(v.expectedAmount) || 0;
          const currentBal = parseFloat(v.currentBalance) || 0;
          const recharge = Math.max(0, expected - currentBal);

          let situacao = 'Recarga Normal';
          if (v.highlightType === 'orange' || (v.balancePrevious === 0 && currentBal === 0 && expected > 0)) {
            situacao = 'Rota Especial';
          } else if (v.highlightType === 'yellow' || (expected - currentBal) < 0) {
            situacao = 'Saldo Excedente';
          } else if (v.highlightType === 'red' || currentBal < 0) {
            situacao = 'Saldo Negativo';
          }

          return {
            funcionario: emp ? emp.name : (v.employeeName || 'Colaborador'),
            setor: emp ? getSectorName(emp.sectorId) : 'Geral',
            rota: v.route || 'Linha Urbana',
            escala: v.workSchedule || 'Segunda a Sábado',
            diaria: daily,
            previsto: expected,
            saldo: currentBal,
            recarga: recharge,
            situacao: situacao
          };
        }).sort((a, b) => a.funcionario.localeCompare(b.funcionario));

        cols = [
          { header: 'Colaborador', key: 'funcionario' },
          { header: 'Setor', key: 'setor' },
          { header: 'Linha / Rota', key: 'rota' },
          { header: 'Escala', key: 'escala' },
          { header: 'Diária', key: 'diaria', format: 'currency' },
          { header: 'Previsto', key: 'previsto', format: 'currency' },
          { header: 'Saldo Cartão', key: 'saldo', format: 'currency' },
          { header: 'Recarga', key: 'recarga', format: 'currency' },
          { header: 'Situação', key: 'situacao' }
        ];

        const totPrev = data.reduce((s, r) => s + r.previsto, 0);
        const totSaldo = data.reduce((s, r) => s + r.saldo, 0);
        const totRec = data.reduce((s, r) => s + r.recarga, 0);

        metrics = [
          { label: 'Colaboradores no Período', value: data.length, color: '#3b82f6' },
          { label: 'Custo Total Previsto', value: `R$ ${totPrev.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#6366f1' },
          { label: 'Saldo em Cartões', value: `R$ ${totSaldo.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#f59e0b' },
          { label: 'Recarga Efetiva (Boleto)', value: `R$ ${totRec.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ef4444' }
        ];
        break;
      }

      // 3. PRESENÇA PREMIADA & ASSIDUIDADE
      case 'PRESENCA_PREMIADA': {
        const activeEmps = employees.filter(e => e.status !== 'Inativo' && filterSectorMatch(e.sectorId));
        
        data = activeEmps.map(emp => {
          const warningsCount = (emp.warnings || []).length;
          const absencesCount = (emp.absences || []).filter(a => a.type === 'Falta Injustificada' || a.type === 'Suspensão').length;
          const isEligible = warningsCount === 0 && absencesCount === 0;

          return {
            funcionario: emp.name,
            cargo: emp.role || '-',
            setor: getSectorName(emp.sectorId),
            admissao: formatDateBR(emp.admissionDate),
            advertencias: warningsCount,
            faltas: absencesCount,
            status: isEligible ? 'Elegível (100% Assíduo)' : 'Desclassificado',
            premio: isEligible ? awardValue : 0,
            banco: emp.bankName ? `${emp.bankName} Ag:${emp.bankAgency || '-'} CC:${emp.bankAccount || '-'}` : (emp.cpf || 'PIX CPF')
          };
        }).sort((a, b) => {
          if (a.status === b.status) return a.funcionario.localeCompare(b.funcionario);
          return a.status.startsWith('Elegível') ? -1 : 1;
        });

        cols = [
          { header: 'Colaborador', key: 'funcionario' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Admissão', key: 'admissao' },
          { header: 'Advertências', key: 'advertencias' },
          { header: 'Faltas', key: 'faltas' },
          { header: 'Elegibilidade', key: 'status' },
          { header: 'Prêmio', key: 'premio', format: 'currency' },
          { header: 'Dados para Crédito', key: 'banco' }
        ];

        const eligibles = data.filter(d => d.status.startsWith('Elegível')).length;
        const totalInvest = eligibles * awardValue;

        metrics = [
          { label: 'Elegíveis ao Prêmio', value: `${eligibles} colaboradores`, color: '#10b981' },
          { label: 'Desclassificados', value: `${data.length - eligibles} colaboradores`, color: '#ef4444' },
          { label: 'Valor da Premiação Unit.', value: `R$ ${awardValue.toFixed(2)}`, color: '#8b5cf6' },
          { label: 'Investimento Total', value: `R$ ${totalInvest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ec4899' }
        ];
        break;
      }

      // 4. ANIVERSARIANTES DO MÊS & PERÍODO
      case 'ANIVERSARIANTES': {
        const monthNum = parseInt(monthFilter, 10);
        data = employees
          .filter(e => {
            if (!e.birthDate) return false;
            const bMonth = parseInt(e.birthDate.substring(5, 7), 10);
            const matchMonth = isNaN(monthNum) || bMonth === monthNum;
            return matchMonth && filterStatusMatch(e.status) && filterSectorMatch(e.sectorId);
          })
          .map(e => {
            const day = e.birthDate.substring(8, 10);
            const bYear = parseInt(e.birthDate.substring(0, 4), 10);
            const currentYear = 2026;
            const age = !isNaN(bYear) ? (currentYear - bYear) : '-';

            return {
              dia: `Dia ${day}`,
              rawDay: day,
              nome: e.name,
              cargo: e.role || '-',
              setor: getSectorName(e.sectorId),
              nascimento: formatDateBR(e.birthDate),
              idade: `${age} anos`,
              telefone: e.phone || '-'
            };
          })
          .sort((a, b) => (a.rawDay || '').localeCompare(b.rawDay || ''));

        cols = [
          { header: 'Dia', key: 'dia' },
          { header: 'Colaborador', key: 'nome' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Data Nasc.', key: 'nascimento' },
          { header: 'Idade Estimada', key: 'idade' },
          { header: 'Telefone / WhatsApp', key: 'telefone' }
        ];

        metrics = [
          { label: 'Aniversariantes no Mês', value: data.length, color: '#ec4899' },
          { label: 'Mês Selecionado', value: `Mês ${monthFilter}`, color: '#3b82f6' }
        ];
        break;
      }

      // 5. ADVERTÊNCIAS DISCIPLINARES & OCORRÊNCIAS
      case 'ADVERTENCIAS_DISCIPLINARES': {
        const list = [];
        employees.forEach(emp => {
          if (!filterSectorMatch(emp.sectorId)) return;
          if (emp.warnings && Array.isArray(emp.warnings)) {
            emp.warnings.forEach(w => {
              if (filterByDateRange(w.date)) {
                list.push({
                  data: formatDateBR(w.date),
                  rawDate: w.date,
                  colaborador: emp.name,
                  setor: getSectorName(emp.sectorId),
                  cargo: emp.role || '-',
                  motivo: w.motive || 'Advertência Geral',
                  descricao: w.text || '-',
                  anexo: w.docUrl ? 'Possui Anexo' : 'Sem Anexo'
                });
              }
            });
          }
        });

        data = list.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Motivo', key: 'motivo' },
          { header: 'Descrição / Infração', key: 'descricao' },
          { header: 'Documento', key: 'anexo' }
        ];

        metrics = [
          { label: 'Total de Ocorrências', value: data.length, color: '#ef4444' },
          { label: 'Colaboradores Envolvidos', value: new Set(data.map(d => d.colaborador)).size, color: '#f59e0b' }
        ];
        break;
      }

      // 6. ABSENTEÍSMO & HISTÓRICO DE FALTAS
      case 'ABSENTEISMO_FALTAS': {
        const list = [];
        employees.forEach(emp => {
          if (!filterSectorMatch(emp.sectorId)) return;
          if (emp.absences && Array.isArray(emp.absences)) {
            emp.absences.forEach(a => {
              if (filterByDateRange(a.date)) {
                list.push({
                  data: formatDateBR(a.date),
                  rawDate: a.date,
                  colaborador: emp.name,
                  setor: getSectorName(emp.sectorId),
                  tipo: a.type || 'Falta Injustificada',
                  dias: parseInt(a.days, 10) || 1,
                  motivo: a.motive || '-'
                });
              }
            });
          }
        });

        data = list.sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Setor', key: 'setor' },
          { header: 'Tipo de Ausência', key: 'tipo' },
          { header: 'Dias', key: 'dias' },
          { header: 'Justificativa / Motivo', key: 'motivo' }
        ];

        const totalDays = data.reduce((s, r) => s + r.dias, 0);
        const injustificadas = data.filter(d => d.tipo.includes('Injustificada')).length;

        metrics = [
          { label: 'Total de Ocorrências', value: data.length, color: '#3b82f6' },
          { label: 'Dias de Ausência Somados', value: `${totalDays} dias`, color: '#ef4444' },
          { label: 'Faltas Injustificadas', value: injustificadas, color: '#f59e0b' }
        ];
        break;
      }

      // 7. TURNOVER & MOVIMENTAÇÃO DE PESSOAL
      case 'TURNOVER_MOVIMENTACAO': {
        const hires = employees
          .filter(e => filterByDateRange(e.admissionDate) && filterSectorMatch(e.sectorId))
          .map(e => ({
            data: formatDateBR(e.admissionDate),
            rawDate: e.admissionDate,
            tipo: '🟢 Admissão / Contratação',
            colaborador: e.name,
            setor: getSectorName(e.sectorId),
            cargo: e.role || '-',
            contrato: e.contractType || 'CLT',
            status: e.status || 'Ativo'
          }));

        const terminations = employees
          .filter(e => (e.status === 'Inativo' || e.status === 'Demitido') && filterSectorMatch(e.sectorId))
          .map(e => ({
            data: formatDateBR(e.dismissalDate || e.admissionDate),
            rawDate: e.dismissalDate || e.admissionDate,
            tipo: '🔴 Desligamento / Rescisão',
            colaborador: e.name,
            setor: getSectorName(e.sectorId),
            cargo: e.role || '-',
            contrato: e.contractType || 'CLT',
            status: 'Inativo'
          }));

        data = [...hires, ...terminations].sort((a, b) => (b.rawDate || '').localeCompare(a.rawDate || ''));

        cols = [
          { header: 'Data', key: 'data' },
          { header: 'Movimentação', key: 'tipo' },
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Contrato', key: 'contrato' },
          { header: 'Status Atual', key: 'status' }
        ];

        metrics = [
          { label: 'Admissões no Período', value: hires.length, color: '#10b981' },
          { label: 'Desligamentos Registrados', value: terminations.length, color: '#ef4444' },
          { label: 'Saldo de Vagas', value: `${hires.length - terminations.length > 0 ? '+' : ''}${hires.length - terminations.length}`, color: '#3b82f6' }
        ];
        break;
      }

      // 8. CONTRATOS DE EXPERIÊNCIA (45 / 90 DIAS)
      case 'CONTRATOS_EXPERIENCIA': {
        const today = new Date('2026-08-21');
        data = employees
          .filter(e => e.status !== 'Inativo' && filterSectorMatch(e.sectorId) && e.admissionDate)
          .map(e => {
            const adm = new Date(e.admissionDate);
            const d45 = new Date(adm);
            d45.setDate(d45.getDate() + 45);
            const d90 = new Date(adm);
            d90.setDate(d90.getDate() + 90);

            const diffTime = d90.getTime() - today.getTime();
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            let situacao = 'Concluído (> 90 dias)';
            if (diffDays > 45) situacao = '1º Período (Até 45d)';
            else if (diffDays > 0) situacao = '2º Período (Até 90d)';

            return {
              colaborador: e.name,
              cargo: e.role || '-',
              setor: getSectorName(e.sectorId),
              admissao: formatDateBR(e.admissionDate),
              termo45: formatDateBR(d45.toISOString()),
              termo90: formatDateBR(d90.toISOString()),
              diasRestantes: diffDays > 0 ? `${diffDays} dias` : 'Vencido',
              situacao: situacao
            };
          })
          .sort((a, b) => a.colaborador.localeCompare(b.colaborador));

        cols = [
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Admissão', key: 'admissao' },
          { header: '1º Término (45d)', key: 'termo45' },
          { header: '2º Término (90d)', key: 'termo90' },
          { header: 'Prazo', key: 'diasRestantes' },
          { header: 'Fase de Experiência', key: 'situacao' }
        ];

        const emExp = data.filter(d => !d.situacao.startsWith('Concluído')).length;
        metrics = [
          { label: 'Colaboradores em Experiência', value: emExp, color: '#f59e0b' },
          { label: 'Efetivados (> 90 dias)', value: data.length - emExp, color: '#10b981' }
        ];
        break;
      }

      // 9. CONTROLE VACINAL & IMUNIZAÇÃO
      case 'CONTROLE_VACINAL': {
        const list = [];
        employees.forEach(emp => {
          if (!filterSectorMatch(emp.sectorId)) return;
          if (emp.vaccinations && Array.isArray(emp.vaccinations)) {
            emp.vaccinations.forEach(v => {
              list.push({
                colaborador: emp.name,
                setor: getSectorName(emp.sectorId),
                cargo: emp.role || '-',
                vacina: v.name || 'Hepatite B',
                dose: v.dose || '1ª Dose',
                aplicacao: formatDateBR(v.date),
                reforco: formatDateBR(v.expiryDate),
                lote: v.lot || '-',
                status: v.expiryDate && v.expiryDate < '2026-08-21' ? 'Reforço Vencido' : 'Em Dia'
              });
            });
          }
        });

        data = list.sort((a, b) => a.colaborador.localeCompare(b.colaborador));

        cols = [
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Vacina', key: 'vacina' },
          { header: 'Dose', key: 'dose' },
          { header: 'Aplicação', key: 'aplicacao' },
          { header: 'Próx. Reforço', key: 'reforco' },
          { header: 'Lote', key: 'lote' },
          { header: 'Status', key: 'status' }
        ];

        const dosesVencidas = data.filter(d => d.status === 'Reforço Vencido').length;
        metrics = [
          { label: 'Doses Registradas', value: data.length, color: '#3b82f6' },
          { label: 'Doses em Dia', value: data.length - dosesVencidas, color: '#10b981' },
          { label: 'Reforços Pendentes / Vencidos', value: dosesVencidas, color: '#ef4444' }
        ];
        break;
      }

      // 10. QUADRO DE DEPENDENTES & BENEFÍCIOS FAMILIARES
      case 'QUADRO_DEPENDENTES': {
        const list = [];
        employees.forEach(emp => {
          if (!filterSectorMatch(emp.sectorId)) return;
          if (emp.dependents && Array.isArray(emp.dependents)) {
            emp.dependents.forEach(d => {
              const bYear = d.birthDate ? parseInt(d.birthDate.substring(0, 4), 10) : NaN;
              const age = !isNaN(bYear) ? (2026 - bYear) : '-';
              const isSalarioFamilia = typeof age === 'number' && age < 14;

              list.push({
                titular: emp.name,
                cargo: emp.role || '-',
                setor: getSectorName(emp.sectorId),
                dependente: d.name || '-',
                parentesco: d.relationship || 'Filho(a)',
                nascimento: formatDateBR(d.birthDate),
                idade: typeof age === 'number' ? `${age} anos` : '-',
                beneficio: isSalarioFamilia ? 'Sim (< 14 anos)' : 'Não / IRRF'
              });
            });
          }
        });

        data = list.sort((a, b) => a.titular.localeCompare(b.titular));

        cols = [
          { header: 'Titular (Colaborador)', key: 'titular' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Nome Dependente', key: 'dependente' },
          { header: 'Parentesco', key: 'parentesco' },
          { header: 'Data Nasc.', key: 'nascimento' },
          { header: 'Idade', key: 'idade' },
          { header: 'Salário-Família', key: 'beneficio' }
        ];

        const menores14 = data.filter(d => d.beneficio.startsWith('Sim')).length;
        metrics = [
          { label: 'Total de Dependentes', value: data.length, color: '#3b82f6' },
          { label: 'Elegíveis ao Salário-Família', value: menores14, color: '#10b981' }
        ];
        break;
      }

      // 11. FOLHA DE PAGAMENTO SINTÉTICA
      case 'FOLHA_SINTETICA': {
        const sectorMap = {};
        employees.filter(e => filterStatusMatch(e.status)).forEach(emp => {
          const secName = getSectorName(emp.sectorId);
          if (!sectorMap[secName]) {
            sectorMap[secName] = { setor: secName, total: 0, clt: 0, pj: 0, folha: 0 };
          }
          sectorMap[secName].total += 1;
          if (emp.contractType === 'PJ') sectorMap[secName].pj += 1;
          else sectorMap[secName].clt += 1;
          sectorMap[secName].folha += (parseFloat(emp.salary) || 0);
        });

        const totalFolhaGeral = Object.values(sectorMap).reduce((s, x) => s + x.folha, 0);

        data = Object.values(sectorMap).map(sec => ({
          setor: sec.setor,
          total: sec.total,
          clt: sec.clt,
          pj: sec.pj,
          folha: sec.folha,
          media: sec.total > 0 ? (sec.folha / sec.total) : 0,
          perc: totalFolhaGeral > 0 ? ((sec.folha / totalFolhaGeral) * 100).toFixed(1) + '%' : '0%'
        })).sort((a, b) => b.folha - a.folha);

        cols = [
          { header: 'Setor', key: 'setor' },
          { header: 'Efetivo', key: 'total' },
          { header: 'CLT', key: 'clt' },
          { header: 'PJ / Outros', key: 'pj' },
          { header: 'Massa Salarial', key: 'folha', format: 'currency' },
          { header: 'Salário Médio', key: 'media', format: 'currency' },
          { header: 'Participação', key: 'perc' }
        ];

        metrics = [
          { label: 'Massa Salarial Geral', value: `R$ ${totalFolhaGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, color: '#ec4899' },
          { label: 'Total de Colaboradores', value: employees.filter(e => filterStatusMatch(e.status)).length, color: '#3b82f6' }
        ];
        break;
      }

      // 12. DADOS BANCÁRIOS & CONTAS PARA PIX
      case 'DADOS_BANCARIOS': {
        data = employees
          .filter(e => filterStatusMatch(e.status) && filterSectorMatch(e.sectorId))
          .map(e => ({
            colaborador: e.name,
            cpf: e.cpf || '-',
            cargo: e.role || '-',
            setor: getSectorName(e.sectorId),
            banco: e.bankName || 'Não Informado',
            agencia: e.bankAgency || '-',
            conta: e.bankAccount || '-',
            pix: e.cpf || '-',
            salario: parseFloat(e.salary) || 0
          }))
          .sort((a, b) => a.colaborador.localeCompare(b.colaborador));

        cols = [
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'CPF', key: 'cpf' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Setor', key: 'setor' },
          { header: 'Banco', key: 'banco' },
          { header: 'Agência', key: 'agencia' },
          { header: 'Conta', key: 'conta' },
          { header: 'Chave PIX (CPF)', key: 'pix' },
          { header: 'Salário', key: 'salario', format: 'currency' }
        ];

        const comBanco = data.filter(d => d.banco !== 'Não Informado').length;
        metrics = [
          { label: 'Colaboradores Listados', value: data.length, color: '#3b82f6' },
          { label: 'Dados Bancários Completos', value: comBanco, color: '#10b981' },
          { label: 'Pendências Cadastrais', value: data.length - comBanco, color: '#ef4444' }
        ];
        break;
      }

      // 13. DOCUMENTOS OCUPACIONAIS & VENCIMENTOS
      case 'DOCUMENTOS_VENCIMENTOS': {
        const list = [];
        employees.forEach(emp => {
          if (!filterSectorMatch(emp.sectorId)) return;
          if (emp.cnhExpiry) {
            const isExp = emp.cnhExpiry < '2026-08-21';
            list.push({
              colaborador: emp.name,
              setor: getSectorName(emp.sectorId),
              documento: 'CNH - Carteira de Motorista',
              registro: emp.cnhNumber || '-',
              vencimento: formatDateBR(emp.cnhExpiry),
              status: isExp ? '🔴 Vencido' : '🟢 Em Dia'
            });
          }
          if (emp.documents && Array.isArray(emp.documents)) {
            emp.documents.forEach(doc => {
              const isExp = doc.expiryDate && doc.expiryDate < '2026-08-21';
              list.push({
                colaborador: emp.name,
                setor: getSectorName(emp.sectorId),
                documento: doc.name || doc.category || 'Documento',
                registro: doc.category || '-',
                vencimento: formatDateBR(doc.expiryDate),
                status: doc.expiryDate ? (isExp ? '🔴 Vencido' : '🟢 Em Dia') : 'Sem Vencimento'
              });
            });
          }
        });

        data = list.sort((a, b) => a.colaborador.localeCompare(b.colaborador));

        cols = [
          { header: 'Colaborador', key: 'colaborador' },
          { header: 'Setor', key: 'setor' },
          { header: 'Documento', key: 'documento' },
          { header: 'Categoria / Registro', key: 'registro' },
          { header: 'Data Vencimento', key: 'vencimento' },
          { header: 'Situação', key: 'status' }
        ];

        const vencidos = data.filter(d => d.status.includes('Vencido')).length;
        metrics = [
          { label: 'Total de Documentos', value: data.length, color: '#3b82f6' },
          { label: 'Documentos Regulares', value: data.length - vencidos, color: '#10b981' },
          { label: 'Documentos Vencidos', value: vencidos, color: '#ef4444' }
        ];
        break;
      }

      // 14. DISTRIBUIÇÃO DO EFETIVO POR SETOR
      case 'DISTRIBUICAO_EFETIVO': {
        const roleSectorMap = {};
        const totalActive = employees.filter(e => e.status !== 'Inativo').length;

        employees.forEach(emp => {
          const secName = getSectorName(emp.sectorId);
          const key = `${secName}__${emp.role || 'Geral'}`;
          if (!roleSectorMap[key]) {
            roleSectorMap[key] = { setor: secName, cargo: emp.role || 'Geral', ativos: 0, inativos: 0, total: 0 };
          }
          roleSectorMap[key].total += 1;
          if (emp.status === 'Inativo' || emp.status === 'Demitido') {
            roleSectorMap[key].inativos += 1;
          } else {
            roleSectorMap[key].ativos += 1;
          }
        });

        data = Object.values(roleSectorMap).map(item => ({
          setor: item.setor,
          cargo: item.cargo,
          ativos: item.ativos,
          inativos: item.inativos,
          total: item.total,
          percentual: totalActive > 0 ? ((item.ativos / totalActive) * 100).toFixed(1) + '%' : '0%'
        })).sort((a, b) => b.ativos - a.ativos);

        cols = [
          { header: 'Setor', key: 'setor' },
          { header: 'Cargo', key: 'cargo' },
          { header: 'Colaboradores Ativos', key: 'ativos' },
          { header: 'Inativos / Histórico', key: 'inativos' },
          { header: 'Total Cadastros', key: 'total' },
          { header: '% do Efetivo Ativo', key: 'percentual' }
        ];

        metrics = [
          { label: 'Total de Ativos na Clínica', value: totalActive, color: '#10b981' },
          { label: 'Setores Mapeados', value: new Set(data.map(d => d.setor)).size, color: '#3b82f6' },
          { label: 'Cargos Distintos', value: new Set(data.map(d => d.cargo)).size, color: '#ec4899' }
        ];
        break;
      }

      // 15. AUDITORIA DE GOVERNANÇA & LGPD
      case 'AUDITORIA_GOVERNANCA': {
        data = (auditLogs || [])
          .filter(log => filterByDateRange(log.date))
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .map(log => ({
            data: formatDateTimeBR(log.date),
            operador: log.operator === 'rh@clinica.com' ? 'Ana Carolina Cerqueira Gonzaga' : (log.operator || 'Sistema'),
            acao: log.action || 'Operação',
            detalhes: log.details || '-'
          }));

        cols = [
          { header: 'Data/Hora', key: 'data' },
          { header: 'Operador Responsável', key: 'operador' },
          { header: 'Ação Executada', key: 'acao' },
          { header: 'Detalhes da Modificação (LGPD)', key: 'detalhes' }
        ];

        metrics = [
          { label: 'Registros de Auditoria', value: data.length, color: '#3b82f6' },
          { label: 'Operadores Registrados', value: new Set(data.map(d => d.operador)).size, color: '#10b981' }
        ];
        break;
      }

      default:
        break;
    }

    setReportData(data);
    setReportColumns(cols);
    setSummaryMetrics(metrics);
  };

  const getReportName = () => REPORTS.find(r => r.id === selectedReport)?.name || 'Relatório';

  const exportPDF = () => {
    const doc = new jsPDF({ orientation: reportColumns.length > 6 ? 'landscape' : 'portrait' });
    const title = getReportName();
    
    // Header
    doc.setFontSize(14);
    doc.text(tenantSettings.name, 14, 15);
    doc.setFontSize(9);
    doc.text(`CNPJ: ${tenantSettings.cnpj}`, 14, 21);
    doc.text(`Relatório: ${title}`, 14, 27);
    doc.text(`Setor: ${sectorFilter} | Status: ${statusFilter} | Período: ${formatDateBR(startDate)} a ${formatDateBR(endDate)}`, 14, 33);

    const tableColumn = reportColumns.map(c => c.header);
    const tableRows = reportData.map(row => 
      reportColumns.map(col => {
        let val = row[col.key];
        if (col.format === 'currency') {
          return typeof val === 'number'
            ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : val;
        }
        return val ?? '-';
      })
    );

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      styles: { fontSize: 7.5, cellPadding: 2 },
      headStyles: { fillColor: [236, 72, 153] } // pink-600 NexaHR
    });

    doc.save(`${title.replace(/\s+/g, '_')}.pdf`);
  };

  const exportXLS = () => {
    const title = getReportName();
    const wsData = reportData.map(row => {
      const newRow = {};
      reportColumns.forEach(col => {
        let val = row[col.key];
        if (col.format === 'currency') {
          val = typeof val === 'number' ? Number(val.toFixed(2)) : (parseFloat(val) || 0);
        }
        newRow[col.header] = val;
      });
      return newRow;
    });

    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório RH");
    
    XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.25rem', color: '#0f172a' }}>
              <FileText size={22} color="#ec4899" /> Central de Relatórios de RH & Pessoas
            </h2>
            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', color: '#64748b' }}>
              Análises estratégicas, controle de vale-transporte, assiduidade, dados bancários e conformidade trabalhista.
            </p>
          </div>
          <button onClick={onClose} style={styles.closeBtn}>
            <X size={24} />
          </button>
        </div>

        <div style={styles.body}>
          {/* Sidebar */}
          <div style={styles.sidebar}>
            <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Relatórios do Módulo RH</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto', maxHeight: 'calc(100vh - 200px)', paddingRight: '0.5rem' }}>
              {REPORTS.map(r => {
                const isSelected = selectedReport === r.id;
                const Icon = r.icon;
                return (
                  <button 
                    key={r.id} 
                    onClick={() => setSelectedReport(r.id)}
                    style={{ 
                      ...styles.reportBtn, 
                      backgroundColor: isSelected ? '#fdf2f8' : 'transparent', 
                      color: isSelected ? '#be185d' : '#475569', 
                      borderLeft: isSelected ? '3px solid #ec4899' : '3px solid transparent' 
                    }}
                  >
                    <Icon size={16} />
                    <span style={{ fontSize: '0.83rem', fontWeight: isSelected ? '700' : '500', textAlign: 'left' }}>{r.name}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Main Area */}
          <div style={styles.main}>
            {/* Filters */}
            <div style={styles.filtersBar}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Início</label>
                  <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Fim</label>
                  <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={styles.input} />
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Setor</label>
                  <select value={sectorFilter} onChange={e => setSectorFilter(e.target.value)} style={styles.input}>
                    <option value="Todos">Todos os Setores</option>
                    {(sectors && sectors.length > 0 ? sectors : STANDARD_SECTORS)
                      .map(s => ({ ...s, name: normalizeSectorName(s.name) }))
                      .filter((s, idx, arr) => arr.findIndex(x => x.name === s.name) === idx)
                      .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
                      .map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div style={styles.filterGroup}>
                  <label style={styles.label}>Status</label>
                  <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={styles.input}>
                    <option value="Ativo">Ativos</option>
                    <option value="Inativo">Inativos</option>
                    <option value="Todos">Todos</option>
                  </select>
                </div>

                {selectedReport === 'ANIVERSARIANTES' && (
                  <div style={styles.filterGroup}>
                    <label style={styles.label}>Mês</label>
                    <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)} style={styles.input}>
                      <option value="01">01 - Janeiro</option>
                      <option value="02">02 - Fevereiro</option>
                      <option value="03">03 - Março</option>
                      <option value="04">04 - Abril</option>
                      <option value="05">05 - Maio</option>
                      <option value="06">06 - Junho</option>
                      <option value="07">07 - Julho</option>
                      <option value="08">08 - Agosto</option>
                      <option value="09">09 - Setembro</option>
                      <option value="10">10 - Outubro</option>
                      <option value="11">11 - Novembro</option>
                      <option value="12">12 - Dezembro</option>
                    </select>
                  </div>
                )}

                {selectedReport === 'VALE_TRANSPORTE' && (
                  <div style={styles.filterGroup}>
                    <label style={styles.label}>Competência VT</label>
                    <select value={vtPeriodFilter} onChange={e => setVtPeriodFilter(e.target.value)} style={styles.input}>
                      <option value="2026-08">Agosto/2026</option>
                      <option value="2026-07">Julho/2026</option>
                      <option value="2026-06">Junho/2026</option>
                      <option value="2026-05">Maio/2026</option>
                      <option value="2026-04">Abril/2026</option>
                      <option value="2026-03">Março/2026</option>
                    </select>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={exportPDF} style={styles.exportPdfBtn}>
                  <Download size={16} /> Exportar PDF
                </button>
                <button onClick={exportXLS} style={styles.exportXlsBtn}>
                  <FileSpreadsheet size={16} /> Exportar Excel
                </button>
              </div>
            </div>

            {/* Summary Metrics Bar */}
            {summaryMetrics.length > 0 && (
              <div style={styles.metricsBar}>
                {summaryMetrics.map((m, idx) => (
                  <div key={idx} style={{ ...styles.metricCard, borderLeft: `4px solid ${m.color || '#3b82f6'}` }}>
                    <span style={styles.metricLabel}>{m.label}</span>
                    <span style={{ ...styles.metricVal, color: m.color || '#0f172a' }}>{m.value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Table View */}
            <div style={styles.tableContainer}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Pré-visualização: {getReportName()}</span>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'normal' }}>Total: {reportData.length} registros</span>
              </h3>
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
                        if (col.format === 'currency') {
                          val = typeof val === 'number' 
                            ? `R$ ${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
                            : val;
                        }
                        if (val === undefined || val === null) val = '-';
                        return <td key={col.key} style={styles.td}>{val}</td>
                      })}
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={reportColumns.length || 1} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                        Nenhum registro encontrado para os filtros selecionados.
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
    zIndex: 99999, padding: '2rem'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    width: '100%', maxWidth: '1400px',
    height: '100%', maxHeight: '90vh',
    display: 'flex', flexDirection: 'column',
    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
    overflow: 'hidden'
  },
  header: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#f8fafc'
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#64748b',
    padding: '0.5rem', borderRadius: '8px'
  },
  body: {
    display: 'flex', flex: 1, overflow: 'hidden'
  },
  sidebar: {
    width: '300px',
    borderRight: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
    padding: '1rem',
    display: 'flex', flexDirection: 'column'
  },
  reportBtn: {
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '0.7rem 0.9rem', borderRadius: '8px', cursor: 'pointer',
    borderTop: 'none', borderRight: 'none', borderBottom: 'none',
    transition: 'all 0.2s'
  },
  main: {
    flex: 1, display: 'flex', flexDirection: 'column',
    backgroundColor: '#ffffff', overflow: 'hidden'
  },
  filtersBar: {
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '0.75rem'
  },
  filterGroup: {
    display: 'flex', flexDirection: 'column', gap: '0.2rem'
  },
  label: {
    fontSize: '0.7rem', fontWeight: '700', color: '#475569', textTransform: 'uppercase'
  },
  input: {
    padding: '0.45rem 0.7rem', borderRadius: '6px', border: '1px solid #cbd5e1',
    fontSize: '0.82rem', color: '#0f172a', outline: 'none', backgroundColor: '#fff'
  },
  exportPdfBtn: {
    display: 'flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.5rem 1rem', borderRadius: '6px',
    backgroundColor: '#ef4444', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
  },
  exportXlsBtn: {
    display: 'flex', alignItems: 'center', gap: '0.45rem',
    padding: '0.5rem 1rem', borderRadius: '6px',
    backgroundColor: '#10b981', color: '#fff', border: 'none', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer'
  },
  metricsBar: {
    display: 'flex', gap: '1rem', padding: '0.75rem 1.5rem', backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0', overflowX: 'auto'
  },
  metricCard: {
    backgroundColor: '#ffffff', padding: '0.5rem 1rem', borderRadius: '8px',
    border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minWidth: '180px'
  },
  metricLabel: {
    fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase'
  },
  metricVal: {
    fontSize: '1.1rem', fontWeight: '800', marginTop: '0.2rem'
  },
  tableContainer: {
    padding: '1.5rem', flex: 1, overflowY: 'auto'
  },
  th: {
    textAlign: 'left', padding: '0.65rem 0.75rem', backgroundColor: '#f8fafc',
    borderBottom: '2px solid #e2e8f0', color: '#475569', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase'
  },
  td: {
    padding: '0.65rem 0.75rem', fontSize: '0.82rem', color: '#1e293b'
  }
};
