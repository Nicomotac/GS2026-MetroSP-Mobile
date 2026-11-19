import * as SecureStore from 'expo-secure-store';
import type { LoginResponse, Perfil, Sessao } from '../model/Sessao';
import { lerJwt } from '../utils/jwt';
import { api, definirToken } from './api';

const CHAVE_SESSAO = 'metrosp.sessao';

function montarSessao(resposta: LoginResponse, email: string): Sessao {
  const jwt = lerJwt(resposta.token);
  // O "sub" do JWT diz quem a pessoa é de verdade, mesmo em modo demonstração.
  let conta: Perfil = resposta.perfil;
  if (jwt?.sub?.startsWith('ADMIN:')) conta = 'ADMIN';
  if (jwt?.sub?.startsWith('USER:')) conta = 'USER';
  return {
    token: resposta.token,
    id: resposta.id,
    nome: resposta.nome,
    email,
    perfil: resposta.perfil,
    conta,
    expiraEm: jwt?.exp ? jwt.exp * 1000 : Date.now() + 60 * 60 * 1000,
  };
}

async function salvarSessao(sessao: Sessao) {
  definirToken(sessao.token);
  await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(sessao));
}

async function entrar(email: string, senha: string): Promise<Sessao> {
  const emailNormalizado = email.trim().toLowerCase();
  const { data } = await api.post<LoginResponse>('/api/auth/login', {
    email: emailNormalizado,
    senha,
  });
  const sessao = montarSessao(data, emailNormalizado);
  await salvarSessao(sessao);
  return sessao;
}

/** POST /api/auth/cadastro cria um passageiro (USER); em seguida faz o login. */
async function cadastrar(nome: string, email: string, senha: string): Promise<Sessao> {
  const emailNormalizado = email.trim().toLowerCase();
  await api.post('/api/auth/cadastro', { nome: nome.trim(), email: emailNormalizado, senha });
  return entrar(emailNormalizado, senha);
}

async function sair(): Promise<void> {
  definirToken(null);
  try {
    await SecureStore.deleteItemAsync(CHAVE_SESSAO);
  } catch {
    // nada salvo: ignorar
  }
}

/** Recupera a sessão salva; descarta se o token já venceu (ou vence em menos de 1 minuto). */
async function carregarSessao(): Promise<Sessao | null> {
  try {
    const salvo = await SecureStore.getItemAsync(CHAVE_SESSAO);
    if (!salvo) return null;
    const sessao = JSON.parse(salvo) as Sessao;
    if (!sessao.token || sessao.expiraEm <= Date.now() + 60_000) {
      await sair();
      return null;
    }
    definirToken(sessao.token);
    return sessao;
  } catch {
    await sair();
    return null;
  }
}

export const authService = { entrar, cadastrar, sair, carregarSessao };
