import { SOROLOGIA_ETIQUETA, LOGO_ZPL } from './etiquetaConfig';
import { formatarData } from './datas';

// ZPL (Zebra Programming Language) for the dialyzer label.
// 203 dpi ≈ 8 dots/mm (Zebra ZD230 and most desktop Zebras).
const DOTS_POR_MM = 203 / 25.4;
const mmParaDots = (mm) => Math.round(mm * DOTS_POR_MM);

// ^ and ~ are ZPL command prefixes and cannot appear inside ^FD...^FS.
const sanitizar = (texto) => String(texto ?? '').replace(/[\^~]/g, ' ');

// Long names get a smaller font so they fit on one line.
function alturaFonteNome(nome) {
  const tamanho = (nome || '').length;
  if (tamanho > 26) return 28;
  if (tamanho > 20) return 32;
  return 38;
}

const campoNormal = (x, y, altura, texto) => `^FO${x},${y}^A0N,${altura},${altura}^FD${texto}^FS`;

// Scalable font A0 has no bold; the standard trick is a 1-dot double strike.
const campoNegrito = (x, y, altura, texto) => `${campoNormal(x, y, altura, texto)}\n${campoNormal(x + 1, y, altura, texto)}`;

/**
 * Builds the ZPL for one label.
 * @param paciente  { nome, data_nascimento, nome_mae, capilar }
 * @param opcoes    { primeInicial, primeFinal, dataPrimeiroUso, tamanhoMM: { largura, altura } }
 */
export function gerarZplEtiquetaCapilar(paciente, { primeInicial, primeFinal, dataPrimeiroUso, tamanhoMM }) {
  const largura = mmParaDots(tamanhoMM.largura);
  const altura = mmParaDots(tamanhoMM.altura);
  const margem = mmParaDots(3);

  const colDireita = margem + mmParaDots(34); // serology column
  const colCapilar = colDireita + mmParaDots(8); // dialyzer model, next to serology

  const yNome = margem;
  const yNasc = yNome + 44;
  const yMae = yNasc + 26;
  const yPi = yMae + 30;
  const yPf = yPi + 36;
  const yUso = yPf + 40;

  const linhas = [
    '^XA',
    `^PW${largura}`,
    `^LL${altura}`,
    '^CI28', // UTF-8 so accents print correctly
    campoNegrito(margem, yNome, alturaFonteNome(paciente.nome), sanitizar(paciente.nome)),
    campoNegrito(margem, yNasc, 22, `DATA NASCIMENTO: ${formatarData(paciente.data_nascimento)}`),
    campoNormal(margem, yMae, 20, `MÃE: ${sanitizar(paciente.nome_mae || '-')}`),
    campoNegrito(margem, yPi, 30, `PI: ${sanitizar(primeInicial || '-')}`),
    campoNegrito(margem, yPf, 30, `PF: ${sanitizar(primeFinal || '-')}`),
    ...SOROLOGIA_ETIQUETA.map((s, i) => campoNormal(colDireita, yPi + i * 24, 20, s)),
    campoNegrito(colCapilar, yPi, 26, sanitizar(paciente.capilar || '-')),
    campoNegrito(margem, yUso, 28, `DATA PRIMEIRO USO: ${formatarData(dataPrimeiroUso)}`),
  ];

  if (LOGO_ZPL) {
    const logoX = largura - LOGO_ZPL.larguraDots - mmParaDots(2);
    linhas.push(`^FO${logoX},${yPi}${LOGO_ZPL.gfa}`);
  }

  linhas.push('^XZ');
  return linhas.join('\n');
}
