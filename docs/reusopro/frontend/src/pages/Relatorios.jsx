import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatarData, hojeISO, somarDias } from '../utils/datas';

export default function Relatorios() {
  const [relatorios, setRelatorios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [gerandoManual, setGerandoManual] = useState(false);
  const { isAdmin } = useAuth();

  async function carregar() {
    setCarregando(true);
    const { data } = await api.get('/relatorios');
    setRelatorios(data);
    setCarregando(false);
  }

  useEffect(() => {
    carregar();
  }, []);

  async function baixar(relatorio) {
    const response = await api.get(`/relatorios/${relatorio.id}/download`, { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = `relatorio_${relatorio.tipo.toLowerCase()}_${relatorio.periodo_fim}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  }

  // Same window as the automatic weekly job: the last 7 days ending today.
  async function gerarRelatorioSemanaAtual() {
    setGerandoManual(true);
    try {
      const fim = hojeISO();
      await api.post('/relatorios/gerar', { tipo: 'SEMANAL', inicio: somarDias(fim, -6), fim });
      carregar();
    } finally {
      setGerandoManual(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Relatórios</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">
            Gerados automaticamente todo sábado e dia 30 às 23:59
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={gerarRelatorioSemanaAtual}
            disabled={gerandoManual}
            className="px-4 py-2.5 rounded-lg bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-verde-agua-claro)] hover:border-[var(--cor-verde-agua)]/40 transition-colors disabled:opacity-60"
          >
            {gerandoManual ? 'Gerando...' : 'Gerar relatório da semana agora'}
          </button>
        )}
      </div>

      {carregando ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
      ) : relatorios.length === 0 ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">
          Nenhum relatório gerado ainda. Os relatórios automáticos aparecerão aqui após o primeiro sábado ou dia 30.
        </div>
      ) : (
        <div className="space-y-3">
          {relatorios.map((r) => (
            <div
              key={r.id}
              className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl p-4 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--cor-verde-agua-suave)] border border-[var(--cor-verde-agua)]/25 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5eead4" strokeWidth="1.8">
                    <path d="M6 2.5h8l4 4V21a.5.5 0 0 1-.5.5H6.5a.5.5 0 0 1-.5-.5V3a.5.5 0 0 1 .5-.5Z" />
                    <path d="M14 2.5V6a1 1 0 0 0 1 1h3.5" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-[var(--cor-texto-primario)]">
                    Relatório {r.tipo === 'SEMANAL' ? 'Semanal' : 'Mensal'}
                  </p>
                  <p className="text-xs text-[var(--cor-texto-secundario)] mt-0.5">
                    {formatarData(r.periodo_inicio)} a {formatarData(r.periodo_fim)} · {r.total_trocas} troca(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => baixar(r)}
                className="text-sm font-medium text-[var(--cor-verde-agua-claro)] hover:underline shrink-0"
              >
                Baixar PDF
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
