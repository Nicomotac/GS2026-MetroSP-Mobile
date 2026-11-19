import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fontes } from '../theme/tema';

export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'perigo' | 'texto';
  icone?: NomeIcone;
  carregando?: boolean;
  desabilitado?: boolean;
}

const COR_TEXTO = {
  primario: cores.branco,
  secundario: cores.azul,
  perigo: cores.branco,
  texto: cores.azul,
} as const;

export function Botao({
  titulo,
  onPress,
  variante = 'primario',
  icone,
  carregando,
  desabilitado,
}: Props) {
  const bloqueado = desabilitado || carregando;
  const corTexto = COR_TEXTO[variante];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      onPress={onPress}
      disabled={bloqueado}
      style={({ pressed }) => [
        estilos.base,
        estilos[variante],
        bloqueado && estilos.bloqueado,
        pressed && estilos.pressionado,
      ]}
    >
      {carregando ? (
        <ActivityIndicator color={corTexto} />
      ) : (
        <View style={estilos.conteudo}>
          {icone && <Ionicons name={icone} size={18} color={corTexto} />}
          <Text style={[estilos.rotulo, { color: corTexto }]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: 12,
    paddingHorizontal: espaco.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: { backgroundColor: cores.azul },
  secundario: { backgroundColor: cores.cartao, borderWidth: 1.5, borderColor: cores.azul },
  perigo: { backgroundColor: cores.erro },
  texto: { backgroundColor: 'transparent', minHeight: 40 },
  bloqueado: { opacity: 0.55 },
  pressionado: { opacity: 0.8 },
  conteudo: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  rotulo: { fontSize: 15, fontFamily: fontes.semi },
});
