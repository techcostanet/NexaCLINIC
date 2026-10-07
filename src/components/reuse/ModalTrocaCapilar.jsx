import React, { useState } from 'react';
import { MAX_REUSO, MOTIVOS_DESCARTE, OPCOES_CAPILAR, capilarAposTroca } from '../../utils/reuseRules';
import { AlertTriangle, RefreshCw, X } from 'lucide-react';

export default function ModalTrocaCapilar({ paciente, onConfirmar, onFechar }) {
  const reusoAtual = Number(paciente?.reuso_atual) || 0;
  const noLimitePadrao = reusoAtual >= MAX_REUSO;

  const [noLimite, setNoLimite] = useState(noLimitePadrao);
  const [motivoDescarte, setMotivoDescarte] = useState(MOTIVOS_DESCARTE[0]);
  const [detalheOutro, setDetalheOutro] = useState('');
  const [loteNovo, setLoteNovo] = useState('');
  const [capilarNovo, setCapilarNovo] = useState(capilarAposTroca(paciente));
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!noLimite && motivoDescarte === 'Outro' && !detalheOutro.trim()) {
      setErro('Informe a justificativa do descarte.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      await onConfirmar({
        motivo: noLimite ? 'LIMITE_20_USOS' : 'DESPREZADO_MANUAL',
        motivo_detalhe: noLimite ? null : (motivoDescarte === 'Outro' ? detalheOutro.trim() : motivoDescarte),
        lote_novo: loteNovo.trim() || null,
        capilar_novo: capilarNovo,
      });
      onFechar();
    } catch (err) {
      setErro(err?.message || 'Falha ao processar troca de capilar.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem'
      }}
      onClick={onFechar}
    >
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '520px',
          padding: '1.5rem',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
          color: 'var(--text-primary, #0f172a)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: noLimite ? '#ecfdf5' : '#fef2f2',
                color: noLimite ? '#059669' : '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={20} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 700 }}>Trocar Capilar</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary, #64748b)' }}>
                {paciente?.nome}
              </p>
            </div>
          </div>
          <button
            onClick={onFechar}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #94a3b8)',
              padding: '0.25rem'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Resumo do Capilar Atual */}
        <div
          style={{
            backgroundColor: 'var(--bg-color, #f8fafc)',
            border: '1px solid var(--border-color, #e2e8f0)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Modelo</span>
            <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{paciente?.capilar || '—'}</span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Ciclos</span>
            <span
              style={{
                fontWeight: 800,
                fontSize: '0.95rem',
                color: reusoAtual >= MAX_REUSO ? '#ef4444' : reusoAtual >= 18 ? '#f59e0b' : '#10b981'
              }}
            >
              {reusoAtual} de {MAX_REUSO}
            </span>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #64748b)', display: 'block' }}>Salão</span>
            <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Salão {paciente?.salao} · T{paciente?.turno}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-secondary, #64748b)' }}>
              Motivo
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
              <button
                type="button"
                onClick={() => setNoLimite(true)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: noLimite ? '2px solid #06b6d4' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: noLimite ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-color, #f8fafc)',
                  color: noLimite ? '#0891b2' : 'var(--text-secondary, #64748b)',
                  textAlign: 'center'
                }}
              >
                Limite 20 Usos
              </button>
              <button
                type="button"
                onClick={() => setNoLimite(false)}
                style={{
                  padding: '0.65rem 0.75rem',
                  borderRadius: '8px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: !noLimite ? '2px solid #ef4444' : '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: !noLimite ? 'rgba(239, 68, 68, 0.1)' : 'var(--bg-color, #f8fafc)',
                  color: !noLimite ? '#dc2626' : 'var(--text-secondary, #64748b)',
                  textAlign: 'center'
                }}
              >
                Descarte Precoce
              </button>
            </div>
          </div>

          {!noLimite && (
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-secondary, #64748b)' }}>
                Justificativa
              </label>
              <select
                value={motivoDescarte}
                onChange={(e) => setMotivoDescarte(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-color, #f8fafc)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.85rem'
                }}
              >
                {MOTIVOS_DESCARTE.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>

              {motivoDescarte === 'Outro' && (
                <input
                  type="text"
                  placeholder="Descreva o motivo clínico..."
                  value={detalheOutro}
                  onChange={(e) => setDetalheOutro(e.target.value)}
                  style={{
                    width: '100%',
                    marginTop: '0.5rem',
                    padding: '0.6rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color, #cbd5e1)',
                    backgroundColor: 'var(--bg-color, #f8fafc)',
                    color: 'var(--text-primary, #0f172a)',
                    fontSize: '0.85rem'
                  }}
                />
              )}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-secondary, #64748b)' }}>
                Novo Capilar
              </label>
              <select
                value={capilarNovo}
                onChange={(e) => setCapilarNovo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-color, #f8fafc)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.85rem',
                  fontWeight: 600
                }}
              >
                {OPCOES_CAPILAR.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.4rem', color: 'var(--text-secondary, #64748b)' }}>
                Lote
              </label>
              <input
                type="text"
                placeholder="Ex: LT-2026-001"
                value={loteNovo}
                onChange={(e) => setLoteNovo(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem',
                  borderRadius: '8px',
                  border: '1px solid var(--border-color, #cbd5e1)',
                  backgroundColor: 'var(--bg-color, #f8fafc)',
                  color: 'var(--text-primary, #0f172a)',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          {erro && (
            <div
              style={{
                padding: '0.6rem 0.8rem',
                borderRadius: '8px',
                backgroundColor: '#fef2f2',
                color: '#dc2626',
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <AlertTriangle size={16} />
              <span>{erro}</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onFechar}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'transparent',
                color: 'var(--text-secondary, #64748b)',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={enviando}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#06b6d4',
                color: '#ffffff',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
                opacity: enviando ? 0.7 : 1
              }}
            >
              {enviando ? 'Gravando...' : 'Confirmar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
