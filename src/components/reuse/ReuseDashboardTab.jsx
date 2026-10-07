import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ScanBarcode,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Printer,
  AlertTriangle,
  UserCheck,
  AlertOctagon,
  Clock
} from 'lucide-react';
import { MAX_REUSO, LIMIAR_ATENCAO, statusReuso, SALOES, TURNOS, ESCALAS } from '../../utils/reuseRules';

export default function ReuseDashboardTab({
  pacientes = [],
  onPresenca,
  onFalta,
  onAbrirTroca,
  onImprimirEtiqueta,
  currentUser
}) {
  const [escalaFiltro, setEscalaFiltro] = useState('TODOS');
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');
  const [busca, setBusca] = useState('');
  const [codigoBipado, setCodigoBipado] = useState('');
  const [pacienteDestaqueId, setPacienteDestaqueId] = useState(null);
  const [mensagemScanner, setMensagemScanner] = useState('');

  const barcodeInputRef = useRef(null);

  // Manipulador do leitor de código de barras / QR Code (SM-010)
  const handleScanSubmit = (e) => {
    e.preventDefault();
    const termo = codigoBipado.trim().toLowerCase();
    if (!termo) return;

    // Busca por ID, CPF ou Nome
    const encontrado = pacientes.find((p) => {
      const matchId = (p.id || '').toLowerCase() === termo;
      const matchCpf = (p.cpf || '').replace(/\D/g, '') === termo.replace(/\D/g, '');
      const matchNome = (p.nome || '').toLowerCase().includes(termo);
      return matchId || matchCpf || matchNome;
    });

    if (encontrado) {
      setPacienteDestaqueId(encontrado.id);
      setMensagemScanner(`Dialisador identificado: ${encontrado.nome} (${encontrado.capilar} · ${encontrado.reuso_atual}/${MAX_REUSO})`);
      setCodigoBipado('');
      setTimeout(() => setPacienteDestaqueId(null), 5000);
    } else {
      setMensagemScanner('Código não localizado no cadastro de reuso.');
      setTimeout(() => setMensagemScanner(''), 4000);
    }
  };

  // Filtragem dos pacientes
  const filtrados = pacientes.filter((p) => {
    if (escalaFiltro !== 'TODOS' && p.escala !== escalaFiltro) return false;
    if (salaoFiltro !== 'TODOS' && String(p.salao) !== salaoFiltro) return false;
    if (turnoFiltro !== 'TODOS' && String(p.turno) !== turnoFiltro) return false;
    if (busca) {
      const b = busca.toLowerCase();
      const matchNome = (p.nome || '').toLowerCase().includes(b);
      const matchCpf = (p.cpf || '').replace(/\D/g, '').includes(b.replace(/\D/g, ''));
      const matchCapilar = (p.capilar || '').toLowerCase().includes(b);
      if (!matchNome && !matchCpf && !matchCapilar) return false;
    }
    return true;
  });

  // KPIs
  const totalPacientes = filtrados.length;
  const totalAtencao = filtrados.filter((p) => (p.reuso_atual || 0) >= LIMIAR_ATENCAO && (p.reuso_atual || 0) < MAX_REUSO).length;
  const totalCritico = filtrados.filter((p) => (p.reuso_atual || 0) >= MAX_REUSO).length;
  const totalNormais = totalPacientes - totalAtencao - totalCritico;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Barra de Leitura Rápida de Bancada (SM-010) */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: '280px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#ecfeff',
              color: '#0891b2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ScanBarcode size={22} />
          </div>
          <form onSubmit={handleScanSubmit} style={{ display: 'flex', flex: 1, gap: '0.5rem' }}>
            <input
              ref={barcodeInputRef}
              type="text"
              placeholder="Escanear Código de Barras / QR Code na Bancada..."
              value={codigoBipado}
              onChange={(e) => setCodigoBipado(e.target.value)}
              style={{
                flex: 1,
                padding: '0.55rem 0.85rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-color, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              style={{
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#06b6d4',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Bipar
            </button>
          </form>
        </div>

        {mensagemScanner && (
          <div
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              backgroundColor: mensagemScanner.includes('não localizado') ? '#fef2f2' : '#ecfdf5',
              color: mensagemScanner.includes('não localizado') ? '#dc2626' : '#059669',
              fontSize: '0.8rem',
              fontWeight: 600
            }}
          >
            {mensagemScanner}
          </div>
        )}
      </div>

      {/* Cartões de Indicadores Rápidos */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
          gap: '0.85rem'
        }}
      >
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <UserCheck size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Pacientes
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary, #0f172a)' }}>
              {totalPacientes}
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#ecfdf5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Normais
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#059669' }}>
              {totalNormais}
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Atenção
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#d97706' }}>
              {totalAtencao}
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
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <AlertOctagon size={20} />
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', fontWeight: 600, textTransform: 'uppercase' }}>
              Crítico
            </span>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#dc2626' }}>
              {totalCritico}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros Padronizada */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '12px',
          padding: '0.75rem 1rem',
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
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
            placeholder="Filtrar por paciente, CPF ou capilar..."
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
          value={escalaFiltro}
          onChange={(e) => setEscalaFiltro(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #cbd5e1)',
            backgroundColor: 'var(--bg-color, #f8fafc)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '0.82rem',
            fontWeight: 500
          }}
        >
          <option value="TODOS">Todas Escalas</option>
          {ESCALAS.map((e) => (
            <option key={e.valor} value={e.valor}>{e.curto}</option>
          ))}
        </select>

        <select
          value={salaoFiltro}
          onChange={(e) => setSalaoFiltro(e.target.value)}
          style={{
            padding: '0.5rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid var(--border-color, #cbd5e1)',
            backgroundColor: 'var(--bg-color, #f8fafc)',
            color: 'var(--text-primary, #0f172a)',
            fontSize: '0.82rem',
            fontWeight: 500
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
            fontSize: '0.82rem',
            fontWeight: 500
          }}
        >
          <option value="TODOS">Todos Turnos</option>
          {TURNOS.map((t) => (
            <option key={t} value={String(t)}>Turno {t}</option>
          ))}
        </select>
      </div>

      {/* Tabela de Pacientes e Contador de Reuso */}
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
                <th style={{ padding: '0.85rem 1rem' }}>Paciente</th>
                <th style={{ padding: '0.85rem 1rem' }}>Escala</th>
                <th style={{ padding: '0.85rem 1rem' }}>Local</th>
                <th style={{ padding: '0.85rem 1rem' }}>Capilar</th>
                <th style={{ padding: '0.85rem 1rem', width: '220px' }}>Reuso</th>
                <th style={{ padding: '0.85rem 1rem' }}>Prime</th>
                <th style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary, #64748b)' }}>
                    Nenhum paciente localizado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filtrados.map((p) => {
                  const r = Number(p.reuso_atual) || 0;
                  const st = statusReuso(r);
                  const isHighlighted = pacienteDestaqueId === p.id;

                  const badgeColor =
                    st === 'CRITICO' ? '#ef4444' : st === 'ATENCAO' ? '#f59e0b' : '#10b981';
                  const badgeBg =
                    st === 'CRITICO' ? '#fef2f2' : st === 'ATENCAO' ? '#fffbeb' : '#ecfdf5';

                  const pct = Math.min(100, Math.round((r / MAX_REUSO) * 100));

                  return (
                    <tr
                      key={p.id}
                      style={{
                        borderBottom: '1px solid var(--border-color, #e2e8f0)',
                        backgroundColor: isHighlighted ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                        transition: 'background-color 0.2s'
                      }}
                    >
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary, #0f172a)' }}>{p.nome}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>
                          {p.cpf ? `CPF: ${p.cpf}` : `ID: ${p.id}`}
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            backgroundColor: 'var(--bg-color, #f1f5f9)',
                            color: 'var(--text-secondary, #475569)'
                          }}
                        >
                          {p.escala === 'SEG_QUA_SEX' ? 'Seg/Qua/Sex' : 'Ter/Qui/Sáb'}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontWeight: 600 }}>Salão {p.salao} · T{p.turno}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)' }}>
                          Box {p.box} (Pos {p.posicao})
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.25rem 0.6rem',
                            borderRadius: '6px',
                            backgroundColor: '#06b6d4',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: '0.78rem'
                          }}
                        >
                          {p.capilar}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              color: badgeColor,
                              backgroundColor: badgeBg,
                              padding: '0.15rem 0.5rem',
                              borderRadius: '12px'
                            }}
                          >
                            {r} / {MAX_REUSO} usos
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted, #94a3b8)', fontWeight: 600 }}>
                            {pct}%
                          </span>
                        </div>
                        <div
                          style={{
                            width: '100%',
                            height: '6px',
                            borderRadius: '3px',
                            backgroundColor: 'var(--border-color, #e2e8f0)',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${pct}%`,
                              height: '100%',
                              backgroundColor: badgeColor,
                              transition: 'width 0.3s ease'
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          PI: {p.prime_inicial || '—'} mL
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary, #64748b)' }}>
                          PF: {p.prime_final || '—'} mL
                        </div>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', textAlign: 'right', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            title="Registrar Presença (+1 uso)"
                            disabled={r >= MAX_REUSO}
                            onClick={() => onPresenca(p.id)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid #10b981',
                              backgroundColor: r >= MAX_REUSO ? '#f1f5f9' : '#ecfdf5',
                              color: r >= MAX_REUSO ? '#94a3b8' : '#059669',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: r >= MAX_REUSO ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <CheckCircle2 size={14} />
                            Presença
                          </button>

                          <button
                            title="Registrar Falta (-1 uso)"
                            disabled={r <= 0}
                            onClick={() => onFalta(p.id)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #cbd5e1)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary, #64748b)',
                              fontSize: '0.75rem',
                              fontWeight: 600,
                              cursor: r <= 0 ? 'not-allowed' : 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <XCircle size={14} />
                            Falta
                          </button>

                          <button
                            title="Trocar Capilar"
                            onClick={() => onAbrirTroca(p)}
                            style={{
                              padding: '0.4rem 0.65rem',
                              borderRadius: '6px',
                              border: 'none',
                              backgroundColor: r >= MAX_REUSO ? '#ef4444' : '#06b6d4',
                              color: '#fff',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                          >
                            <RefreshCw size={14} />
                            Trocar
                          </button>

                          <button
                            title="Imprimir Etiqueta Térmica"
                            onClick={() => onImprimirEtiqueta(p)}
                            style={{
                              padding: '0.4rem 0.55rem',
                              borderRadius: '6px',
                              border: '1px solid var(--border-color, #cbd5e1)',
                              backgroundColor: 'transparent',
                              color: 'var(--text-secondary, #64748b)',
                              fontSize: '0.75rem',
                              cursor: 'pointer'
                            }}
                          >
                            <Printer size={15} />
                          </button>
                        </div>
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
