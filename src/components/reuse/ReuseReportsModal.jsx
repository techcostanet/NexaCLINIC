import React, { useState } from 'react';
import { X, Download, Printer, FileSpreadsheet, Layers, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import * as XLSX from 'xlsx';
import { MAX_REUSO, LIMIAR_ATENCAO, SALOES, TURNOS, ESCALAS } from '../../utils/reuseRules';
import { formatarDataBr } from '../../utils/reuseLabels';

export default function ReuseReportsModal({ isOpen, onClose, pacientes = [], trocas = [] }) {
  if (!isOpen) return null;

  const [relatorioSelecionado, setRelatorioSelecionado] = useState(1);
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');

  const relatorios = [
    { id: 1, titulo: 'Censo de Dialisadores', descricao: 'Listagem geral de pacientes, localização em boxes, modelo de capilar e contador de reusos.' },
    { id: 2, titulo: 'Limite e Atenção', descricao: 'Relação de capilares que atingiram o limite regulamentar (20 usos) ou estão em atenção prévia (18-19 usos).' },
    { id: 3, titulo: 'Histórico de Trocas', descricao: 'Auditoria de substituições de capilares por término de vida útil ou descarte precoce por complicação.' },
    { id: 4, titulo: 'Aproveitamento por Salão', descricao: 'Demonstrativo analítico de taxa de aproveitamento e comparação com a meta clínica.' },
    { id: 5, titulo: 'Rastreabilidade de Lotes', descricao: 'Mapeamento de insumos, número de lotes utilizados e identificação dos profissionais operadores.' }
  ];

  // Filtra pacientes
  const pacientesFiltrados = pacientes.filter((p) => {
    if (salaoFiltro !== 'TODOS' && String(p.salao) !== salaoFiltro) return false;
    if (turnoFiltro !== 'TODOS' && String(p.turno) !== turnoFiltro) return false;
    return true;
  });

  // Filtra trocas
  const trocasFiltradas = trocas.filter((t) => {
    if (salaoFiltro !== 'TODOS' && String(t.paciente_salao) !== salaoFiltro) return false;
    if (turnoFiltro !== 'TODOS' && String(t.paciente_turno) !== turnoFiltro) return false;
    return true;
  });

  // Exportação nativa em Excel (.xlsx) — [SM-011]
  const handleExportarExcel = () => {
    let dados = [];
    let nomeAba = 'Relatório';

    if (relatorioSelecionado === 1) {
      nomeAba = 'Censo Dialisadores';
      dados = pacientesFiltrados.map((p) => ({
        Paciente: p.nome,
        CPF: p.cpf || '—',
        Capilar: p.capilar,
        'Ciclos Atuais': p.reuso_atual || 0,
        Escala: p.escala === 'SEG_QUA_SEX' ? 'Seg/Qua/Sex' : 'Ter/Qui/Sáb',
        Salão: `Salão ${p.salao}`,
        Turno: `Turno ${p.turno}`,
        Box: `Box ${p.box} (P${p.posicao})`,
        'Prime Inicial': `${p.prime_inicial || 115} mL`,
        'Prime Final': `${p.prime_final || 92} mL`,
        'Primeiro Uso': formatarDataBr(p.data_primeiro_uso)
      }));
    } else if (relatorioSelecionado === 2) {
      nomeAba = 'Limite e Atenção';
      dados = pacientesFiltrados
        .filter((p) => (p.reuso_atual || 0) >= LIMIAR_ATENCAO)
        .map((p) => ({
          Paciente: p.nome,
          Capilar: p.capilar,
          'Ciclos Atuais': p.reuso_atual || 0,
          Status: (p.reuso_atual || 0) >= MAX_REUSO ? 'Crítico (Troca Obrigatória)' : 'Atenção (Troca Iminente)',
          Salão: `Salão ${p.salao}`,
          Turno: `Turno ${p.turno}`,
          Box: `Box ${p.box}`
        }));
    } else if (relatorioSelecionado === 3) {
      nomeAba = 'Histórico de Trocas';
      dados = trocasFiltradas.map((t) => ({
        Data: formatarDataBr(t.data_troca),
        Paciente: t.paciente_nome,
        Salão: `Salão ${t.paciente_salao}`,
        Turno: `Turno ${t.paciente_turno}`,
        'Capilar Anterior': t.capilar_anterior,
        'Capilar Novo': t.capilar_novo,
        'Usos no Descarte': t.reuso_no_momento,
        Motivo: t.motivo === 'LIMITE_20_USOS' ? 'Limite 20 Usos' : 'Descarte Precoce',
        Justificativa: t.motivo_detalhe || '—',
        Lote: t.lote_novo || '—',
        Operador: t.operador || '—'
      }));
    } else if (relatorioSelecionado === 4) {
      nomeAba = 'Aproveitamento Salões';
      dados = SALOES.map((s) => {
        const daSala = trocasFiltradas.filter((t) => Number(t.paciente_salao) === Number(s));
        const totalS = daSala.length;
        const mediaS = totalS === 0 ? 0 : Math.round(daSala.reduce((acc, t) => acc + (Number(t.reuso_no_momento) / MAX_REUSO) * 100, 0) / totalS);
        return {
          Salão: `Salão ${s}`,
          'Total de Trocas': totalS,
          'Aproveitamento Médio (%)': `${mediaS}%`,
          'Meta Regulamentar (%)': '85%',
          Status: mediaS >= 85 ? 'Conforme' : 'Abaixo da Meta'
        };
      });
    } else if (relatorioSelecionado === 5) {
      nomeAba = 'Rastreabilidade Lotes';
      dados = trocasFiltradas.map((t) => ({
        Data: formatarDataBr(t.data_troca),
        Lote: t.lote_novo || '—',
        Capilar: t.capilar_novo,
        Paciente: t.paciente_nome,
        Operador: t.operador || '—'
      }));
    }

    const ws = XLSX.utils.json_to_sheet(dados);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, nomeAba);
    XLSX.writeFile(wb, `Relatorio_${nomeAba.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleImprimir = () => {
    window.print();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          color: 'var(--text-primary, #0f172a)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            borderBottom: '1px solid var(--border-color, #e2e8f0)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#ecfeff',
                color: '#0891b2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>Central de Relatórios de Reuso</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                Rastreabilidade, auditoria regulamentar e exportação em Excel (.xlsx)
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        {/* Corpo com Seleção de Relatório e Filtros */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Menu Lateral de Relatórios */}
          <div
            style={{
              width: '280px',
              borderRight: '1px solid var(--border-color, #e2e8f0)',
              backgroundColor: 'var(--bg-color, #f8fafc)',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
              overflowY: 'auto'
            }}
          >
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.2rem' }}>
              Relatórios Disponíveis
            </span>
            {relatorios.map((r) => {
              const isSelected = relatorioSelecionado === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => setRelatorioSelecionado(r.id)}
                  style={{
                    textAlign: 'left',
                    padding: '0.65rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid #06b6d4' : '1px solid transparent',
                    backgroundColor: isSelected ? '#ffffff' : 'transparent',
                    boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: isSelected ? '#0891b2' : 'var(--text-primary)' }}>
                    {r.titulo}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.2 }}>
                    {r.descricao}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Painel Central de Visualização e Filtros */}
          <div style={{ flex: 1, padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <select
                  value={salaoFiltro}
                  onChange={(e) => setSalaoFiltro(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                >
                  <option value="TODOS">Todos Salões</option>
                  {SALOES.map((s) => (
                    <option key={s} value={String(s)}>Salão {s}</option>
                  ))}
                </select>

                <select
                  value={turnoFiltro}
                  onChange={(e) => setTurnoFiltro(e.target.value)}
                  style={{ padding: '0.4rem 0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                >
                  <option value="TODOS">Todos Turnos</option>
                  {TURNOS.map((t) => (
                    <option key={t} value={String(t)}>Turno {t}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleImprimir}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <Printer size={15} />
                  Imprimir
                </button>

                <button
                  onClick={handleExportarExcel}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.5rem 0.95rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#10b981',
                    color: '#fff',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  <Download size={15} />
                  Excel (.xlsx)
                </button>
              </div>
            </div>

            {/* Pré-visualização resumida do relatório selecionado */}
            <div
              style={{
                backgroundColor: 'var(--bg-color, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                borderRadius: '10px',
                padding: '1rem',
                fontSize: '0.82rem'
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: '0.5rem', color: '#0891b2' }}>
                {relatorios.find((r) => r.id === relatorioSelecionado)?.titulo}
              </div>
              <p style={{ margin: 0, color: 'var(--text-secondary, #64748b)' }}>
                O arquivo gerado conterá a base completa de registros correspondentes ao filtro atual ({salaoFiltro === 'TODOS' ? 'Todos Salões' : `Salão ${salaoFiltro}`}, {turnoFiltro === 'TODOS' ? 'Todos Turnos' : `Turno ${turnoFiltro}`}), formatado em tabela com cabeçalhos padronizados para auditorias sanitárias e controle da qualidade hospitalar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
