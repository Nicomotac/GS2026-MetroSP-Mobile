import axios from 'axios';
import { API_URL, TIMEOUT_PADRAO_MS } from '../config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: TIMEOUT_PADRAO_MS,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

// Token JWT da sessão atual (persistido pelo authService no SecureStore).
let token: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(novoToken: string | null) {
  token = novoToken;
}

export function definirAoExpirarSessao(callback: (() => void) | null) {
  aoExpirarSessao = callback;
}

// Rotas em que um 401 não deve derrubar a sessão:
// - login/cadastro: 401 significa senha errada;
// - chat: se a rota não existir na API publicada, a resposta pode vir como 401/404.
const ROTAS_SEM_LOGOUT = ['/api/auth/', '/login', '/api/chat'];

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = String(error?.config?.url ?? '');
    const ignorar = ROTAS_SEM_LOGOUT.some((rota) => url.startsWith(rota));
    if (error?.response?.status === 401 && token && !ignorar) aoExpirarSessao?.();
    return Promise.reject(error);
  },
);
