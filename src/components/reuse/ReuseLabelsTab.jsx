import React, { useState, useEffect } from 'react';
import { Printer, Copy, Check, Search, QrCode, FileText, CheckSquare, Square } from 'lucide-react';
import QRCode from 'qrcode';
import {
  formatarDataBr,
  gerarZplEtiquetaCapilar,
  estilosEtiqueta,
  SOROLOGIA_ETIQUETA,
  TAMANHO_ETIQUETA_PADRAO
} from '../../utils/reuseLabels';
import { calcularPrimeFinal, SALOES, TURNOS, ESCALAS } from '../../utils/reuseRules';

export default function ReuseLabelsTab({ pacientes = [] }) {
  const [selecionados, setSelecionados] = useState([]);
  const [primeInicial, setPrimeInicial] = useState('115');
  const [dataPrimeiroUso, setDataPrimeiroUso] = useState(new Date().toISOString().split('T')[0]);
  const [busca, setBusca] = useState('');
  const [escalaFiltro, setEscalaFiltro] = useState('TODOS');
  const [salaoFiltro, setSalaoFiltro] = useState('TODOS');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');
  const [copiadoZpl, setCopiadoZpl] = useState(false);
  const [qrCodeUrls, setQrCodeUrls] = useState({});

  const primeFinal = calcularPrimeFinal(primeInicial);

  const filtrados = pacientes.filter((p) => {
    if (escalaFiltro !== 'TODOS' && p.escala !== escalaFiltro) return false;
    if (salaoFiltro !== 'TODOS' && String(p.salao) !== salaoFiltro) return false;
    if (turnoFiltro !== 'TODOS' && String(p.turno) !== turnoFiltro) return false;
    if (busca) {
      const b = busca.toLowerCase();
      return (
        (p.nome || '').toLowerCase().includes(b) ||
        (p.cpf || '').replace(/\D/g, '').includes(b.replace(/\D/g, '')) ||
        (p.capilar || '').toLowerCase().includes(b)
      );
    }
    return true;
  });

  // Gera QR Codes para os pacientes exibidos (SM-010)
  useEffect(() => {
    const gerarQrs = async () => {
      const mapas = {};
      for (const p of filtrados) {
        try {
          const payload = JSON.stringify({
            id: p.id,
            nome: p.nome,
            capilar: p.capilar,
            reuso: p.reuso_atual || 0
          });
          mapas[p.id] = await QRCode.toDataURL(payload, { width: 90, margin: 1 });
        } catch (e) {
          console.error(e);
        }
      }
      setQrCodeUrls(mapas);
    };
    gerarQrs();
  }, [filtrados]);

  const toggleSelecionar = (id) => {
    setSelecionados((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const selecionarTodos = () => {
    if (selecionados.length === filtrados.length) {
      setSelecionados([]);
    } else {
      setSelecionados(filtrados.map((p) => p.id));
    }
  };

  const pacientesParaImpressao = filtrados.filter((p) =>
    selecionados.length > 0 ? selecionados.includes(p.id) : true
  );

  // Impressão via navegador
  const handleImprimirHtml = () => {
    window.print();
  };

  // Cópia de ZPL para impressora Zebra
  const handleCopiarZpl = () => {
    const zplTotal = pacientesParaImpressao
      .map((p) =>
        gerarZplEtiquetaCapilar(p, {
          primeInicial,
          primeFinal,
          dataPrimeiroUso,
          tamanhoMM: TAMANHO_ETIQUETA_PADRAO
        })
      )
      .join('\n');

    navigator.clipboard.writeText(zplTotal);
    setCopiadoZpl(true);
    setTimeout(() => setCopiadoZpl(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Injeta CSS específico para impressão */}
      <style>{estilosEtiqueta(TAMANHO_ETIQUETA_PADRAO)}</style>

      {/* Painel de Configuração e Parâmetros */}
      <div
        style={{
          backgroundColor: 'var(--card-bg, #ffffff)',
          border: '1px solid var(--border-color, #e2e8f0)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--text-secondary, #64748b)' }}>
              Prime Inicial (mL)
            </label>
            <input
              type="number"
              value={primeInicial}
              onChange={(e) => setPrimeInicial(e.target.value)}
              style={{
                width: '120px',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-color, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 700
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--text-secondary, #64748b)' }}>
              Prime Final (80%)
            </label>
            <div
              style={{
                width: '120px',
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-color, #f1f5f9)',
                color: '#0891b2',
                fontSize: '0.85rem',
                fontWeight: 800,
                border: '1px solid var(--border-color, #e2e8f0)'
              }}
            >
              {primeFinal} mL
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem', color: 'var(--text-secondary, #64748b)' }}>
              Data 1º Uso
            </label>
            <input
              type="date"
              value={dataPrimeiroUso}
              onChange={(e) => setDataPrimeiroUso(e.target.value)}
              style={{
                padding: '0.45rem 0.65rem',
                borderRadius: '8px',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-color, #f8fafc)',
                color: 'var(--text-primary, #0f172a)',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button
            onClick={handleCopiarZpl}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1rem',
              borderRadius: '8px',
              border: '1px solid var(--border-color, #cbd5e1)',
              backgroundColor: 'var(--bg-color, #f8fafc)',
              color: 'var(--text-primary, #0f172a)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {copiadoZpl ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
            {copiadoZpl ? 'Copiado!' : 'ZPL'}
          </button>

          <button
            onClick={handleImprimirHtml}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.55rem 1.1rem',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: '#06b6d4',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <Printer size={16} />
            Imprimir ({pacientesParaImpressao.length})
          </button>
        </div>
      </div>

      {/* Barra de Filtros e Seleção em Lote */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            onClick={selecionarTodos}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-primary, #0f172a)',
              fontWeight: 600,
              fontSize: '0.82rem'
            }}
          >
            {selecionados.length === filtrados.length && filtrados.length > 0 ? (
              <CheckSquare size={18} color="#06b6d4" />
            ) : (
              <Square size={18} color="var(--text-muted)" />
            )}
            <span>{selecionados.length > 0 ? `${selecionados.length} selecionado(s)` : 'Marcar Todos'}</span>
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.6rem', flex: 1, maxWidth: '650px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <select
            value={escalaFiltro}
            onChange={(e) => setEscalaFiltro(e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
          >
            <option value="TODOS">Todas Escalas</option>
            {ESCALAS.map((e) => (
              <option key={e.valor} value={e.valor}>{e.curto}</option>
            ))}
          </select>

          <select
            value={salaoFiltro}
            onChange={(e) => setSalaoFiltro(e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
          >
            <option value="TODOS">Todos Salões</option>
            {SALOES.map((s) => (
              <option key={s} value={String(s)}>Salão {s}</option>
            ))}
          </select>

          <select
            value={turnoFiltro}
            onChange={(e) => setTurnoFiltro(e.target.value)}
            style={{ padding: '0.45rem', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
          >
            <option value="TODOS">Todos Turnos</option>
            {TURNOS.map((t) => (
              <option key={t} value={String(t)}>Turno {t}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grade de Pré-visualização das Etiquetas com QR Code (SM-010) */}
      <div
        className="area-impressao-etiquetas"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '1rem'
        }}
      >
        {pacientesParaImpressao.map((p) => {
          const isSelected = selecionados.includes(p.id);
          const qrUrl = qrCodeUrls[p.id];

          return (
            <div
              key={p.id}
              className="etiqueta-capilar-card"
              onClick={() => toggleSelecionar(p.id)}
              style={{
                cursor: 'pointer',
                backgroundColor: '#ffffff',
                border: isSelected ? '2px solid #06b6d4' : '1px dashed #cbd5e1',
                borderRadius: '8px',
                padding: '10px 14px',
                boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: '0.98rem', color: '#000', textTransform: 'uppercase', lineHeight: 1.1 }}>
                    {p.nome}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#334155', marginTop: '2px' }}>
                    DATA NASCIMENTO: {formatarDataBr(p.data_nascimento)}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#475569' }}>
                    MÃE: {p.nome_mae || '—'}
                  </div>
                </div>

                {/* QR Code na Etiqueta (SM-010) */}
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="QR"
                    style={{ width: '48px', height: '48px', marginLeft: '8px', flexShrink: 0 }}
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#000' }}>
                  <div>PI: {primeInicial}</div>
                  <div>PF: {primeFinal}</div>
                </div>

                <div style={{ fontSize: '0.72rem', color: '#334155', lineHeight: 1.2 }}>
                  {SOROLOGIA_ETIQUETA.map((s) => (
                    <div key={s}>{s}</div>
                  ))}
                </div>

                <div
                  style={{
                    fontSize: '1.1rem',
                    fontWeight: 900,
                    color: '#0891b2',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#ecfeff',
                    border: '1px solid #a5f3fc'
                  }}
                >
                  {p.capilar}
                </div>
              </div>

              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#000', borderTop: '1px solid #e2e8f0', paddingTop: '4px', display: 'flex', justifyContent: 'space-between' }}>
                <span>DATA 1º USO: {formatarDataBr(dataPrimeiroUso)}</span>
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>Salão {p.salao} · T{p.turno}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
