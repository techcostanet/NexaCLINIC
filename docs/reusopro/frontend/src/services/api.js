import axios from 'axios';

export const CHAVE_TOKEN = 'reusopro_token';
export const CHAVE_USUARIO = 'reusopro_usuario';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Any 401 (except a failed login attempt) means the session is gone:
// clear it and send the user back to the login screen.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const ehLogin = error.config?.url?.includes('/auth/login');
    if (error.response?.status === 401 && !ehLogin) {
      localStorage.removeItem(CHAVE_TOKEN);
      localStorage.removeItem(CHAVE_USUARIO);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/** Error message sent by the API, or a fallback. */
export const mensagemDeErro = (err, padrao) => err.response?.data?.erro || padrao;

export default api;
