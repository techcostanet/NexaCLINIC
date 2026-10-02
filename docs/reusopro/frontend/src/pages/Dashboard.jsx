import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import api, { mensagemDeErro } from '../services/api';
import PacienteCard from '../components/PacienteCard';
import ModalTrocaCapilar from '../components/ModalTrocaCapilar';
import PainelBuscaPaciente from '../components/PainelBuscaPaciente';
import { NOMES_ESCALA, TURNOS } from '../utils/regras';
import { hojeISO, somarDias, formatarData } from '../utils/datas';

// Daily operation screen. Attendance is recorded automatically each morning;
// here the staff handles exceptions (absences, extra sessions, retroactive
// fixes), swaps dialyzers and follows patients near the reuse limit.
export default function Dashboard() {
  const navigate = useNavigate();
  const [dataSelecionada, setDataSelecionada] = useState(hojeISO());
  const [escala, setEscala] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [pacientesTodos, setPacientesTodos] = useState([]);
  const [lancamentosDoDia, setLancamentosDoDia] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [turnoFiltro, setTurnoFiltro] = useState('TODOS');
  const [buscaPaciente, setBuscaPaciente] = useState('');
  const [todosAbertos, setTodosAbertos] = useState(false);
  const [pacienteParaTroca, setPacienteParaTroca] = useState(null);
  const [enviandoInformativo, setEnviandoInformativo] = useState(false);

  // Manual-entry panels: null | 'PRESENCA' | 'FALTA' | 'EXTRA'
  const [painelAberto, setPainelAberto] = useState(null);
  const [dataPainel, setDataPainel] = useState(hojeISO());
  const [mensagemPainel, setMensagemPainel] = useState('');

  const ehHoje = dataSelecionada === hojeISO();

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { data } = await api.get('/sessoes/hoje', { params: { data: dataSelecionada } });
      setEscala(data.escala);
      setPacientes(data.pacientes);
    } catch {
      setErro('Não foi possível carregar os pacientes do dia.');
    } finally {
      setCarregando(false);
    }
    // Secondary panel: a failure here must not block the dashboard.
    api
      .get('/sessoes/dia', { params: { data: dataSelecionada } })
      .then(({ data }) => setLancamentosDoDia(data.lancamentos))
      .catch(() => setLancamentosDoDia([]));
  }, [dataSelecionada]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    api.get('/pacientes').then(({ data }) => setPacientesTodos(data));
  }, []);

  async function lancar(tipo, pacienteId, data = dataSelecionada) {
    try {
      await api.post(`/sessoes/${pacienteId}/${tipo === 'FALTA' ? 'falta' : 'realizar'}`, { data });
      if (data === dataSelecionada) carregar();
      return true;
    } catch (err) {
      window.alert(mensagemDeErro(err, 'Não foi possível concluir o lançamento.'));
      return false;
    }
  }

  function alternarPainel(painel) {
    setDataPainel(dataSelecionada);
    setMensagemPainel('');
    setPainelAberto((atual) => (atual === painel ? null : painel));
  }

  async function lancarPeloPainel(paciente) {
    if (painelAberto === 'EXTRA') {
      const ok = await lancar('PRESENCA', paciente.id);
      if (ok) setPainelAberto(null);
      return ok;
    }
    const ok = await lancar(painelAberto, paciente.id, dataPainel);
    if (ok) {
      const rotulo = painelAberto === 'FALTA' ? 'Falta' : 'Presença';
      setMensagemPainel(`${rotulo} lançada para ${paciente.nome} em ${formatarData(dataPainel)}.`);
    }
    return ok;
  }

  async function removerLancamento(lancamento) {
    const rotulo = lancamento.tipo === 'FALTA' ? 'a falta' : 'a sessão extra';
    const confirmado = window.confirm(
      `Remover ${rotulo} lançada para ${lancamento.nome} em ${formatarData(dataSelecionada)}? Essa ação não pode ser desfeita.`
    );
    if (!confirmado) return;
    try {
      await api.delete(`/sessoes/${lancamento.sessao_id}`);
      carregar();
    } catch (err) {
      window.alert(mensagemDeErro(err, 'Não foi possível remover o lançamento.'));
    }
  }

  // Opens WhatsApp (wa.me) with today's limit report pre-filled.
  async function enviarInformativoLimites() {
    setEnviandoInformativo(true);
    try {
      const { data } = await api.get('/whatsapp/mensagem-limite-hoje');
      window.open(`https://wa.me/${data.numeroDestino}?text=${encodeURIComponent(data.texto)}`, '_blank');
    } catch (err) {
      window.alert(mensagemDeErro(err, 'Não foi possível montar o informativo de limites.'));
    } finally {
      setEnviandoInformativo(false);
    }
  }

  async function confirmarTroca(dadosTroca) {
    await api.post(`/trocas/${pacienteParaTroca.id}/trocar`, dadosTroca);
    setPacienteParaTroca(null);
    carregar();
  }

  const termo = buscaPaciente.trim().toLowerCase();
  const filtrarPorNome = (lista) => (termo ? lista.filter((p) => p.nome.toLowerCase().includes(termo)) : lista);

  const pacientesFiltrados = filtrarPorNome(
    turnoFiltro === 'TODOS' ? pacientes : pacientes.filter((p) => String(p.turno) === turnoFiltro)
  );
  const pacientesAtencao = filtrarPorNome(pacientes.filter((p) => p.status_visual !== 'NORMAL'));
  const totalAtencao = pacientes.filter((p) => p.status_visual === 'ATENCAO').length;
  const totalCritico = pacientes.filter((p) => p.status_visual === 'CRITICO').length;

  // On Sundays there is no regular schedule, but fixed extra sessions may exist.
  const diaTemAtendimento = Boolean(escala) || pacientes.length > 0;

  const idsDoDia = new Set(pacientes.map((p) => p.id));
  const PAINEIS = {
    PRESENCA: {
      descricao:
        'Pra lançar presença de um dia que passou (corrige uma falta apagada por engano, por exemplo). Escolha a data, busque o paciente pelo nome e clique nele.',
      pacientes: pacientesTodos,
      comData: true,
    },
    FALTA: {
      descricao: 'Pra lançar a falta de um dia que passou (ou qualquer outro dia). Escolha a data, busque o paciente pelo nome e clique nele.',
      pacientes: pacientesTodos,
      comData: true,
      destaque: 'vermelho',
    },
    EXTRA: {
      descricao: 'Pra paciente que veio fora do dia normal dele. Busque pelo nome e lance a sessão.',
      pacientes: pacientesTodos.filter((p) => !idsDoDia.has(p.id)),
    },
  };
  const painel = painelAberto && PAINEIS[painelAberto];

  const renderCard = (paciente) => (
    <PacienteCard
      key={paciente.id}
      paciente={paciente}
      somenteLeitura={!ehHoje}
      onRealizarSessao={(id) => lancar('PRESENCA', id)}
      onRegistrarFalta={(id) => lancar('FALTA', id)}
      onTrocarCapilar={setPacienteParaTroca}
      onVerHistorico={(p) => navigate(`/pacientes/${p.id}`)}
    />
  );

  const classeBotaoAcao =
    'px-4 py-2.5 rounded-lg bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-sm font-medium text-[var(--cor-texto-secundario)] transition-colors';
  const classeChip = (ativo) =>
    `text-sm font-medium px-3.5 py-1.5 rounded-full transition-colors ${
      ativo
        ? 'bg-[var(--cor-verde-agua)] text-black'
        : 'bg-[var(--cor-fundo-elevado)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
    }`;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Dashboard</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">
            {escala
              ? NOMES_ESCALA[escala]
              : diaTemAtendimento
              ? 'Sem escala normal — só sessão extra fixa hoje'
              : 'Sem atendimento neste dia'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-lg px-2 py-1.5">
          <button
            onClick={() => setDataSelecionada(somarDias(dataSelecionada, -1))}
            className="p-1.5 rounded-md text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <span className="fonte-mono text-sm text-[var(--cor-texto-primario)] px-2 min-w-[90px] text-center">
            {ehHoje ? 'Hoje' : formatarData(dataSelecionada)}
          </span>
          <button
            onClick={() => setDataSelecionada(somarDias(dataSelecionada, 1))}
            className="p-1.5 rounded-md text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] hover:bg-[var(--cor-superficie)] transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
          {!ehHoje && (
            <button onClick={() => setDataSelecionada(hojeISO())} className="text-xs font-medium text-[var(--cor-verde-agua)] px-2 hover:underline">
              Voltar p/ hoje
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => alternarPainel('PRESENCA')} className={`${classeBotaoAcao} hover:text-[var(--cor-verde-agua-claro)]`}>
            Lançar presença
          </button>
          <button onClick={() => alternarPainel('FALTA')} className={`${classeBotaoAcao} hover:text-red-400`}>
            Lançar falta
          </button>
          {ehHoje && (
            <button onClick={() => alternarPainel('EXTRA')} className={`${classeBotaoAcao} hover:text-[var(--cor-texto-primario)]`}>
              + Sessão extra
            </button>
          )}
          <button
            onClick={enviarInformativoLimites}
            disabled={enviandoInformativo}
            title="Monta a lista de pacientes no limite de hoje e abre o WhatsApp já com o texto pronto"
            className={`${classeBotaoAcao} hover:text-[var(--cor-verde-agua-claro)] disabled:opacity-60`}
          >
            {enviandoInformativo ? 'Montando...' : 'Enviar informativo de limites'}
          </button>
        </div>
      </div>

      {painel && (painelAberto !== 'EXTRA' || ehHoje) && (
        <PainelBuscaPaciente
          key={painelAberto}
          descricao={painel.descricao}
          pacientes={painel.pacientes}
          onEscolher={lancarPeloPainel}
          data={painel.comData ? dataPainel : undefined}
          onData={painel.comData ? setDataPainel : undefined}
          mensagem={mensagemPainel}
          destaque={painel.destaque}
        />
      )}

      {!carregando && diaTemAtendimento && (
        <>
          <div className="flex gap-3 mb-6 flex-wrap">
            <div className="px-4 py-2.5 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] flex items-center gap-2">
              <span className="fonte-mono text-lg font-semibold text-[var(--cor-texto-primario)]">{pacientes.length}</span>
              <span className="text-xs text-[var(--cor-texto-secundario)]">pacientes hoje</span>
            </div>
            {totalAtencao > 0 && (
              <div className="px-4 py-2.5 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex items-center gap-2">
                <span className="fonte-mono text-lg font-semibold text-yellow-400">{totalAtencao}</span>
                <span className="text-xs text-yellow-400/80">perto do limite</span>
              </div>
            )}
            {totalCritico > 0 && (
              <div className="px-4 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center gap-2">
                <span className="fonte-mono text-lg font-semibold text-red-400">{totalCritico}</span>
                <span className="text-xs text-red-400/80">no limite — trocar capilar</span>
              </div>
            )}
          </div>

          <input
            type="text"
            value={buscaPaciente}
            onChange={(e) => setBuscaPaciente(e.target.value)}
            placeholder="Buscar paciente por nome..."
            className="w-full max-w-sm mb-6 bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-lg px-4 py-2.5 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
          />

          {pacientesAtencao.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-[var(--cor-texto-primario)] mb-3">
                Atenção — perto do limite ou no limite (18/19/20 usos)
              </h2>
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {pacientesAtencao.map(renderCard)}
              </motion.div>
            </div>
          )}
        </>
      )}

      {lancamentosDoDia.length > 0 && (
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-[var(--cor-texto-primario)] mb-3">
            Faltas e sessões extras lançadas {ehHoje ? 'hoje' : `em ${formatarData(dataSelecionada)}`}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lancamentosDoDia.map((l) => (
              <div
                key={l.sessao_id}
                className="rounded-xl border p-3.5 flex items-center justify-between gap-3"
                style={
                  l.tipo === 'FALTA'
                    ? { background: 'var(--cor-vermelho-suave)', borderColor: 'rgba(239, 68, 68, 0.3)' }
                    : { background: 'var(--cor-verde-agua-suave)', borderColor: 'rgba(45, 212, 191, 0.3)' }
                }
              >
                <div className="min-w-0">
                  <p className="font-medium text-[var(--cor-texto-primario)] truncate">{l.nome}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${l.tipo === 'FALTA' ? 'text-red-400' : 'text-[var(--cor-verde-agua-claro)]'}`}>
                      {l.tipo === 'FALTA' ? 'Falta' : 'Sessão extra'}
                    </span>
                    <span className="fonte-mono text-xs text-[var(--cor-texto-terciario)]">
                      {l.capilar} · Salão {l.salao || '—'}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => removerLancamento(l)}
                  title="Remover esse lançamento (corrige erro de digitação)"
                  className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] hover:text-red-400 border border-[var(--cor-borda)] transition-colors"
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {!carregando && diaTemAtendimento && (
        <div className="mb-8">
          <button
            onClick={() => setTodosAbertos((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-left hover:bg-[var(--cor-superficie)] transition-colors"
          >
            <span className="text-sm font-semibold text-[var(--cor-texto-primario)]">
              Todos os pacientes do dia ({pacientesFiltrados.length})
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={`text-[var(--cor-texto-secundario)] transition-transform ${todosAbertos ? 'rotate-180' : ''}`}
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </button>

          {todosAbertos && (
            <div className="mt-4">
              <div className="flex gap-2 mb-6 flex-wrap">
                <button onClick={() => setTurnoFiltro('TODOS')} className={classeChip(turnoFiltro === 'TODOS')}>
                  Todos os turnos
                </button>
                {TURNOS.map((t) => (
                  <button key={t} onClick={() => setTurnoFiltro(String(t))} className={classeChip(turnoFiltro === String(t))}>
                    {t}º turno
                  </button>
                ))}
              </div>

              {pacientesFiltrados.length === 0 ? (
                <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Nenhum paciente encontrado para esse filtro.</div>
              ) : (
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pacientesFiltrados.map(renderCard)}
                </motion.div>
              )}
            </div>
          )}
        </div>
      )}

      {erro && (
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400 mb-4">
          {erro}
        </div>
      )}

      {carregando && <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando pacientes...</div>}

      {!carregando && !diaTemAtendimento && (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Não há atendimento programado para este dia.</div>
      )}

      {pacienteParaTroca && (
        <ModalTrocaCapilar paciente={pacienteParaTroca} onConfirmar={confirmarTroca} onFechar={() => setPacienteParaTroca(null)} />
      )}
    </div>
  );
}
