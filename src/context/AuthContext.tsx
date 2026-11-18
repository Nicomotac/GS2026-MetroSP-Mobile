import React, { createContext, type ReactNode, useContext, useEffect } from 'react';
import type { CadastroUsuario, Credenciais, Usuario } from '../model/Usuario';
import { useAcoesAuth, useSessao } from '../control/useAuthControl';
import { definirAoExpirarSessao } from '../services/api';

type AuthContextValue = {
  usuario: Usuario | null;
  carregandoSessao: boolean;
  entrando: boolean;
  cadastrando: boolean;
  entrar: (dados: Credenciais) => Promise<Usuario>;
  cadastrar: (dados: CadastroUsuario) => Promise<Usuario>;
  sair: () => Promise<void>;
  atualizarSessao: (dados: Pick<Usuario, 'nome' | 'email'>) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const sessao = useSessao();
  const { login, cadastro, logout, atualizarSessao } = useAcoesAuth();
  const { mutate: encerrarSessao, mutateAsync: encerrarSessaoAsync } = logout;
  const sair = async () => {
    await encerrarSessaoAsync();
  };

  // Token expirado (HTTP 401) encerra a sessão e volta para o login.
  useEffect(() => {
    definirAoExpirarSessao(() => encerrarSessao());
    return () => definirAoExpirarSessao(null);
  }, [encerrarSessao]);

  return (
    <AuthContext.Provider
      value={{
        usuario: sessao.data ?? null,
        carregandoSessao: sessao.isLoading,
        entrando: login.isPending,
        cadastrando: cadastro.isPending,
        entrar: login.mutateAsync,
        cadastrar: cadastro.mutateAsync,
        sair,
        atualizarSessao,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider.');
  }
  return contexto;
}
