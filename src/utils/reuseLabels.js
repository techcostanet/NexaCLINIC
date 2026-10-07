// ============================================================
// Utilitários de Etiquetas e Impressão Térmica — Módulo .REUSE
// ============================================================

import QRCode from 'qrcode';

/** Tamanho padrão de etiqueta para bobina Zebra (102 x 44 mm) */
export const TAMANHO_ETIQUETA_PADRAO = { largura: 102, altura: 44 };

/** Sorologias padrão regulamentares impressas no cabeçalho da etiqueta */
export const SOROLOGIA_ETIQUETA = ['HCV-', 'HIV-', 'ANTI HBS+'];

const DOTS_POR_MM = 203 / 25.4; // 203 DPI ≈ 8 dots/mm
const mmParaDots = (mm) => Math.round(mm * DOTS_POR_MM);

const sanitizar = (texto) => String(texto ?? '').replace(/[\^~]/g, ' ');

function alturaFonteNome(nome) {
  const tamanho = (nome || '').length;
  if (tamanho > 26) return 28;
  if (tamanho > 20) return 32;
  return 38;
}

const campoNormal = (x, y, altura, texto) => `^FO${x},${y}^A0N,${altura},${altura}^FD${texto}^FS`;
const campoNegrito = (x, y, altura, texto) => `${campoNormal(x, y, altura, texto)}\n${campoNormal(x + 1, y, altura, texto)}`;

/** Formatação de data no padrão DD/MM/AAAA */
export function formatarDataBr(dataIso) {
  if (!dataIso) return '—';
  if (typeof dataIso === 'string' && dataIso.includes('-')) {
    const [ano, mes, dia] = dataIso.split('T')[0].split('-');
    if (ano && mes && dia) return `${dia}/${mes}/${ano}`;
  }
  try {
    const d = new Date(dataIso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString('pt-BR');
  } catch {
    return '—';
  }
}

/**
 * Geração de código ZPL para impressoras Zebra ZD230/ZD220 ou compatíveis
 * Inclui Código de Barras Code-128 (SM-010) para leitura direta na bancada de reuso
 */
export function gerarZplEtiquetaCapilar(paciente, { primeInicial, primeFinal, dataPrimeiroUso, tamanhoMM = TAMANHO_ETIQUETA_PADRAO }) {
  const largura = mmParaDots(tamanhoMM.largura);
  const altura = mmParaDots(tamanhoMM.altura);
  const margem = mmParaDots(3);

  const colDireita = margem + mmParaDots(34);
  const colCapilar = colDireita + mmParaDots(12);

  const yNome = margem;
  const yNasc = yNome + 42;
  const yMae = yNasc + 24;
  const yPi = yMae + 28;
  const yPf = yPi + 32;
  const yUso = yPf + 36;
  const yBarcode = yUso + 38;

  const codigoIdentificador = sanitizar(paciente.codigo_barras || paciente.id || `PAT-${paciente.reuso_atual || 0}`);

  const linhas = [
    '^XA',
    `^PW${largura}`,
    `^LL${altura}`,
    '^CI28', // UTF-8
    campoNegrito(margem, yNome, alturaFonteNome(paciente.nome), sanitizar(paciente.nome)),
    campoNegrito(margem, yNasc, 22, `DATA NASCIMENTO: ${formatarDataBr(paciente.data_nascimento || paciente.birthDate)}`),
    campoNormal(margem, yMae, 20, `MÃE: ${sanitizar(paciente.nome_mae || paciente.motherName || '-')}`),
    campoNegrito(margem, yPi, 28, `PI: ${sanitizar(primeInicial || '-')}`),
    campoNegrito(margem, yPf, 28, `PF: ${sanitizar(primeFinal || '-')}`),
    ...SOROLOGIA_ETIQUETA.map((s, i) => campoNormal(colDireita, yPi + i * 22, 19, s)),
    campoNegrito(colCapilar, yPi, 26, sanitizar(paciente.capilar || '-')),
    campoNegrito(margem, yUso, 24, `DATA PRIMEIRO USO: ${formatarDataBr(dataPrimeiroUso)}`),
    // Código de Barras Code-128 para escaneamento rápido na bancada (SM-010)
    `^FO${margem},${yBarcode}^BY2,2,40^BCN,40,Y,N,N^FD${codigoIdentificador}^FS`,
    '^XZ'
  ];

  return linhas.join('\n');
}

/**
 * Gera DataURL do QR Code com o ID do paciente e dados do capilar (SM-010)
 */
export async function gerarQrCodeDataUrl(paciente) {
  try {
    const payload = JSON.stringify({
      id: paciente.id,
      nome: paciente.nome,
      capilar: paciente.capilar,
      reuso: paciente.reuso_atual || 0
    });
    return await QRCode.toDataURL(payload, { width: 120, margin: 1 });
  } catch (err) {
    console.error('Erro ao gerar QRCode:', err);
    return null;
  }
}

/**
 * Estilos CSS para impressão de etiquetas via navegador
 */
export function estilosEtiqueta({ largura = 102, altura = 44 }) {
  return `
    @media print {
      body * { visibility: hidden !important; }
      .area-impressao-etiquetas, .area-impressao-etiquetas * { visibility: visible !important; }
      .area-impressao-etiquetas { position: absolute; top: 0; left: 0; width: 100%; }
      @page { size: ${largura}mm ${altura}mm; margin: 0; }
    }
    .etiqueta-capilar-card {
      position: relative;
      width: ${largura}mm;
      height: ${altura}mm;
      box-sizing: border-box;
      padding: 2mm 3.5mm;
      page-break-after: always;
      font-family: Arial, Helvetica, sans-serif;
      color: #000;
      background: #fff;
      overflow: hidden;
      border: 1px dashed #cbd5e1;
    }
    @media print {
      .etiqueta-capilar-card { border: none !important; }
    }
  `;
}
