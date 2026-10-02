import { useEffect, useState } from 'react';

const CHAVE_STORAGE = 'reusopro_tema';

function lerTemaSalvo() {
  try {
    return localStorage.getItem(CHAVE_STORAGE) || 'dark';
  } catch {
    return 'dark';
  }
}

/** Dark/light theme persisted in localStorage and applied as [data-theme] on <html>. */
export function useTema() {
  const [tema, setTema] = useState(lerTemaSalvo);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', tema);
    try {
      localStorage.setItem(CHAVE_STORAGE, tema);
    } catch {
      // storage unavailable (private mode): theme just isn't persisted
    }
  }, [tema]);

  const alternarTema = () => setTema((atual) => (atual === 'dark' ? 'light' : 'dark'));

  return { tema, alternarTema };
}
