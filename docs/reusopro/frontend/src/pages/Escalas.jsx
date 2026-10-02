import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { BOXES, POSICOES_BOX as POSICOES } from '../utils/regras';

// Fixed seating map: per room + shift, 8 boxes with 4 positions each.
// The API guarantees one active patient per slot.
export default function Escalas() {
  const [salao, setSalao] = useState('');
  const [turno, setTurno] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState('');
  const [slotAberto, setSlotAberto] = useState(null); // { box, posicao }
  const [busca, setBusca] = useState('');
  const [erroAlocacao, setErroAlocacao] = useState('');

  const filtroCompleto = salao !== '' && turno !== '';

  const carregar = useCallback(() => {
    if (!filtroCompleto) return;
    setCarregando(true);
    setErro('');
    api
      .get('/pacientes', { params: { salao, turno } })
      .then(({ data }) => setPacientes(data))
      .catch(() => setErro('Não foi possível carregar os pacientes desse salão/turno.'))
      .finally(() => setCarregando(false));
  }, [salao, turno, filtroCompleto]);

  useEffect(carregar, [carregar]);

  const porSlot = useMemo(() => {
    const mapa = new Map();
    for (const p of pacientes) {
      if (p.box && p.posicao_box) mapa.set(`${p.box}-${p.posicao_box}`, p);
    }
    return mapa;
  }, [pacientes]);

  const semBox = pacientes.filter((p) => !p.box || !p.posicao_box);

  const candidatos = semBox.filter(
    (p) => busca.trim() && p.nome.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirSlot(box, posicao) {
    setErroAlocacao('');
    setBusca('');
    setSlotAberto({ box, posicao });
  }

  async function alocar(paciente) {
    if (!slotAberto) return;
    setErroAlocacao('');
    try {
      await api.put(`/pacientes/${paciente.id}/box`, { box: slotAberto.box, posicao_box: slotAberto.posicao });
      setSlotAberto(null);
      setBusca('');
      carregar();
    } catch (err) {
      setErroAlocacao(err.response?.data?.erro || 'Não foi possível alocar esse paciente nesse slot.');
    }
  }

  async function desalocar(paciente) {
    if (!window.confirm(`Remover ${paciente.nome} do Box ${paciente.box} (posição ${paciente.posicao_box})?`)) return;
    try {
      await api.put(`/pacientes/${paciente.id}/box`, { box: null, posicao_box: null });
      carregar();
    } catch (err) {
      window.alert(err.response?.data?.erro || 'Não foi possível remover esse paciente do box.');
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Escalas</h1>
        <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">
          Mapa fixo de 8 boxes com 4 posições cada. Escolha o salão e o turno pra ver e organizar a escala.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={salao}
          onChange={(e) => {
            setSalao(e.target.value);
            setSlotAberto(null);
          }}
          className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-lg px-3 py-2.5 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
        >
          <option value="">Escolha o salão...</option>
          <option value="1">Salão 1</option>
          <option value="2">Salão 2</option>
          <option value="3">Salão 3</option>
        </select>
        <select
          value={turno}
          onChange={(e) => {
            setTurno(e.target.value);
            setSlotAberto(null);
          }}
          className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-lg px-3 py-2.5 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
        >
          <option value="">Escolha o turno...</option>
          <option value="1">1º turno</option>
          <option value="2">2º turno</option>
          <option value="3">3º turno</option>
        </select>
      </div>

      {!filtroCompleto ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">
          Escolha o salão e o turno pra ver a escala.
        </div>
      ) : carregando ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
      ) : erro ? (
        <div className="px-4 py-3 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
          {erro}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {BOXES.map((box) => (
              <div
                key={box}
                className="rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-fundo-elevado)] p-3.5"
              >
                <p className="text-xs font-semibold text-[var(--cor-texto-terciario)] uppercase tracking-wide mb-2.5">
                  Box {box}
                </p>
                <div className="space-y-1.5">
                  {POSICOES.map((posicao) => {
                    const paciente = porSlot.get(`${box}-${posicao}`);
                    const aberto = slotAberto?.box === box && slotAberto?.posicao === posicao;
                    return (
                      <div key={posicao}>
                        {paciente ? (
                          <div className="flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
                            <Link
                              to={`/pacientes/${paciente.id}`}
                              className="min-w-0 text-xs text-[var(--cor-texto-primario)] font-medium truncate hover:text-[var(--cor-verde-agua-claro)]"
                              title={paciente.nome}
                            >
                              {posicao}. {paciente.nome}
                            </Link>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <span className="fonte-mono text-xs text-[var(--cor-texto-terciario)]">
                                {paciente.reuso_atual}/20
                              </span>
                              <button
                                onClick={() => desalocar(paciente)}
                                title="Remover do box"
                                className="text-xs text-[var(--cor-texto-terciario)] hover:text-red-400"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => abrirSlot(box, posicao)}
                            className={`w-full text-left px-2.5 py-2 rounded-lg border text-xs transition-colors ${
                              aberto
                                ? 'border-[var(--cor-verde-agua)] text-[var(--cor-verde-agua-claro)]'
                                : 'border-dashed border-[var(--cor-borda)] text-[var(--cor-texto-terciario)] hover:border-[var(--cor-texto-secundario)]'
                            }`}
                          >
                            {posicao}. Vazio
                          </button>
                        )}

                        {aberto && (
                          <div className="mt-1.5 p-2.5 rounded-lg bg-[var(--cor-superficie)] border border-[var(--cor-borda)]">
                            <input
                              type="text"
                              autoFocus
                              value={busca}
                              onChange={(e) => setBusca(e.target.value)}
                              placeholder="Buscar paciente..."
                              className="w-full bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded px-2 py-1.5 text-xs text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                            />
                            {erroAlocacao && <p className="text-xs text-red-400 mt-1.5">{erroAlocacao}</p>}
                            {busca.trim() && (
                              <div className="mt-1.5 space-y-1 max-h-32 overflow-y-auto">
                                {candidatos.length === 0 ? (
                                  <p className="text-xs text-[var(--cor-texto-terciario)] px-1 py-1">
                                    Nenhum paciente sem box encontrado.
                                  </p>
                                ) : (
                                  candidatos.map((p) => (
                                    <button
                                      key={p.id}
                                      onClick={() => alocar(p)}
                                      className="w-full text-left px-2 py-1.5 rounded bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-xs text-[var(--cor-texto-primario)] hover:border-[var(--cor-verde-agua)] transition-colors"
                                    >
                                      {p.nome}
                                    </button>
                                  ))
                                )}
                              </div>
                            )}
                            <button
                              onClick={() => setSlotAberto(null)}
                              className="text-xs text-[var(--cor-texto-terciario)] hover:text-[var(--cor-texto-primario)] mt-1.5"
                            >
                              Cancelar
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-[var(--cor-texto-primario)] mb-3">
              Pacientes sem box neste salão/turno ({semBox.length})
            </h2>
            {semBox.length === 0 ? (
              <p className="text-sm text-[var(--cor-texto-terciario)]">Todo mundo já tem um box alocado.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {semBox.map((p) => (
                  <span
                    key={p.id}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] text-[var(--cor-texto-secundario)]"
                  >
                    {p.nome}
                  </span>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
