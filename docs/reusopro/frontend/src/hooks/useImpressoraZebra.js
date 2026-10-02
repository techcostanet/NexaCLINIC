import { useEffect, useState } from 'react';

/**
 * Detects the default Zebra printer through "Zebra Browser Print" (free local
 * agent from Zebra). Requires its SDK file (BrowserPrint-3.x.min.js, shipped
 * with the installer) to be copied to public/browserprint.js.
 *
 * Returns `dispositivo` (null when not detected) and `enviarZpl(lista)`, which
 * sends each ZPL string sequentially and resolves when all are printed.
 */
export function useImpressoraZebra() {
  const [dispositivo, setDispositivo] = useState(null);

  useEffect(() => {
    let cancelado = false;

    function detectar() {
      if (cancelado || !window.BrowserPrint) return;
      window.BrowserPrint.getDefaultDevice(
        'printer',
        (device) => !cancelado && device && setDispositivo(device),
        () => {}
      );
    }

    if (window.BrowserPrint) {
      detectar();
    } else {
      const script = document.createElement('script');
      script.src = '/browserprint.js';
      script.async = true;
      script.onload = detectar;
      document.body.appendChild(script);
    }

    return () => {
      cancelado = true;
    };
  }, []);

  /** @param {{ zpl: string, rotulo: string }[]} trabalhos */
  async function enviarZpl(trabalhos) {
    for (const { zpl, rotulo } of trabalhos) {
      await new Promise((resolve, reject) =>
        dispositivo.send(zpl, resolve, (erro) => reject(new Error(`Falha ao imprimir a etiqueta de ${rotulo}: ${erro}`)))
      );
    }
  }

  return { dispositivo, enviarZpl };
}
