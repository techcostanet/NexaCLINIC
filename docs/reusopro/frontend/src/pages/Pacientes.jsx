import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import ModalTrocaCapilar from '../components/ModalTrocaCapilar';
import {
  ESCALAS,
  NOMES_ESCALA_CURTO,
  SALOES,
  TURNOS,
  OPCOES_CAPILAR,
  NOMES_DIA_SEMANA,
  calcularCapilarPorPeso as capilarPorPeso,
} from '../utils/regras';

const ESCALAS_ORDEM = ESCALAS.map((e) => e.valor);

function TabelaPacientes({ pacientes, onHistorico, onTrocar, onEditar, onRemover }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm min-w-[720px]">
        <thead>
          <tr className="border-b border-[var(--cor-borda)] text-left text-[var(--cor-texto-terciario)]">
            <th className="px-4 py-3 font-medium">Nome</th>
            <th className="px-4 py-3 font-medium">Peso</th>
            <th className="px-4 py-3 font-medium">Capilar</th>
            <th className="px-4 py-3 font-medium">Escala</th>
            <th className="px-4 py-3 font-medium">Turno</th>
            <th className="px-4 py-3 font-medium">Salão</th>
            <th className="px-4 py-3 font-medium">Reuso</th>
            <th className="px-4 py-3 font-medium"></th>
          </tr>
        </thead>
        <tbody>
          {pacientes.map((p) => (
            <tr key={p.id} className="border-b border-[var(--cor-borda)] last:border-0 hover:bg-[var(--cor-superficie)]">
              <td className="px-4 py-3 text-[var(--cor-texto-primario)] font-medium">
                <div className="flex items-center gap-2">
                  <span>{p.nome}</span>
                  <button
                    onClick={() => onHistorico(p)}
                    title="Abrir perfil (histórico de sessões, faltas e capilares)"
                    className="text-xs text-[var(--cor-texto-terciario)] hover:text-[var(--cor-verde-agua-claro)] underline decoration-dotted"
                  >
                    Perfil
                  </button>
                </div>
              </td>
              <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">{Number(p.peso_kg)} kg</td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <span className="fonte-mono text-xs px-1.5 py-0.5 rounded bg-[var(--cor-superficie)] border border-[var(--cor-borda)] text-[var(--cor-texto-secundario)]">
                    {p.capilar}
                  </span>
                  {p.capilar_manual && (
                    <span
                      title="Exceção manual — não segue o cálculo automático por peso"
                      className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/25"
                    >
                      exceção
                    </span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-[var(--cor-texto-secundario)] text-xs">
                {NOMES_ESCALA_CURTO[p.escala]}
              </td>
              <td className="px-4 py-3 text-[var(--cor-texto-secundario)]">{p.turno}º</td>
              <td className="px-4 py-3 text-[var(--cor-texto-secundario)]">{p.salao || '—'}</td>
              <td className="px-4 py-3 fonte-mono text-[var(--cor-texto-secundario)]">{p.reuso_atual}/20</td>
              <td className="px-4 py-3 text-right whitespace-nowrap">
                <button
                  onClick={() => onTrocar(p)}
                  className="text-xs text-[var(--cor-verde-agua-claro)] hover:underline mr-3"
                >
                  Trocar capilar
                </button>
                <button
                  onClick={() => onEditar(p)}
                  className="text-xs text-[var(--cor-verde-agua-claro)] hover:underline mr-3"
                >
                  Editar
                </button>
                <button onClick={() => onRemover(p)} className="text-xs text-red-400 hover:underline">
                  Remover
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const OPCOES_SOROLOGIA = ['', '-', '+'];
const LABEL_SOROLOGIA = { '': 'Não informado', '-': 'Negativo (-)', '+': 'Positivo (+)' };

const PACIENTE_VAZIO = {
  nome: '',
  peso_kg: '',
  data_nascimento: '',
  salao: '1',
  escala: 'SEG_QUA_SEX',
  turno: '1',
  reuso_atual: '0',
  observacoes: '',
  capilar_manual: false,
  capilar: '',
  nome_mae: '',
  sorologia_hcv: '',
  sorologia_hiv: '',
  sorologia_hbs: '',
  dia_extra_fixo: '',
};

const DIAS_SEMANA = [{ valor: '', label: 'Nenhuma' }, ...NOMES_DIA_SEMANA.map((label, i) => ({ valor: String(i), label }))];

export default function Pacientes() {
  const navigate = useNavigate();
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState(PACIENTE_VAZIO);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [pacienteParaTroca, setPacienteParaTroca] = useState(null);
  const [gruposFechados, setGruposFechados] = useState(() => {
    // Room groups start open; each shift's patient list starts collapsed.
    const fechados = new Set();
    for (const salao of [...SALOES, 0]) {
      for (const escala of ESCALAS_ORDEM) {
        for (const turno of TURNOS) {
          fechados.add(`salao-${salao}-${escala}-${turno}`);
        }
      }
    }
    return fechados;
  });

  function alternarGrupo(chave) {
    setGruposFechados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(chave)) proximo.delete(chave);
      else proximo.add(chave);
      return proximo;
    });
  }

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const { data } = await api.get('/pacientes');
      setPacientes(data);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  function abrirNovo() {
    setEditando(null);
    setForm(PACIENTE_VAZIO);
    setErro('');
    setModalAberto(true);
  }

  function abrirEdicao(paciente) {
    setEditando(paciente);
    setForm({
      nome: paciente.nome,
      peso_kg: paciente.peso_kg,
      data_nascimento: paciente.data_nascimento ? paciente.data_nascimento.split('T')[0] : '',
      salao: String(paciente.salao || '1'),
      escala: paciente.escala,
      turno: String(paciente.turno),
      reuso_atual: String(paciente.reuso_atual ?? 0),
      observacoes: paciente.observacoes || '',
      capilar_manual: paciente.capilar_manual || false,
      capilar: paciente.capilar || '',
      nome_mae: paciente.nome_mae || '',
      sorologia_hcv: paciente.sorologia_hcv || '',
      sorologia_hiv: paciente.sorologia_hiv || '',
      sorologia_hbs: paciente.sorologia_hbs || '',
      dia_extra_fixo:
        paciente.dia_extra_fixo === null || paciente.dia_extra_fixo === undefined
          ? ''
          : String(paciente.dia_extra_fixo),
    });
    setErro('');
    setModalAberto(true);
  }

  async function salvar() {
    if (!form.nome.trim() || !form.peso_kg || !form.data_nascimento) {
      setErro('Nome, peso e data de nascimento são obrigatórios.');
      return;
    }
    if (!form.nome_mae.trim()) {
      setErro('Nome da mãe é obrigatório.');
      return;
    }
    if (form.capilar_manual && !form.capilar) {
      setErro('Escolha qual capilar de exceção esse paciente vai usar.');
      return;
    }
    if (Number(form.reuso_atual) < 0 || Number(form.reuso_atual) > 20) {
      setErro('Reuso atual deve ser entre 0 e 20.');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const payload = {
        ...form,
        peso_kg: Number(form.peso_kg),
        turno: Number(form.turno),
        salao: Number(form.salao),
        reuso_atual: Number(form.reuso_atual),
        dia_extra_fixo: form.dia_extra_fixo === '' ? null : Number(form.dia_extra_fixo),
      };
      if (editando) {
        await api.put(`/pacientes/${editando.id}`, payload);
      } else {
        await api.post('/pacientes', payload);
      }
      setModalAberto(false);
      carregar();
    } catch (err) {
      setErro(err.response?.data?.erro || 'Erro ao salvar paciente.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover(paciente) {
    if (!window.confirm(`Remover ${paciente.nome} da lista de pacientes ativos?`)) return;
    await api.delete(`/pacientes/${paciente.id}`);
    carregar();
  }

  async function confirmarTroca(dadosTroca) {
    await api.post(`/trocas/${pacienteParaTroca.id}/trocar`, dadosTroca);
    setPacienteParaTroca(null);
    carregar();
  }

  const pacientesFiltrados = pacientes.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase()));

  const gruposPorSalao = useMemo(() => {
    const porSalao = new Map(SALOES.map((s) => [s, []]));
    const semSalao = [];
    for (const p of pacientes) {
      const salao = Number(p.salao);
      if (porSalao.has(salao)) porSalao.get(salao).push(p);
      else semSalao.push(p);
    }
    if (semSalao.length > 0) porSalao.set(0, semSalao);
    return porSalao;
  }, [pacientes]);

  function pacientesDoSubgrupo(listaSalao, escala, turno) {
    return listaSalao.filter((p) => p.escala === escala && Number(p.turno) === turno);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Pacientes</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">{pacientes.length} cadastrados</p>
        </div>
        <button
          onClick={abrirNovo}
          className="px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors"
        >
          + Novo paciente
        </button>
      </div>

      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar paciente por nome..."
        className="w-full max-w-sm mb-6 bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-lg px-4 py-2.5 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
      />

      {carregando ? (
        <div className="text-center py-16 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
      ) : busca.trim() ? (
        <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden">
          <TabelaPacientes
            pacientes={pacientesFiltrados}
            onHistorico={(p) => navigate(`/pacientes/${p.id}`)}
            onTrocar={setPacienteParaTroca}
            onEditar={abrirEdicao}
            onRemover={remover}
          />
          {pacientesFiltrados.length === 0 && (
            <div className="text-center py-10 text-[var(--cor-texto-terciario)] text-sm">Nenhum paciente encontrado.</div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {[...SALOES, ...(gruposPorSalao.has(0) ? [0] : [])].map((salao) => {
            const listaSalao = gruposPorSalao.get(salao) || [];
            const chaveSalao = `salao-${salao}`;
            const fechado = gruposFechados.has(chaveSalao);
            return (
              <div key={salao} className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden">
                <button
                  onClick={() => alternarGrupo(chaveSalao)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[var(--cor-superficie)] transition-colors"
                >
                  <span className="text-sm font-semibold text-[var(--cor-texto-primario)]">
                    {salao === 0 ? 'Sem salão definido' : `Salão ${salao}`}
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="text-xs text-[var(--cor-texto-terciario)]">{listaSalao.length} paciente(s)</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`text-[var(--cor-texto-secundario)] transition-transform ${fechado ? '' : 'rotate-180'}`}
                    >
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  </span>
                </button>

                {!fechado && (
                  <div className="border-t border-[var(--cor-borda)] divide-y divide-[var(--cor-borda)]">
                    {ESCALAS_ORDEM.map((escala) =>
                      TURNOS.map((turno) => {
                        const itens = pacientesDoSubgrupo(listaSalao, escala, turno);
                        if (itens.length === 0) return null;
                        const chaveSub = `${chaveSalao}-${escala}-${turno}`;
                        const subFechado = gruposFechados.has(chaveSub);
                        return (
                          <div key={chaveSub}>
                            <button
                              onClick={() => alternarGrupo(chaveSub)}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-[var(--cor-superficie)] transition-colors"
                            >
                              <span className="text-xs font-medium text-[var(--cor-texto-secundario)]">
                                {turno}º turno · {NOMES_ESCALA_CURTO[escala]}
                              </span>
                              <span className="flex items-center gap-2">
                                <span className="text-xs text-[var(--cor-texto-terciario)]">{itens.length}</span>
                                <svg
                                  width="12"
                                  height="12"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  className={`text-[var(--cor-texto-terciario)] transition-transform ${subFechado ? '' : 'rotate-180'}`}
                                >
                                  <path d="M6 9l6 6 6-6" />
                                </svg>
                              </span>
                            </button>
                            {!subFechado && (
                              <TabelaPacientes
                                pacientes={itens}
                                onHistorico={(p) => navigate(`/pacientes/${p.id}`)}
                                onTrocar={setPacienteParaTroca}
                                onEditar={abrirEdicao}
                                onRemover={remover}
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                    {listaSalao.length === 0 && (
                      <div className="text-center py-6 text-[var(--cor-texto-terciario)] text-xs">Nenhum paciente neste salão.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {modalAberto && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4 overflow-y-auto py-8"
          onClick={() => setModalAberto(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-md my-auto"
          >
            <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-5">
              {editando ? 'Editar paciente' : 'Novo paciente'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Nome
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={form.peso_kg}
                    onChange={(e) => setForm({ ...form, peso_kg: e.target.value })}
                    className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                    Data de nascimento
                  </label>
                  <input
                    type="date"
                    value={form.data_nascimento}
                    onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })}
                    className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                    Capilar {form.capilar_manual ? '(exceção)' : '(automático)'}
                  </label>
                  {form.capilar_manual ? (
                    <select
                      value={form.capilar}
                      onChange={(e) => setForm({ ...form, capilar: e.target.value })}
                      className="w-full bg-[var(--cor-superficie)] border border-yellow-500/40 rounded-lg px-3 py-2 text-sm fonte-mono text-yellow-300 outline-none focus:border-yellow-400"
                    >
                      <option value="">Selecione...</option>
                      {OPCOES_CAPILAR.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm fonte-mono text-[var(--cor-verde-agua-claro)]">
                      {capilarPorPeso(form.peso_kg)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                    Salão
                  </label>
                  <div className="flex gap-2">
                    {['1', '2', '3'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm({ ...form, salao: s })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                          form.salao === s
                            ? 'bg-[var(--cor-verde-agua)] text-black'
                            : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <label className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-yellow-500/[0.06] border border-yellow-500/20 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.capilar_manual}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      capilar_manual: e.target.checked,
                      capilar: e.target.checked ? form.capilar || capilarPorPeso(form.peso_kg) : '',
                    })
                  }
                  className="mt-0.5 accent-yellow-400"
                />
                <span className="text-xs text-yellow-200/90 leading-relaxed">
                  Este paciente usa um capilar diferente do calculado pelo peso (exceção clínica). Marque para
                  escolher manualmente — o sistema não vai mais recalcular pelo peso enquanto isso estiver marcado.
                </span>
              </label>

              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Escala
                </label>
                <select
                  value={form.escala}
                  onChange={(e) => setForm({ ...form, escala: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                >
                  {ESCALAS.map((e) => (
                    <option key={e.valor} value={e.valor}>
                      {e.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Turno
                </label>
                <div className="flex gap-2">
                  {['1', '2', '3'].map((t) => (
                    <button
                      key={t}
                      onClick={() => setForm({ ...form, turno: t })}
                      className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                        form.turno === t
                          ? 'bg-[var(--cor-verde-agua)] text-black'
                          : 'bg-[var(--cor-superficie)] text-[var(--cor-texto-secundario)] border border-[var(--cor-borda)]'
                      }`}
                    >
                      {t}º turno
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Sessão extra fixa (opcional)
                </label>
                <select
                  value={form.dia_extra_fixo}
                  onChange={(e) => setForm({ ...form, dia_extra_fixo: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                >
                  {DIAS_SEMANA.map((d) => (
                    <option key={d.valor} value={d.valor}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-[var(--cor-texto-terciario)] mt-1">
                  Além da escala normal, esse paciente também tem presença automática nesse dia da semana (conta
                  reuso e entra nos alertas de limite).
                </p>
              </div>

              <div className="pt-2 border-t border-[var(--cor-borda)]">
                <p className="text-xs font-semibold text-[var(--cor-texto-secundario)] uppercase tracking-wide mb-3">
                  Dados para etiqueta de capilar
                </p>
                <div className="mb-3">
                  <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                    Nome da mãe <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={form.nome_mae}
                    onChange={(e) => setForm({ ...form, nome_mae: e.target.value })}
                    className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                  />
                </div>
                <p className="text-xs text-[var(--cor-texto-terciario)] mb-3 -mt-1">Sorologias abaixo são opcionais.</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    ['sorologia_hcv', 'HCV'],
                    ['sorologia_hiv', 'HIV'],
                    ['sorologia_hbs', 'HBS'],
                  ].map(([campo, label]) => (
                    <div key={campo}>
                      <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                        {label}
                      </label>
                      <select
                        value={form[campo]}
                        onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                        className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                      >
                        {OPCOES_SOROLOGIA.map((v) => (
                          <option key={v} value={v}>
                            {LABEL_SOROLOGIA[v]}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-[var(--cor-texto-terciario)] mt-2">
                  Preenchido aqui uma vez, esses dados são usados automaticamente ao gerar a etiqueta desse paciente em Etiquetas → Etiquetas de capilar.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">
                  Reuso atual (conforme pasta física, se paciente já dializa)
                </label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.reuso_atual}
                  onChange={(e) => setForm({ ...form, reuso_atual: e.target.value })}
                  className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm fonte-mono text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
                />
                <p className="text-xs text-[var(--cor-texto-terciario)] mt-1">
                  Paciente novo no capilar atual: deixa 0. Paciente que já vem dialisando: coloca o número de usos que ele já está.
                </p>
              </div>
            </div>

            {erro && (
              <div className="mt-4 px-3 py-2 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
                {erro}
              </div>
            )}

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setModalAberto(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
              >
                {salvando ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pacienteParaTroca && (
        <ModalTrocaCapilar
          paciente={pacienteParaTroca}
          onConfirmar={confirmarTroca}
          onFechar={() => setPacienteParaTroca(null)}
        />
      )}
    </div>
  );
}
