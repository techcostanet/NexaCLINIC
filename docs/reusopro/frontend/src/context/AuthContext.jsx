import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { CHAVE_TOKEN, CHAVE_USUARIO } from '../services/api';

const AuthContext = createContext(null);

// Session = JWT + user summary in localStorage. Token validity is enforced by
// the API; an expired token triggers the 401 interceptor in services/api.js.
export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const usuarioSalvo = localStorage.getItem(CHAVE_USUARIO);
    if (usuarioSalvo && localStorage.getItem(CHAVE_TOKEN)) setUsuario(JSON.parse(usuarioSalvo));
    setCarregando(false);
  }, []);

  async function login(username, senha) {
    const { data } = await api.post('/auth/login', { username, senha });
    localStorage.setItem(CHAVE_TOKEN, data.token);
    localStorage.setItem(CHAVE_USUARIO, JSON.stringify(data.usuario));
    setUsuario(data.usuario);
    return data.usuario;
  }

  function logout() {
    localStorage.removeItem(CHAVE_TOKEN);
    localStorage.removeItem(CHAVE_USUARIO);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, carregando, isAdmin: usuario?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
