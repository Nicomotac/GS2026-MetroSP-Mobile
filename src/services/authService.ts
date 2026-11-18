import * as SecureStore from 'expo-secure-store';
import type { CadastroUsuario, Credenciais, Perfil, Usuario } from '../model/Usuario';
import { api, definirToken } from './api';

const CHAVE_SESSAO = 'metrosp_sessao';

type LoginResponse = { token: string; tipo: string; perfil: Perfil; id: number; nome: string };

export const authService = {
  /** POST /api/auth/login — a API valida a senha e devolve JWT + perfil (ADMIN | USER). */
  async entrar({ email, senha }: Credenciais): Promise<Usuario> {
    const emailNormalizado = email.trim().toLowerCase();
    const { data } = await api.post<LoginResponse>('/api/auth/login', {
      email: emailNormalizado,
      senha,
    });
    const usuario: Usuario = {
      id: data.id,
      nome: data.nome,
      perfil: data.perfil,
      token: data.token,
      email: emailNormalizado,
    };
    await this.salvarSessao(usuario);
    return usuario;
  },

  /** POST /api/auth/cadastro — cria passageiro (USER) e já faz login. */
  async cadastrar(dados: CadastroUsuario): Promise<Usuario> {
    await api.post('/api/auth/cadastro', dados);
    return this.entrar({ email: dados.email, senha: dados.senha });
  },

  // Guarda apenas o token e os dados públicos no armazenamento seguro (nunca a senha).
  async salvarSessao(usuario: Usuario): Promise<void> {
    definirToken(usuario.token);
    await SecureStore.setItemAsync(CHAVE_SESSAO, JSON.stringify(usuario));
  },

  async carregarSessao(): Promise<Usuario | null> {
    const raw = await SecureStore.getItemAsync(CHAVE_SESSAO);
    if (!raw) return null;
    const usuario = JSON.parse(raw) as Usuario;
    if (tokenExpirado(usuario.token)) {
      await this.sair();
      return null;
    }
    definirToken(usuario.token);
    return usuario;
  },

  async sair(): Promise<void> {
    definirToken(null);
    await SecureStore.deleteItemAsync(CHAVE_SESSAO);
  },
};

/** Lê o campo exp do JWT sem depender de atob (que pode não existir no Hermes). */
function tokenExpirado(jwt: string): boolean {
  const parte = jwt.split('.')[1];
  if (!parte) return true;

  const alfabeto = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let acumulador = 0;
  let bits = 0;
  let texto = '';
  for (const caractere of parte.replace(/-/g, '+').replace(/_/g, '/').replace(/=+$/, '')) {
    const valor = alfabeto.indexOf(caractere);
    if (valor < 0) return true;
    acumulador = (acumulador << 6) | valor;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      texto += String.fromCharCode((acumulador >> bits) & 255);
    }
  }

  const expiracao = /"exp"\s*:\s*(\d+)/.exec(texto);
  if (!expiracao) return true;
  return Number(expiracao[1]) * 1000 <= Date.now();
}
