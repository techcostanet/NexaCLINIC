import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { MOTIVO_LABEL, NOMES_ESCALA, NOMES_DIA_SEMANA } from '../utils/regras';
import { formatarData, formatarMomento, dataDoMomento } from '../utils/datas';

// Session dates are plain 'YYYY-MM-DD'; swap times are timestamps.
const apenasData = (valor) => (valor.length === 10 ? valor : dataDoMomento(valor));

export default function PerfilPaciente() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [carregando, setCarregando] = useState(true);
  const [paciente, setPaciente] = useState(null);
  const [historico, setHistorico] = useState([]);
  const [trocas, setTrocas] = useState([]);
  const [aba, setAba] = useState('sessoes');
  const [erro, setErro] = useState('');
  const [trocaExpandidaId, setTrocaExpandidaId] = useState(null);

  // Each swap closes the dialyzer that was in use. That dialyzer's sessions
  // run from the previous swap (exclusive) to this swap (inclusive); the
  // oldest swap has no known start, so it covers everything up to its date.
  const periodosPorTroca = useMemo(() => {
    const ordenadas = [...trocas].sort((a, b) => new Date(a.criado_em) - new Date(b.criado_em));
    const mapa = new Map();
    ordenadas.forEach((t, idx) => {
      mapa.set(t.id, {
        inicio: idx === 0 ? null : ordenadas[idx - 1].criado_em,
        fim: t.criado_em,
      });
    });
    return mapa;
  }, [trocas]);

  function sessoesDoPeriodo(periodo) {
    if (!periodo) return [];
    const fim = apenasData(periodo.fim);
    const inicio = periodo.inicio ? apenasData(periodo.inicio) : null;
    return historico.filter((h) => {
      const d = apenasData(h.data);
      if (d > fim) return false;
      if (inicio && d <= inicio) return false;
      return true;
    });
  }

  const carregarHistorico = useCallback(() => {
    setCarregando(true);
    setErro('');
    api
      .get(`/pacientes/${id}/historico`)
      .then(({ data }) => {
        setPaciente(data.paciente);
        setHistorico(data.historico);
        setTrocas(data.trocas);
      })
      .catch(() => setErro('Não foi possível carregar o perfil do paciente.'))
      .finally(() => setCarregando(false));
  }, [id]);

  useEffect(carregarHistorico, [carregarHistorico]);

  async function removerSessao(item) {
    const rotulo = item.status === 'FALTA' ? 'a falta' : item.extra ? 'a sessão extra' : 'essa sessão';
    if (!window.confirm(`Remover ${rotulo} de ${formatarData(item.data)}? Essa ação não pode ser desfeita.`)) return;
    try {
      await api.delete(`/sessoes/${item.sessao_id}`);
      carregarHistorico();
    } catch (err) {
      window.alert(err.response?.data?.erro || 'Não foi possível remover o lançamento.');
    }
  }

  async function removerTroca(troca) {
    if (
      !window.confirm(
        `Excluir esse registro de troca (${troca.capilar_anterior || '—'} → ${troca.capilar_novo}, ${formatarMomento(troca.criado_em)})? Essa ação não pode ser desfeita e não altera o capilar/reuso atual do paciente.`
      )
    )
      return;
    try {
      await api.delete(`/trocas/${troca.id}`);
      carregarHistorico();
    } catch (err) {
      window.alert(err.response?.data?.erro || 'Não foi possível excluir o registro de troca.');
    }
  }

  if (carregando) {
    return <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando perfil...</div>;
  }

  if (erro || !paciente) {
    return (
      <div>
        <button onClick={() => navigate(-1)} className="text-sm text-[var(--cor-verde-agua-claro)] hover:underline mb-4">
          ← Voltar
        </button>
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
          {erro || 'Paciente não encontrado.'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => navigate(-1)} className="text-sm text-[var(--cor-verde-agua-claro)] hover:underline mb-4">
        ← Voltar
      </button>

      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">{paciente.nome}</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">
            {NOMES_ESCALA[paciente.escala] || paciente.escala} · {paciente.turno}º turno · Salão{' '}
            {paciente.salao || '—'}
            {paciente.dia_extra_fixo !== null && paciente.dia_extra_fixo !== undefined && (
              <> · Extra fixa: {NOMES_DIA_SEMANA[paciente.dia_extra_fixo]}</>
            )}
            {!paciente.ativo && <span className="text-red-400"> · inativo</span>}
          </p>
        </div>
        <Link
          to="/pacientes"
          className="text-xs font-medium px-3 py-2 rounded-lg bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors"
        >
          Editar cadastro
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="p-3.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)]">
          <p className="text-xs text-[var(--cor-texto-terciario)]">Peso</p>
          <p className="fonte-mono text-[var(--cor-texto-primario)]">{Number(paciente.peso_kg)} kg</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)]">
          <p className="text-xs text-[var(--cor-texto-terciario)]">Nascimento</p>
          <p className="fonte-mono text-[var(--cor-texto-primario)]">{formatarData(paciente.data_nascimento)}</p>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)]">
          <p className="text-xs text-[var(--cor-texto-terciario)]">Box</p>
          <p className="fonte-mono text-[var(--cor-texto-primario)]">
            {paciente.box ? `Box ${paciente.box} · Pos. ${paciente.posicao_box}` : 'Não alocado'}
          </p>
        </div>
        <div className="p-3.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)]">
          <p className="text-xs text-[var(--cor-texto-terciario)]">Status</p>
          <p
            className="fonte-mono font-medium"
            style={{
              color:
                paciente.status_visual === 'CRITICO'
                  ? '#f87171'
                  : paciente.status_visual === 'ATENCAO'
                  ? '#fde047'
                  : '#5eead4',
            }}
          >
            {paciente.status_visual}
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-[var(--cor-superficie)] border border-[var(--cor-borda)] mb-5">
        <p className="text-xs font-medium text-[var(--cor-texto-terciario)] uppercase tracking-wide mb-2">
          Capilar ativo
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <p className="text-xs text-[var(--cor-texto-terciario)]">Tipo</p>
            <p className="fonte-mono text-[var(--cor-texto-primario)] font-medium">
              {paciente.capilar_ativo}
              {paciente.capilar_manual && (
                <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/25">
                  exceção
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--cor-texto-terciario)]">Lote</p>
            <p className="fonte-mono text-[var(--cor-texto-primario)]">{paciente.capilar_lote || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-[var(--cor-texto-terciario)]">Primeiro uso desde</p>
            <p className="fonte-mono text-[var(--cor-texto-primario)]">
              {paciente.capilar_desde ? formatarData(paciente.capilar_desde) : '—'}
            </p>
          </div>
          <div>
            <p className="text-xs text-[var(--cor-texto-terciario)]">Número de reusos</p>
            <p className="fonte-mono text-[var(--cor-verde-agua-claro)] font-semibold">{paciente.reuso_atual}/20</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setAba('sessoes')}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
            aba === 'sessoes'
              ? 'bg-[var(--cor-verde-agua)] text-black'
              : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
          }`}
        >
          Sessões ({historico.length})
        </button>
        <button
          onClick={() => setAba('capilares')}
          className={`text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
            aba === 'capilares'
              ? 'bg-[var(--cor-verde-agua)] text-black'
              : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
          }`}
        >
          Capilares anteriores ({trocas.length})
        </button>
      </div>

      {aba === 'sessoes' ? (
        historico.length === 0 ? (
          <div className="text-center py-10 text-[var(--cor-texto-terciario)] text-sm">
            Nenhuma sessão lançada ainda pra esse paciente.
          </div>
        ) : (
          <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[var(--cor-borda)] text-left text-[var(--cor-texto-terciario)]">
                  <th className="px-4 py-3 font-medium">Data</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Reuso</th>
                  <th className="px-4 py-3 font-medium">Capilar</th>
                  <th className="px-4 py-3 font-medium">Registrado por</th>
                  <th className="px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {historico.map((h, idx) => (
                  <tr key={idx} className="border-b border-[var(--cor-borda)] last:border-0">
                    <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-primario)]">{formatarData(h.data)}</td>
                    <td className="px-4 py-3">
                      {h.status === 'REALIZADA' ? (
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            h.extra
                              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/25'
                              : 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
                          }`}
                        >
                          {h.extra ? 'Sessão extra' : 'Realizada'}
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--cor-vermelho-suave)] text-red-400">
                          Falta
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">
                      {h.reuso_no_momento ?? '—'}
                    </td>
                    <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">
                      {h.capilar_no_momento || '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--cor-texto-secundario)]">{h.registrado_por_nome || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => removerSessao(h)}
                        title="Remover esse lançamento (corrige erro de digitação)"
                        className="text-xs font-medium text-[var(--cor-texto-terciario)] hover:text-red-400 transition-colors"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : trocas.length === 0 ? (
        <div className="text-center py-10 text-[var(--cor-texto-terciario)] text-sm">
          Esse paciente ainda não teve nenhum capilar trocado/descartado.
        </div>
      ) : (
        <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead>
              <tr className="border-b border-[var(--cor-borda)] text-left text-[var(--cor-texto-terciario)]">
                <th className="px-4 py-3 font-medium">Data da troca</th>
                <th className="px-4 py-3 font-medium">Capilar</th>
                <th className="px-4 py-3 font-medium">Usos ao trocar</th>
                <th className="px-4 py-3 font-medium">Motivo</th>
                <th className="px-4 py-3 font-medium">Registrado por</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {trocas.map((t) => {
                const expandida = trocaExpandidaId === t.id;
                const sessoesPeriodo = expandida ? sessoesDoPeriodo(periodosPorTroca.get(t.id)) : [];
                return (
                  <React.Fragment key={t.id}>
                    <tr className="border-b border-[var(--cor-borda)] last:border-0 align-top">
                      <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-primario)] whitespace-nowrap">
                        {formatarMomento(t.criado_em)}
                      </td>
                      <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)] whitespace-nowrap">
                        {t.capilar_anterior || '—'} → {t.capilar_novo}
                      </td>
                      <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">{t.reuso_no_momento}</td>
                      <td className="px-4 py-3 text-[var(--cor-texto-secundario)]">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            t.motivo === 'LIMITE_20_USOS'
                              ? 'bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
                              : 'bg-yellow-500/10 text-yellow-400'
                          }`}
                        >
                          {MOTIVO_LABEL[t.motivo] || t.motivo}
                        </span>
                        {t.motivo_detalhe && (
                          <p className="text-xs text-[var(--cor-texto-terciario)] mt-1">{t.motivo_detalhe}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--cor-texto-secundario)] whitespace-nowrap">
                        {t.registrado_por_nome || '—'}
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setTrocaExpandidaId(expandida ? null : t.id)}
                          title="Ver os dias em que o paciente veio ou faltou usando esse capilar"
                          className="text-xs font-medium text-[var(--cor-verde-agua-claro)] hover:underline mr-3"
                        >
                          {expandida ? 'Ocultar sessões' : 'Ver sessões'}
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => removerTroca(t)}
                            title="Excluir esse registro do histórico (apenas admin)"
                            className="text-xs font-medium text-[var(--cor-texto-terciario)] hover:text-red-400 transition-colors"
                          >
                            Excluir
                          </button>
                        )}
                      </td>
                    </tr>
                    {expandida && (
                      <tr className="border-b border-[var(--cor-borda)] last:border-0 bg-[var(--cor-superficie)]">
                        <td colSpan={6} className="px-4 py-3">
                          <p className="text-xs font-medium text-[var(--cor-texto-terciario)] uppercase tracking-wide mb-2">
                            Sessões com o capilar {t.capilar_anterior || '—'}
                          </p>
                          {sessoesPeriodo.length === 0 ? (
                            <p className="text-xs text-[var(--cor-texto-terciario)]">
                              Nenhuma sessão encontrada nesse período.
                            </p>
                          ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              {sessoesPeriodo.map((h, i) => (
                                <div
                                  key={i}
                                  className={`text-xs px-2.5 py-1.5 rounded-lg border ${
                                    h.status === 'FALTA'
                                      ? 'bg-[var(--cor-vermelho-suave)] border-red-500/25 text-red-400'
                                      : 'bg-[var(--cor-verde-agua-suave)] border-[var(--cor-verde-agua)]/25 text-[var(--cor-verde-agua-claro)]'
                                  }`}
                                >
                                  {formatarData(h.data)} —{' '}
                                  {h.status === 'FALTA' ? 'Falta' : h.extra ? 'Sessão extra' : 'Compareceu'}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
