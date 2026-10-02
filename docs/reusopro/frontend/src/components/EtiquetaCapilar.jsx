import React from 'react';
import { formatarData } from '../utils/datas';
import { SOROLOGIA_ETIQUETA, LOGO_URL } from '../utils/etiquetaConfig';

// HTML version of the dialyzer label, used for browser printing when no Zebra
// printer is detected. Mirrors the ZPL layout in utils/zpl.js.

function tamanhoFonteNome(nome) {
  const tamanho = (nome || '').length;
  if (tamanho > 26) return '14pt';
  if (tamanho > 20) return '16pt';
  return '19pt';
}

/** Print-only CSS sized to the physical label. */
export function estilosEtiqueta({ largura, altura }) {
  return `
    @media print {
      body * { visibility: hidden; }
      .area-impressao-etiquetas, .area-impressao-etiquetas * { visibility: visible; }
      .area-impressao-etiquetas { position: absolute; top: 0; left: 0; }
      @page { size: ${largura}mm ${altura}mm; margin: 0; }
    }
    .etiqueta-capilar {
      position: relative; width: ${largura}mm; height: ${altura}mm; box-sizing: border-box;
      padding: 1.5mm 4mm; page-break-after: always; font-family: Arial, sans-serif;
      color: #000; background: #fff; overflow: hidden;
    }
    .etiqueta-logo { position: absolute; top: 16mm; right: 2mm; width: 34mm; height: auto; }
    .etiqueta-nome { font-weight: 700; line-height: 1.02; white-space: nowrap; }
    .etiqueta-linha { font-size: 10.5pt; line-height: 1.05; margin-top: 0.3mm; }
    .etiqueta-negrito { font-weight: 700; }
    .etiqueta-corpo { display: flex; justify-content: flex-start; gap: 6mm; margin-top: 0.5mm; }
    .etiqueta-prime { font-size: 13.5pt; font-weight: 700; line-height: 1.02; }
    .etiqueta-sorologia { font-size: 10.5pt; font-weight: 400; text-align: left; line-height: 1.02; }
    .etiqueta-capilar-tipo { font-size: 13pt; font-weight: 700; line-height: 1.02; align-self: center; }
    .etiqueta-uso { font-size: 13.5pt; line-height: 1.02; margin-top: 0.3mm !important; }
  `;
}

export default function EtiquetaCapilar({ paciente, primeInicial, primeFinal, dataPrimeiroUso, onLogoCarregado }) {
  return (
    <div className="etiqueta-capilar">
      {LOGO_URL && (
        <img src={LOGO_URL} alt="" className="etiqueta-logo" onLoad={onLogoCarregado} onError={onLogoCarregado} />
      )}
      <div className="etiqueta-nome" style={{ fontSize: tamanhoFonteNome(paciente.nome) }}>
        {paciente.nome}
      </div>
      <div className="etiqueta-linha etiqueta-negrito">DATA NASCIMENTO: {formatarData(paciente.data_nascimento)}</div>
      <div className="etiqueta-linha">MÃE: {paciente.nome_mae || '—'}</div>
      <div className="etiqueta-corpo">
        <div className="etiqueta-prime">
          <div>PI: {primeInicial || '—'}</div>
          <div>PF: {primeFinal || '—'}</div>
        </div>
        <div className="etiqueta-sorologia">
          {SOROLOGIA_ETIQUETA.map((s) => (
            <div key={s}>{s}</div>
          ))}
        </div>
        <div className="etiqueta-capilar-tipo">{paciente.capilar}</div>
      </div>
      <div className="etiqueta-linha etiqueta-uso etiqueta-negrito">DATA PRIMEIRO USO: {formatarData(dataPrimeiroUso)}</div>
    </div>
  );
}
