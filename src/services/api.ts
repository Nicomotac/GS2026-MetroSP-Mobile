import { create, isAxiosError } from 'axios';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() || 'https://app-global-mobile-rm561859.azurewebsites.net';

export const api = create({
  baseURL: API_URL,
  timeout: 30000, // Azure F1 pode demorar no primeiro acesso
  headers: { 'Content-Type': 'application/json' },
});

// Token JWT da sessão atual (mantido em memória; persistido pelo authService no SecureStore).
let token: string | null = null;
let aoExpirarSessao: (() => void) | null = null;

export function definirToken(novoToken: string | null) {
  token = novoToken;
}

export function definirAoExpirarSessao(callback: (() => void) | null) {
  aoExpirarSessao = callback;
}

api.interceptors.request.use((config) => {
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const rotaAuth = String(error?.config?.url ?? '').includes('/api/auth/');
    if (error?.response?.status === 401 && token && !rotaAuth) aoExpirarSessao?.();
    return Promise.reject(error);
  },
);

/** Converte o ErroApi do backend (ou falha de rede) em mensagem para o usuário. */
export function mensagemErroApi(error: unknown): string {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      { mensagem?: string; campos?: Record<string, string> | null } | undefined;
    const campos = data?.campos ? Object.entries(data.campos) : [];
    if (campos.length) return campos.map(([campo, msg]) => `${campo}: ${msg}`).join('\n');
    if (data?.mensagem) return data.mensagem;
    const status = error.response?.status;
    if (status === 401) return 'E-mail ou senha inválidos.';
    if (status === 403) return 'Seu perfil não possui permissão para esta operação.';
    if (status === 404) return 'Registro não encontrado.';
    if (status === 409) return 'Já existe um registro com esses dados.';
    if (status === 503) return 'Serviço indisponível no momento. Tente novamente.';
    if (error.code === 'ECONNABORTED') return 'A API não respondeu no tempo esperado.';
    if (error.code === 'ERR_NETWORK')
      return 'Não foi possível conectar à API. Verifique sua conexão.';
    return 'Não foi possível concluir a operação com a API.';
  }
  return 'Não foi possível concluir a operação com a API.';
}
