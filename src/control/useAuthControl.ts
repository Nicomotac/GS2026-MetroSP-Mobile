import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { CadastroUsuario, Credenciais, Usuario } from '../model/Usuario';
import { authService } from '../services/authService';

const CHAVE_SESSAO = ['auth', 'session'] as const;

/** Restaura a sessão salva (token JWT válido) ao abrir o app. */
export function useSessao() {
  return useQuery({
    queryKey: CHAVE_SESSAO,
    retry: false,
    staleTime: Infinity,
    queryFn: async () => {
      try {
        return await authService.carregarSessao();
      } catch {
        await authService.sair();
        return null;
      }
    },
  });
}

export function useAcoesAuth() {
  const queryClient = useQueryClient();

  const login = useMutation({
    mutationFn: (credenciais: Credenciais) => authService.entrar(credenciais),
    onSuccess: (usuario) => queryClient.setQueryData(CHAVE_SESSAO, usuario),
  });

  const cadastro = useMutation({
    mutationFn: (dados: CadastroUsuario) => authService.cadastrar(dados),
    onSuccess: (usuario) => queryClient.setQueryData(CHAVE_SESSAO, usuario),
  });

  const logout = useMutation({
    mutationFn: authService.sair,
    onSuccess: () => {
      queryClient.setQueryData(CHAVE_SESSAO, null);
      // Limpa os dados em cache para o próximo usuário.
      queryClient.removeQueries({ predicate: (query) => query.queryKey[0] !== 'auth' });
    },
  });

  async function atualizarSessao(dados: Pick<Usuario, 'nome' | 'email'>) {
    const atual = queryClient.getQueryData<Usuario | null>(CHAVE_SESSAO);
    if (!atual) return;
    const novo = { ...atual, ...dados };
    await authService.salvarSessao(novo);
    queryClient.setQueryData(CHAVE_SESSAO, novo);
  }

  return { login, cadastro, logout, atualizarSessao };
}
