import React, { useState, useEffect, useCallback } from 'react';
import {
  RefreshCw,
  Users,
  History,
  Printer,
  TrendingUp,
  LayoutGrid,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ModuleHeader from '../common/ModuleHeader';
import { useUnit } from '../../contexts/UnitContext';
import {
  getReusePatients,
  saveReusePatient,
  deleteReusePatient,
  registrarPresenca,
  registrarFalta,
  trocarCapilar,
  getReuseSwaps,
  importPatientsFromClinic,
  getReuseYieldMetrics
} from '../../services/firebase/reuseService';

import ReuseDashboardTab from './ReuseDashboardTab';
import ReusePatientsTab from './ReusePatientsTab';
import ReuseSwapsTab from './ReuseSwapsTab';
import ReuseLabelsTab from './ReuseLabelsTab';
import ReuseYieldTab from './ReuseYieldTab';
import ReuseMapTab from './ReuseMapTab';
import ModalTrocaCapilar from './ModalTrocaCapilar';
import ReuseReportsModal from './ReuseReportsModal';

export default function ReusePanel({ currentUser, isReportsOpen, setIsReportsOpen }) {
  const { activeUnitId } = useUnit();

  // Abas oficiais com padrão de rótulo conciso (1 palavra)
  const [abaAtiva, setAbaAtiva] = useState('painel');

  // Estados principais
  const [pacientes, setPacientes] = useState([]);
  const [trocas, setTrocas] = useState([]);
  const [yieldMetrics, setYieldMetrics] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [carregandoImportacao, setCarregandoImportacao] = useState(false);

  // Modais
  const [pacienteParaTroca, setPacienteParaTroca] = useState(null);
  const [pacienteParaEtiqueta, setPacienteParaEtiqueta] = useState(null);
  const [modalRelatoriosAberto, setModalRelatoriosAberto] = useState(false);

  // Toasts / Notificações
  const [toast, setToast] = useState(null);

  const exibirToast = (mensagem, tipo = 'sucesso') => {
    setToast({ mensagem, tipo });
    setTimeout(() => setToast(null), 4000);
  };

  // Carregamento de dados
  const carregarDados = useCallback(async () => {
    setCarregando(true);
    try {
      const [listaPacientes, listaTrocas, metricas] = await Promise.all([
        getReusePatients({ unitId: activeUnitId }),
        getReuseSwaps({ unitId: activeUnitId }),
        getReuseYieldMetrics({ unitId: activeUnitId })
      ]);
      setPacientes(listaPacientes);
      setTrocas(listaTrocas);
      setYieldMetrics(metricas);
    } catch (err) {
      console.error('Erro ao carregar dados do Reuso:', err);
      exibirToast('Erro ao sincronizar dados do reuso.', 'erro');
    } finally {
      setCarregando(false);
    }
  }, [activeUnitId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  // Se a Navbar global acionar relatórios
  useEffect(() => {
    if (isReportsOpen) {
      setModalRelatoriosAberto(true);
    }
  }, [isReportsOpen]);

  const fecharModalRelatorios = () => {
    setModalRelatoriosAberto(false);
    if (setIsReportsOpen) setIsReportsOpen(false);
  };

  // Ações de Presença (+1) e Falta (-1)
  const handlePresenca = async (pacienteId) => {
    try {
      await registrarPresenca(pacienteId, {
        operadoPor: currentUser?.displayName || currentUser?.name || 'Operador'
      });
      exibirToast('Presença confirmada (+1 uso)');
      await carregarDados();
    } catch (err) {
      exibirToast(err?.message || 'Erro ao registrar presença.', 'erro');
    }
  };

  const handleFalta = async (pacienteId) => {
    try {
      await registrarFalta(pacienteId, {
        operadoPor: currentUser?.displayName || currentUser?.name || 'Operador'
      });
      exibirToast('Falta registrada (-1 uso)');
      await carregarDados();
    } catch (err) {
      exibirToast(err?.message || 'Erro ao registrar falta.', 'erro');
    }
  };

  // Troca de Capilar
  const handleConfirmarTroca = async (dadosTroca) => {
    if (!pacienteParaTroca) return;
    try {
      await trocarCapilar(pacienteParaTroca.id, {
        ...dadosTroca,
        operadoPor: currentUser?.displayName || currentUser?.name || 'Enfermagem'
      });
      exibirToast(`Capilar trocado com sucesso para ${pacienteParaTroca.nome}!`);
      setPacienteParaTroca(null);
      await carregarDados();
    } catch (err) {
      exibirToast(err?.message || 'Erro ao realizar troca.', 'erro');
      throw err;
    }
  };

  // Salvar / Excluir Paciente
  const handleSalvarPaciente = async (dados) => {
    await saveReusePatient({ ...dados, unitId: activeUnitId });
    await carregarDados();
  };

  const handleExcluirPaciente = async (id) => {
    await deleteReusePatient(id);
    exibirToast('Paciente removido do reuso.');
    await carregarDados();
  };

  // Importar da Clínica (SM-009)
  const handleImportarDaClinica = async () => {
    setCarregandoImportacao(true);
    try {
      const res = await importPatientsFromClinic(activeUnitId);
      exibirToast(res.mensagem || 'Importação concluída com sucesso!');
      await carregarDados();
      return res;
    } catch (err) {
      exibirToast('Erro ao importar pacientes da clínica.', 'erro');
      throw err;
    } finally {
      setCarregandoImportacao(false);
    }
  };

  const abas = [
    { id: 'painel', rotulo: 'Painel', icone: RefreshCw },
    { id: 'pacientes', rotulo: 'Pacientes', icone: Users },
    { id: 'trocas', rotulo: 'Trocas', icone: History },
    { id: 'etiquetas', rotulo: 'Etiquetas', icone: Printer },
    { id: 'aproveitamento', rotulo: 'Aproveitamento', icone: TrendingUp },
    { id: 'mapa', rotulo: 'Mapa', icone: LayoutGrid },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Cabeçalho Oficial do Módulo */}
      <ModuleHeader
        icon={RefreshCw}
        title=".REUSE"
        subtitle="Reprocessamento e Rastreabilidade de Dialisadores"
        gradient="linear-gradient(135deg, #0891b2, #06b6d4)"
        dotColor="#06b6d4"
        actions={
          <div style={{ display: 'flex', gap: '0.65rem' }}>
            <button
              onClick={() => setModalRelatoriosAberto(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.55rem 0.95rem',
                borderRadius: '10px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--card-bg, #ffffff)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              <FileSpreadsheet size={16} color="#0891b2" />
              <span>Relatórios</span>
            </button>
          </div>
        }
      />

      {/* Toast Informativo */}
      {toast && (
        <div
          style={{
            padding: '0.75rem 1.25rem',
            borderRadius: '10px',
            backgroundColor: toast.tipo === 'erro' ? '#fef2f2' : '#ecfdf5',
            color: toast.tipo === 'erro' ? '#dc2626' : '#059669',
            border: `1px solid ${toast.tipo === 'erro' ? '#fecaca' : '#a7f3d0'}`,
            fontSize: '0.85rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
          }}
        >
          {toast.tipo === 'erro' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{toast.mensagem}</span>
        </div>
      )}

      {/* Navegação por Abas (Rótulos de 1 Palavra) */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color, #e2e8f0)',
          paddingBottom: '0.25rem',
          overflowX: 'auto'
        }}
      >
        {abas.map((a) => {
          const Icon = a.icone;
          const ativa = abaAtiva === a.id;
          return (
            <button
              key={a.id}
              onClick={() => setAbaAtiva(a.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.65rem 1.1rem',
                borderRadius: '8px 8px 0 0',
                border: 'none',
                borderBottom: ativa ? '3px solid #06b6d4' : '3px solid transparent',
                backgroundColor: ativa ? 'var(--card-bg, #ffffff)' : 'transparent',
                color: ativa ? '#0891b2' : 'var(--text-secondary, #64748b)',
                fontSize: '0.85rem',
                fontWeight: ativa ? 700 : 500,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              <span>{a.rotulo}</span>
            </button>
          );
        })}
      </div>

      {/* Conteúdo Dinâmico da Aba Selecionada */}
      {carregando ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-secondary, #64748b)' }}>
          Carregando dados do reuso de dialisadores...
        </div>
      ) : (
        <div>
          {abaAtiva === 'painel' && (
            <ReuseDashboardTab
              pacientes={pacientes}
              onPresenca={handlePresenca}
              onFalta={handleFalta}
              onAbrirTroca={(p) => setPacienteParaTroca(p)}
              onImprimirEtiqueta={(p) => {
                setPacienteParaEtiqueta(p);
                setAbaAtiva('etiquetas');
              }}
              currentUser={currentUser}
            />
          )}

          {abaAtiva === 'pacientes' && (
            <ReusePatientsTab
              pacientes={pacientes}
              onSalvarPaciente={handleSalvarPaciente}
              onExcluirPaciente={handleExcluirPaciente}
              onImportarDaClinica={handleImportarDaClinica}
              carregandoImportacao={carregandoImportacao}
            />
          )}

          {abaAtiva === 'trocas' && (
            <ReuseSwapsTab trocas={trocas} />
          )}

          {abaAtiva === 'etiquetas' && (
            <ReuseLabelsTab pacientes={pacientes} />
          )}

          {abaAtiva === 'aproveitamento' && (
            <ReuseYieldTab trocas={trocas} yieldMetrics={yieldMetrics} />
          )}

          {abaAtiva === 'mapa' && (
            <ReuseMapTab
              pacientes={pacientes}
              onAbrirTroca={(p) => setPacienteParaTroca(p)}
            />
          )}
        </div>
      )}

      {/* Modal de Troca de Capilar */}
      {pacienteParaTroca && (
        <ModalTrocaCapilar
          paciente={pacienteParaTroca}
          onConfirmar={handleConfirmarTroca}
          onFechar={() => setPacienteParaTroca(null)}
        />
      )}

      {/* Central de Relatórios Oficiais com Exportação Excel */}
      <ReuseReportsModal
        isOpen={modalRelatoriosAberto}
        onClose={fecharModalRelatorios}
        pacientes={pacientes}
        trocas={trocas}
      />
    </div>
  );
}
