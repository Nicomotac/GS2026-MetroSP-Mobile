import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AbasParams = {
  Ocorrencias: undefined;
  Chat: { ocorrenciaId?: number } | undefined;
  Perfil: undefined;
};

export type RotasParams = {
  // Sem sessão
  Login: undefined;
  Cadastro: undefined;
  // Com sessão
  Abas: NavigatorScreenParams<AbasParams> | undefined;
  OcorrenciaDetalhe: { id: number };
  OcorrenciaForm: { id?: number } | undefined;
  // Nos dois casos
  Sobre: undefined;
};

export type TelaPilha<T extends keyof RotasParams> = NativeStackScreenProps<RotasParams, T>;

export type TelaAba<T extends keyof AbasParams> = CompositeScreenProps<
  BottomTabScreenProps<AbasParams, T>,
  NativeStackScreenProps<RotasParams>
>;
