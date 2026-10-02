import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import api, { mensagemDeErro } from '../services/api';
import { gerarZplEtiquetaCapilar } from '../utils/zpl';
import { hojeISO } from '../utils/datas';
import { PRIME_MIN, PRIME_MAX, calcularPrimeFinal } from '../utils/regras';
import { TAMANHO_ETIQUETA_PADRAO, LOGO_URL } from '../utils/etiquetaConfig';
import { useImpressoraZebra } from '../hooks/useImpressoraZebra';
import EtiquetaCapilar, { estilosEtiqueta } from '../components/EtiquetaCapilar';
import ModalConfirmarTrocaCapilar from '../components/ModalConfirmarTrocaCapilar';

// Dialyzer label printing.
// Flow: select patients -> enter initial prime + first-use date -> optionally
// register the swap for all of them -> print.
// Printing: ZPL straight to the Zebra when Browser Print is detected,
// otherwise an HTML label sized to the roll + the browser print dialog.
const TEMPO_MAX_ESPERA_LOGO_MS = 2000;

export default function Etiquetas() {
  const [pacientes, setPacientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [categoriaAberta, setCategoriaAberta] = useState('capilar');
  const [selecionados, setSelecionados] = useState(() => new Set());
  const [modalPrimeAberto, setModalPrimeAberto] = useState(false);
  const [primeInicial, setPrimeInicial] = useState('');
  const [dataPrimeiroUso, setDataPrimeiroUso] = useState(hojeISO);
  const [tamanho, setTamanho] = useState(TAMANHO_ETIQUETA_PADRAO);
  const [pacientesParaConfirmarTroca, setPacientesParaConfirmarTroca] = useState(null);
  const [etiquetasParaImprimir, setEtiquetasParaImprimir] = useState(null);
  const [enviandoZebra, setEnviandoZebra] = useState(false);
  const [erroZebra, setErroZebra] = useState('');
  const { dispositivo: zebra, enviarZpl } = useImpressoraZebra();

  const primeFinal = useMemo(() => calcularPrimeFinal(primeInicial), [primeInicial]);
  const primeForaDaFaixa = primeInicial !== '' && (Number(primeInicial) < PRIME_MIN || Number(primeInicial) > PRIME_MAX);

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

  const pacientesFiltrados = useMemo(
    () => pacientes.filter((p) => p.nome.toLowerCase().includes(busca.toLowerCase())),
    [pacientes, busca]
  );

  function alternarSelecao(id) {
    setSelecionados((prev) => {
      const proximo = new Set(prev);
      if (proximo.has(id)) proximo.delete(id);
      else proximo.add(id);
      return proximo;
    });
  }

  function abrirModalPrime() {
    setPrimeInicial('');
    setDataPrimeiroUso(hojeISO());
    setModalPrimeAberto(true);
  }

  async function imprimir(escolhidos) {
    setErroZebra('');
    const dadosEtiqueta = { primeInicial, primeFinal, dataPrimeiroUso };

    if (!zebra) {
      setEtiquetasParaImprimir({ pacientes: escolhidos, ...dadosEtiqueta });
      return;
    }

    setEnviandoZebra(true);
    try {
      await enviarZpl(
        escolhidos.map((p) => ({ rotulo: p.nome, zpl: gerarZplEtiquetaCapilar(p, { ...dadosEtiqueta, tamanhoMM: tamanho }) }))
      );
    } catch (err) {
      setErroZebra(err.message);
    } finally {
      setEnviandoZebra(false);
    }
  }

  function confirmarGeracao() {
    setModalPrimeAberto(false);
    setPacientesParaConfirmarTroca(pacientes.filter((p) => selecionados.has(p.id)));
  }

  function pularTrocaEImprimir() {
    const escolhidos = pacientesParaConfirmarTroca;
    setPacientesParaConfirmarTroca(null);
    imprimir(escolhidos);
  }

  // Swaps are sent one by one; if one fails the earlier ones stay applied,
  // and the error tells the user to review before retrying.
  async function confirmarTrocaEImprimir(motivoTroca) {
    const escolhidos = pacientesParaConfirmarTroca;
    for (const p of escolhidos) {
      try {
        await api.post(`/trocas/${p.id}/trocar`, { ...motivoTroca, data_inicio: dataPrimeiroUso });
      } catch (err) {
        throw new Error(
          `Falha ao trocar o capilar de ${p.nome}: ${mensagemDeErro(err, 'erro desconhecido')}. ` +
            'Quem já foi trocado antes desse continua trocado -- confira o perfil de cada paciente antes de tentar de novo.'
        );
      }
    }
    setPacientesParaConfirmarTroca(null);
    imprimir(escolhidos);
    carregar();
  }

  // Browser printing: wait for every logo image (if any) before opening the
  // print dialog, with a timeout so a broken image never blocks printing.
  const logosCarregadosRef = useRef(0);
  useEffect(() => {
    if (!etiquetasParaImprimir) return;
    logosCarregadosRef.current = 0;
    const totalLogos = LOGO_URL ? etiquetasParaImprimir.pacientes.length : 0;

    let disparado = false;
    const disparar = () => {
      if (disparado) return;
      disparado = true;
      window.print();
    };
    const limite = setTimeout(disparar, TEMPO_MAX_ESPERA_LOGO_MS);
    const verificar = setInterval(() => {
      if (logosCarregadosRef.current >= totalLogos) {
        clearInterval(verificar);
        clearTimeout(limite);
        disparar();
      }
    }, 50);

    return () => {
      clearInterval(verificar);
      clearTimeout(limite);
    };
  }, [etiquetasParaImprimir]);

  return (
    <div>
      <style>{estilosEtiqueta(tamanho)}</style>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--cor-texto-primario)]">Etiquetas</h1>
          <p className="text-sm text-[var(--cor-texto-secundario)] mt-1">Gere e imprima etiquetas direto pela impressora Zebra.</p>
        </div>
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border ${
            zebra
              ? 'border-[var(--cor-verde-agua)]/30 bg-[var(--cor-verde-agua-suave)] text-[var(--cor-verde-agua-claro)]'
              : 'border-[var(--cor-borda)] text-[var(--cor-texto-terciario)]'
          }`}
          title={
            zebra
              ? `Impressão automática ativa (${zebra.name})`
              : 'Instale o Zebra Browser Print e coloque o SDK em public/browserprint.js pra imprimir automaticamente, sem diálogo do navegador.'
          }
        >
          <span className={`w-2 h-2 rounded-full ${zebra ? 'bg-[var(--cor-verde-agua)]' : 'bg-[var(--cor-texto-terciario)]'}`} />
          {zebra ? 'Zebra conectada' : 'Zebra não detectada (imprime pelo navegador)'}
        </div>
      </div>

      {erroZebra && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-[var(--cor-vermelho-suave)] border border-[var(--cor-vermelho)]/30 text-sm text-red-400">
          {erroZebra}
        </div>
      )}

      <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden">
        <button
          onClick={() => setCategoriaAberta(categoriaAberta === 'capilar' ? null : 'capilar')}
          className="w-full flex items-center justify-between px-4 py-3.5 text-left hover:bg-[var(--cor-superficie)] transition-colors"
        >
          <span className="text-sm font-semibold text-[var(--cor-texto-primario)]">Etiquetas de capilar</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`text-[var(--cor-texto-secundario)] transition-transform ${categoriaAberta === 'capilar' ? 'rotate-180' : ''}`}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>

        {categoriaAberta === 'capilar' && (
          <div className="border-t border-[var(--cor-borda)] p-4">
            <div className="flex items-center gap-3 flex-wrap mb-4">
              <input
                type="text"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar paciente por nome..."
                className="flex-1 min-w-[220px] bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
              />
              <button
                onClick={() => setSelecionados(new Set(pacientesFiltrados.map((p) => p.id)))}
                className="text-xs text-[var(--cor-verde-agua-claro)] hover:underline"
              >
                Selecionar todos
              </button>
              <button onClick={() => setSelecionados(new Set())} className="text-xs text-[var(--cor-texto-secundario)] hover:underline">
                Limpar seleção
              </button>
            </div>

            {carregando ? (
              <div className="text-center py-10 text-[var(--cor-texto-terciario)] text-sm">Carregando...</div>
            ) : (
              <div className="border border-[var(--cor-borda)] rounded-lg divide-y divide-[var(--cor-borda)] max-h-[420px] overflow-y-auto">
                {pacientesFiltrados.map((p) => (
                  <label key={p.id} className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--cor-superficie)] cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={selecionados.has(p.id)}
                      onChange={() => alternarSelecao(p.id)}
                      className="accent-[var(--cor-verde-agua)]"
                    />
                    <span className="text-[var(--cor-texto-primario)] font-medium flex-1">{p.nome}</span>
                    <span className="fonte-mono text-xs text-[var(--cor-texto-secundario)]">{p.capilar}</span>
                    {!p.nome_mae && (
                      <span
                        title="Faltam dados para a etiqueta (nome da mãe) — complete em Pacientes"
                        className="text-xs px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 border border-yellow-500/25"
                      >
                        dados incompletos
                      </span>
                    )}
                  </label>
                ))}
                {pacientesFiltrados.length === 0 && (
                  <div className="text-center py-8 text-[var(--cor-texto-terciario)] text-sm">Nenhum paciente encontrado.</div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <div className="flex items-center gap-2 text-xs text-[var(--cor-texto-secundario)]">
                <span>Etiqueta (mm):</span>
                <input
                  type="number"
                  value={tamanho.largura}
                  onChange={(e) => setTamanho({ ...tamanho, largura: Number(e.target.value) || TAMANHO_ETIQUETA_PADRAO.largura })}
                  className="w-16 bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded px-2 py-1 fonte-mono"
                />
                <span>x</span>
                <input
                  type="number"
                  value={tamanho.altura}
                  onChange={(e) => setTamanho({ ...tamanho, altura: Number(e.target.value) || TAMANHO_ETIQUETA_PADRAO.altura })}
                  className="w-16 bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded px-2 py-1 fonte-mono"
                />
                <span className="text-[var(--cor-texto-terciario)]">(ajuste pro tamanho real do rolo)</span>
              </div>

              <button
                onClick={abrirModalPrime}
                disabled={selecionados.size === 0}
                className="px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-40"
              >
                Gerar etiquetas ({selecionados.size})
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-xl overflow-hidden mt-4 opacity-60">
        <div className="px-4 py-3.5 text-sm font-semibold text-[var(--cor-texto-secundario)]">Mais categorias de etiqueta — em breve</div>
      </div>

      {modalPrimeAberto && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4" onClick={() => setModalPrimeAberto(false)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-[var(--cor-fundo-elevado)] border border-[var(--cor-borda)] rounded-2xl p-6 w-full max-w-sm"
          >
            <h3 className="text-lg font-bold text-[var(--cor-texto-primario)] mb-1">Prime da etiqueta</h3>
            <p className="text-sm text-[var(--cor-texto-secundario)] mb-1">Valores aplicados às {selecionados.size} etiqueta(s) selecionada(s).</p>
            <p className="text-xs text-[var(--cor-texto-terciario)] mb-5">
              {zebra ? `Vai imprimir direto na ${zebra.name}.` : 'Zebra não detectada — vai abrir o diálogo de impressão do navegador.'}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">Prime inicial</label>
                <input
                  type="number"
                  autoFocus
                  min={PRIME_MIN}
                  max={PRIME_MAX}
                  step="1"
                  placeholder={`${PRIME_MIN} a ${PRIME_MAX}`}
                  value={primeInicial}
                  onChange={(e) => setPrimeInicial(e.target.value.replace(/[^0-9]/g, ''))}
                  className={`w-full bg-[var(--cor-superficie)] border rounded-lg px-3 py-2 text-sm fonte-mono text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)] ${
                    primeForaDaFaixa ? 'border-yellow-500/50' : 'border-[var(--cor-borda)]'
                  }`}
                />
                {primeForaDaFaixa && (
                  <p className="text-xs text-yellow-400 mt-1">
                    Fora da faixa usual ({PRIME_MIN} a {PRIME_MAX}) — confira antes de imprimir.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">Prime final</label>
                <div className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm fonte-mono text-[var(--cor-texto-secundario)]">
                  {primeFinal || '—'}
                </div>
                <p className="text-xs text-[var(--cor-texto-terciario)] mt-1">Calculado: inicial − 20%</p>
              </div>
            </div>

            <div className="mb-5">
              <label className="block text-xs font-medium text-[var(--cor-texto-secundario)] mb-1.5 uppercase tracking-wide">Data do primeiro uso</label>
              <input
                type="date"
                value={dataPrimeiroUso}
                onChange={(e) => setDataPrimeiroUso(e.target.value)}
                className="w-full bg-[var(--cor-superficie)] border border-[var(--cor-borda)] rounded-lg px-3 py-2 text-sm fonte-mono text-[var(--cor-texto-primario)] outline-none focus:border-[var(--cor-verde-agua)]"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setModalPrimeAberto(false)}
                className="flex-1 px-4 py-2.5 rounded-lg border border-[var(--cor-borda)] text-sm text-[var(--cor-texto-secundario)] hover:text-[var(--cor-texto-primario)] transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarGeracao}
                disabled={enviandoZebra || !primeInicial || !dataPrimeiroUso}
                className="flex-1 px-4 py-2.5 rounded-lg bg-[var(--cor-verde-agua)] text-black font-medium text-sm hover:bg-[var(--cor-verde-agua-claro)] transition-colors disabled:opacity-60"
              >
                {enviandoZebra ? 'Imprimindo...' : zebra ? 'Imprimir na Zebra' : 'Imprimir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {pacientesParaConfirmarTroca && (
        <ModalConfirmarTrocaCapilar
          pacientes={pacientesParaConfirmarTroca}
          dataPrimeiroUso={dataPrimeiroUso}
          onPular={pularTrocaEImprimir}
          onConfirmarTroca={confirmarTrocaEImprimir}
        />
      )}

      {etiquetasParaImprimir && (
        <div className="area-impressao-etiquetas">
          {etiquetasParaImprimir.pacientes.map((p) => (
            <EtiquetaCapilar
              key={p.id}
              paciente={p}
              primeInicial={etiquetasParaImprimir.primeInicial}
              primeFinal={etiquetasParaImprimir.primeFinal}
              dataPrimeiroUso={etiquetasParaImprimir.dataPrimeiroUso}
              onLogoCarregado={() => (logosCarregadosRef.current += 1)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
