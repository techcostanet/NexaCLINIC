import React, { useState } from 'react';
import { LayoutGrid, User, AlertTriangle, AlertOctagon, CheckCircle2 } from 'lucide-react';
import {
  SALOES,
  TURNOS,
  ESCALAS,
  BOXES,
  POSICOES_BOX,
  MAX_REUSO,
  statusReuso
} from '../../utils/reuseRules';

export default function ReuseMapTab({ pacientes = [], onAbrirTroca }) {
  const [escala, setEscala] = useState('SEG_QUA_SEX');
  const [salao, setSalao] = useState(1);
  const [turno, setTurno] = useState(1);

  // Mapeia pacientes nos boxes e posições correspondentes
  const mapaLeitos = {};
  pacientes
    .filter((p) => p.escala === escala && Number(p.salao) === Number(salao) && Number(p.turno) === Number(turno))
    .forEach((p) => {
      const chave = `${p.box || 1}-${p.posicao || 1}`;
      mapaLeitos[chave] = p;
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Controles de Salão, Turno e Escala */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <LayoutGrid size={18} color="#06b6d4" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>
            Mapa de Boxes e Poltronas de Diálise
          </span>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
          <select
            value={escala}
            onChange={(e) => setEscala(e.target.value)}
            style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            {ESCALAS.map((e) => (
              <option key={e.valor} value={e.valor}>{e.curto}</option>
            ))}
          </select>

          <select
            value={salao}
            onChange={(e) => setSalao(Number(e.target.value))}
            style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            {SALOES.map((s) => (
              <option key={s} value={s}>Salão {s}</option>
            ))}
          </select>

          <select
            value={turno}
            onChange={(e) => setTurno(Number(e.target.value))}
            style={{ padding: '0.45rem 0.65rem', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
          >
            {TURNOS.map((t) => (
              <option key={t} value={t}>Turno {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legenda Visual */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#10b981' }} />
          <span>Normal (&lt; 18 usos)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#f59e0b' }} />
          <span>Atenção (18-19 usos)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#ef4444' }} />
          <span>Crítico (20 usos)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: '#cbd5e1' }} />
          <span>Disponível</span>
        </div>
      </div>

      {/* Grade de 8 Boxes */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem'
        }}
      >
        {BOXES.map((b) => (
          <div
            key={b}
            style={{
              backgroundColor: 'var(--card-bg, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              borderRadius: '14px',
              padding: '1rem',
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid var(--border-color, #e2e8f0)',
                paddingBottom: '0.5rem',
                marginBottom: '0.75rem'
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-primary, #0f172a)' }}>
                Box {b}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)' }}>
                4 Posições
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              {POSICOES_BOX.map((p) => {
                const paciente = mapaLeitos[`${b}-${p}`];
                const r = Number(paciente?.reuso_atual) || 0;
                const st = paciente ? statusReuso(r) : 'LIVRE';

                const borderCor =
                  st === 'CRITICO' ? '#ef4444' : st === 'ATENCAO' ? '#f59e0b' : st === 'NORMAL' ? '#10b981' : 'var(--border-color, #cbd5e1)';
                const bgCor =
                  st === 'CRITICO' ? '#fef2f2' : st === 'ATENCAO' ? '#fffbeb' : st === 'NORMAL' ? '#ecfdf5' : 'var(--bg-color, #f8fafc)';

                return (
                  <div
                    key={p}
                    style={{
                      border: `1px solid ${borderCor}`,
                      backgroundColor: bgCor,
                      borderRadius: '8px',
                      padding: '0.6rem',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      minHeight: '75px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-secondary, #64748b)' }}>
                        P{p}
                      </span>
                      {paciente && (
                        <span
                          style={{
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            color: borderCor
                          }}
                        >
                          {r}/{MAX_REUSO}
                        </span>
                      )}
                    </div>

                    {paciente ? (
                      <div>
                        <div
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            color: 'var(--text-primary, #0f172a)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          title={paciente.nome}
                        >
                          {paciente.nome}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.2rem' }}>
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#0891b2' }}>
                            {paciente.capilar}
                          </span>
                          <button
                            onClick={() => onAbrirTroca(paciente)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: '0.68rem',
                              color: '#0891b2',
                              fontWeight: 700,
                              cursor: 'pointer',
                              padding: 0,
                              textDecoration: 'underline'
                            }}
                          >
                            Trocar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontStyle: 'italic', marginTop: '0.5rem' }}>
                        Disponível
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
