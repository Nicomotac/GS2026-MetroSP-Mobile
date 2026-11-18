import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ModoTema = 'sistema' | 'claro' | 'escuro';
export type Cores = {
  fundo: string;
  superficie: string;
  fundoSecundario: string;
  texto: string;
  textoSecundario: string;
  borda: string;
  primaria: string;
  destaque: string;
  perigo: string;
  sucesso: string;
  alerta: string;
};

// Identidade MetroSP: azul-marinho, azul da Linha 1 e amarelo de destaque.
export const MARINHO = '#0B1F4D';
export const AMARELO = '#FFC72C';
export const FONTE_TITULO = 'Poppins_700Bold';
export const FONTE_MEDIA = 'Poppins_500Medium';

const claras: Cores = {
  fundo: '#F3F5FA',
  superficie: '#FFFFFF',
  fundoSecundario: '#E8ECF5',
  texto: '#14213D',
  textoSecundario: '#5B6680',
  borda: '#D5DBE8',
  primaria: '#0455A1',
  destaque: AMARELO,
  perigo: '#C62828',
  sucesso: '#0F8A5F',
  alerta: '#B26A00',
};
const escuras: Cores = {
  fundo: '#0A1330',
  superficie: '#14224A',
  fundoSecundario: '#1F3060',
  texto: '#F3F5FA',
  textoSecundario: '#B9C3DD',
  borda: '#2C3E72',
  primaria: '#5EA8F2',
  destaque: AMARELO,
  perigo: '#F87171',
  sucesso: '#34D399',
  alerta: '#FBBF24',
};

/** Cores das linhas do Metrô de São Paulo. */
export const CORES_LINHAS: Record<string, string> = {
  azul: '#0455A1',
  verde: '#007E5E',
  vermelha: '#EE372F',
  amarela: '#FFD100',
  lilás: '#A05EB5',
  lilas: '#A05EB5',
  prata: '#9EA1A3',
};

export function corDaLinha(linha?: string | null): string {
  return CORES_LINHAS[(linha ?? '').trim().toLowerCase()] ?? '#0455A1';
}

type TemaContexto = {
  modo: ModoTema;
  modoEfetivo: 'claro' | 'escuro';
  cores: Cores;
  definirModo: (modo: ModoTema) => void;
};

const TemaContext = createContext<TemaContexto | null>(null);
const CHAVE_TEMA = '@metrosp_tema';

export function TemaProvider({ children }: { children: React.ReactNode }) {
  const preferenciaSO = useColorScheme();
  const [modo, setModo] = useState<ModoTema>('sistema');

  useEffect(() => {
    AsyncStorage.getItem(CHAVE_TEMA)
      .then((salvo) => {
        if (salvo === 'claro' || salvo === 'escuro' || salvo === 'sistema') setModo(salvo);
      })
      .catch(() => {});
  }, []);

  const valor = useMemo(() => {
    const modoEfetivo: 'claro' | 'escuro' =
      modo === 'sistema' ? (preferenciaSO === 'dark' ? 'escuro' : 'claro') : modo;
    const definirModo = (novoModo: ModoTema) => {
      setModo(novoModo);
      AsyncStorage.setItem(CHAVE_TEMA, novoModo).catch(() => {});
    };
    return { modo, modoEfetivo, cores: modoEfetivo === 'escuro' ? escuras : claras, definirModo };
  }, [modo, preferenciaSO]);

  return <TemaContext.Provider value={valor}>{children}</TemaContext.Provider>;
}

export function useTema() {
  const tema = useContext(TemaContext);
  if (!tema) throw new Error('useTema deve ser utilizado dentro de TemaProvider.');
  return tema;
}
