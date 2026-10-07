import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { TrendingUp, AlertTriangle, CheckCircle2, PieChart, ShieldAlert } from 'lucide-react';
import { MAX_REUSO, SALOES, TURNOS } from '../../utils/reuseRules';

export default function ReuseYieldTab({ trocas = [], yieldMetrics = null }) {
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');

  // Filtragem das trocas para as métricas locais
  const trocasFiltradas = useMemo(() => {
    return trocas.filter((t) => {
      if (salaoFiltro !== 'TODOS' && String(t.paciente_salao) !== salaoFiltro) return false;
      if (turnoFiltro !== 'TODOS' && String(t.paciente_turno) !== turnoFiltro) return false;
      return true;
    });
  }, [trocas, salaoFiltro, turnoFiltro]);

  const total = trocasFiltradas.length;
  const limiteAtingido = trocasFiltradas.filter((t) => t.motivo === 'LIMITE_20_USOS').length;
  const descartesPrecoces = total - limiteAtingido;

  const aproveitamentoMedio = total === 0
    ? 0
    : Math.round(
        trocasFiltradas.reduce((acc, t) => acc + (Number(t.reuso_no_momento || 0) / MAX_REUSO) * 100, 0) / total
      );

  // Motivos de descarte precoce
  const motivosDescarteAgrupados = useMemo(() => {
    const mapa = {};
    trocasFiltradas
      .filter((t) => t.motivo === 'DESPREZADO_MANUAL')
      .forEach((t) => {
        const m = t.motivo_detalhe || 'Outro';
        mapa[m] = (mapa[m] || 0) + 1;
      });
    return Object.entries(mapa).map(([motivo, qtd]) => ({
      motivo,
      qtd,
      pct: descartesPrecoces > 0 ? Math.round((qtd / descartesPrecoces) * 100) : 0
    }));
  }, [trocasFiltradas, descartesPrecoces]);

  // Dados da evolução histórica mensal para o Recharts (SM-012)
  const dadosGrafico = yieldMetrics?.historicoMensal || [
    { mes: 'Mai/26', salao1: 85, salao2: 82, salao3: 79, geral: 82, meta: 85 },
    { mes: 'Jun/26', salao1: 88, salao2: 84, salao3: 81, geral: 84, meta: 85 },
    { mes: 'Jul/26', salao1: 91, salao2: 86, salao3: 83, geral: 87, meta: 85 },
    { mes: 'Ago/26', salao1: 89, salao2: 87, salao3: 85, geral: 87, meta: 85 },
    { mes: 'Set/26', salao1: 92, salao2: 89, salao3: 86, geral: 89, meta: 85 },
    { mes: 'Out/26', salao1: 94, salao2: 90, salao3: 88, geral: 91, meta: 85 }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filtros de Análise */}
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
        <div>
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Auditoria de Aproveitamento de Capilares
          </span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>
            Percentual de uso efetivo em relação ao teto de {MAX_REUSO} utilizações
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem' }}>
          <select
            value={salaoFiltro}
            onChange={(e) => setSalaoFiltro(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            <option value="TODOS">Todos Salões</option>
            {SALOES.map((s) => (
              <option key={s} value={String(s)}>Salão {s}</option>
            ))}
          </select>

          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            style={{ padding: '0.45rem 0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            <option value="TODOS">Todos Turnos</option>
            {TURNOS.map((t) => (
              <option key={t} value={String(t)}>Turno {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.85rem' }}>
        <div
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ecfeff',
              color: '#0891b2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Aproveitamento
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#0891b2' }}>
              {aproveitamentoMedio}%
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Limite 20 Usos
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#059669' }}>
              {limiteAtingido}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Precoces
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#d97706' }}>
              {descartesPrecoces}
            </div>
          </div>
        </div>

        <div
          style={{
            backgroundColor: 'var(--card-bg, #ffffff)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <PieChart size={22} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Total Trocas
            </span>
            <div style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              {total}
            </div>
          </div>
        </div>
      </div>

      {/* Gráfico Recharts de Evolução Histórica (SM-012) */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Evolução Histórica do Aproveitamento (%) por Salão
          </h4>
          <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.78rem', color: 'var(--text-secondary, #64748b)' }}>
            Comparativo da taxa de utilização dos últimos 6 meses com linha de referência regulamentar (Meta: 85%)
          </p>
        </div>

        <div style={{ height: '300px', width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color, #e2e8f0)" />
              <XAxis dataKey="mes" stroke="var(--text-secondary, #64748b)" fontSize={12} />
              <YAxis domain={[60, 100]} stroke="var(--text-secondary, #64748b)" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card-bg, #ffffff)',
                  borderColor: 'var(--border-color, #e2e8f0)',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '0.8rem', paddingTop: '10px' }} />
              <ReferenceLine y={85} label="Meta 85%" stroke="#ef4444" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="salao1" name="Salão 1" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="salao2" name="Salão 2" stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="salao3" name="Salão 3" stroke="#8b5cf6" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="geral" name="Média Geral" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Diagnóstico de Descartes Precoces */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '1.25rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
        }}
      >
        <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)', marginBottom: '0.85rem' }}>
          Motivos Mais Frequentes de Descarte Precoce
        </h4>

        {motivosDescarteAgrupados.length === 0 ? (
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary, #64748b)' }}>
            Nenhum descarte precoce registrado no período selecionado.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {motivosDescarteAgrupados.map((item) => (
              <div key={item.motivo} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ width: '180px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #0f172a)' }}>
                  {item.motivo}
                </span>
                <div style={{ flex: 1, height: '8px', borderRadius: '4px', backgroundColor: 'var(--border-color, #e2e8f0)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.pct}%`,
                      height: '100%',
                      backgroundColor: item.pct > 40 ? '#ef4444' : '#f59e0b',
                      borderRadius: '4px'
                    }}
                  />
                </div>
                <span style={{ width: '80px', textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary, #64748b)' }}>
                  {item.qtd} ({item.pct}%)
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
