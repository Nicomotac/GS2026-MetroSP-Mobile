import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Alert } from 'react-native';
import type { Sessao } from '../model/Sessao';
import { definirAoExpirarSessao } from '../services/api';
import { authService } from '../services/authService';

interface AuthValor {
  sessao: Sessao | null;
  carregandoSessao: boolean;
  entrar: (email: string, senha: string) => Promise<void>;
  cadastrar: (nome: string, email: string, senha: string) => Promise<void>;
  sair: () => Promise<void>;
}

const AuthContext = createContext<AuthValor | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(null);
  const [carregandoSessao, setCarregandoSessao] = useState(true);
  const expirando = useRef(false);

  useEffect(() => {
    authService
      .carregarSessao()
      .then(setSessao)
      .finally(() => setCarregandoSessao(false));
  }, []);

  const sair = useCallback(async () => {
    await authService.sair();
    setSessao(null);
  }, []);

  // HTTP 401 numa rota protegida = token vencido: volta para o login uma única vez.
  useEffect(() => {
    definirAoExpirarSessao(() => {
      if (expirando.current) return;
      expirando.current = true;
      void sair().finally(() => {
        expirando.current = false;
        Alert.alert('Sessão expirada', 'Entre novamente para continuar.');
      });
    });
    return () => definirAoExpirarSessao(null);
  }, [sair]);

  const entrar = useCallback(async (email: string, senha: string) => {
    setSessao(await authService.entrar(email, senha));
  }, []);

  const cadastrar = useCallback(async (nome: string, email: string, senha: string) => {
    setSessao(await authService.cadastrar(nome, email, senha));
  }, []);

  const valor = useMemo(
    () => ({ sessao, carregandoSessao, entrar, cadastrar, sair }),
    [sessao, carregandoSessao, entrar, cadastrar, sair],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValor {
  const contexto = useContext(AuthContext);
  if (!contexto) throw new Error('useAuth precisa estar dentro de <AuthProvider>.');
  return contexto;
}
