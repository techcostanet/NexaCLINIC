import React, { useState } from 'react';
import { Download, Search, RefreshCw, AlertTriangle, CheckCircle2, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SALOES, TURNOS, MOTIVOS_TROCA, MOTIVO_LABEL } from '../../utils/reuseRules';
import { formatarDataBr } from '../../utils/reuseLabels';

export default function ReuseSwapsTab({ trocas = [] }) {
  const [busca, setBusca] = useState('');
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');
  const [motivoFiltro, setMotivoFiltro] = useState('TODOS');

  // Filtragem das trocas
  const filtradas = trocas.filter((t) => {
    if (salaoFiltro !== 'TODOS' && String(t.paciente_salao) !== salaoFiltro) return false;
    if (turnoFiltro !== 'TODOS' && String(t.paciente_turno) !== turnoFiltro) return false;
    if (motivoFiltro !== 'TODOS' && t.motivo !== motivoFiltro) return false;
    if (busca) {
      const b = busca.toLowerCase();
      const matchNome = (t.paciente_nome || '').toLowerCase().includes(b);
      const matchDetalhe = (t.motivo_detalhe || '').toLowerCase().includes(b);
      const matchLote = (t.lote_novo || '').toLowerCase().includes(b);
      const matchOp = (t.operador || '').toLowerCase().includes(b);
      if (!matchNome && !matchDetalhe && !matchLote && !matchOp) return false;
    }
    return true;
  });

  // Exportação nativa em Excel (.xlsx) — [SM-011]
  const handleExportarExcel = () => {
    const dadosExcel = filtradas.map((t) => ({
      Data: formatarDataBr(t.data_troca || t.criado_em),
      Paciente: t.paciente_nome,
      Salão: `Salão ${t.paciente_salao || '—'}`,
      Turno: `T${t.paciente_turno || '—'}`,
      'Capilar Anterior': t.capilar_anterior || '—',
      'Capilar Novo': t.capilar_novo || '—',
      'Usos Atingidos': t.reuso_no_momento || 0,
      Motivo: t.motivo === 'LIMITE_20_USOS' ? 'Limite 20 Usos' : 'Descarte Precoce',
      'Justificativa / Detalhe': t.motivo_detalhe || (t.motivo === 'LIMITE_20_USOS' ? 'Limite regulamentar atingido' : '—'),
      Lote: t.lote_novo || '—',
      Operador: t.operador || '—'
    }));

    const ws = XLSX.utils.json_to_sheet(dadosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trocas de Capilares');

    // Auto-width
    const colWidths = [
      { wch: 12 }, { wch: 32 }, { wch: 10 }, { wch: 8 },
      { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 18 },
      { wch: 28 }, { wch: 14 }, { wch: 22 }
    ];
    ws['!cols'] = colWidths;

    XLSX.writeFile(wb, `Trocas_Reuso_Capilares_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalLimite = filtradas.filter((t) => t.motivo === 'LIMITE_20_USOS').length;
  const totalDescarte = filtradas.length - totalLimite;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Barra de Filtros e Exportação Excel */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem',
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '12px',
          padding: '0.75rem 1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '0.6rem', flex: 1, minWidth: '220px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.65rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted, #94a3b8)'
              }}
            />
            <input
              type="text"
              placeholder="Buscar por paciente, operador, motivo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.5rem 0.5rem 2.2rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-color, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem'
              }}
            />
          </div>

          <select
            value={salaoFiltro}
            onChange={(e) => setSalaoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-color, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.82rem'
            }}
          >
            <option value="TODOS">Todos Salões</option>
            {SALOES.map((s) => (
              <option key={s} value={String(s)}>Salão {s}</option>
            ))}
          </select>

          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-color, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.82rem'
            }}
          >
            <option value="TODOS">Todos Turnos</option>
            {TURNOS.map((t) => (
              <option key={t} value={String(t)}>Turno {t}</option>
            ))}
          </select>

          <select
            value={motivoFiltro}
            onChange={(e) => setMotivoFiltro(e.target.value)}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-color, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.82rem'
            }}
          >
            <option value="TODOS">Todos Motivos</option>
            <option value="LIMITE_20_USOS">Limite 20 Usos</option>
            <option value="DESPREZADO_MANUAL">Descarte Precoce</option>
          </select>
        </div>

        {/* Botão de Exportação Excel (SM-011) */}
        <button
          onClick={handleExportarExcel}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.55rem 1rem',
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
          Exportar
        </button>
      </div>

      {/* Tabela de Trocas */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
            <thead>
              <tr
                style={{
                  borderBottom: '1px solid var(--border-color, #e2e8f0)',
                  backgroundColor: 'var(--bg-color, #f8fafc)',
                  color: 'var(--text-secondary, #64748b)',
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em'
                }}
              >
                <th style={{ padding: '0.85rem 1rem' }}>Data</th>
                <th style={{ padding: '0.85rem 1rem' }}>Paciente</th>
                <th style={{ padding: '0.85rem 1rem' }}>Local</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capilares</th>
                <th style={{ padding: '0.85rem 1rem' }}>Ciclos</th>
                <th style={{ padding: '0.85rem 1rem' }}>Motivo</th>
                <th style={{ padding: '0.85rem 1rem' }}>Lote</th>
                <th style={{ padding: '0.85rem 1rem' }}>Operador</th>
              </tr>
            </thead>
            <tbody>
              {filtradas.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>
                    Nenhuma troca registrada com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtradas.map((t) => {
                  const ehLimite = t.motivo === 'LIMITE_20_USOS';
                  return (
                    <tr key={t.id} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        {formatarDataBr(t.data_troca || t.criado_em)}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
                        {t.paciente_nome}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                        Salão {t.paciente_salao || '—'} · T{t.paciente_turno || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)' }}>{t.capilar_anterior}</span>
                        <span style={{ margin: '0 0.35rem', color: 'var(--text-muted)' }}>→</span>
                        <span style={{ fontWeight: 700, color: '#06b6d4' }}>{t.capilar_novo}</span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: ehLimite ? '#ecfdf5' : '#fffbeb',
                            color: ehLimite ? '#059669' : '#d97706',
                            fontSize: '0.78rem'
                          }}
                        >
                          {t.reuso_no_momento || 0} usos
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>
                          {ehLimite ? 'Limite 20 Usos' : 'Descarte Precoce'}
                        </div>
                        {t.motivo_detalhe && (
                          <div style={{ fontSize: '0.72rem', color: '#dc2626' }}>
                            {t.motivo_detalhe}
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                        {t.lote_novo || '—'}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                        {t.operador || '—'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
