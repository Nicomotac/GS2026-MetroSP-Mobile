import { Pressable, StyleSheet, Text } from 'react-native';
import { cores, espaco, fontes } from '../theme/tema';

interface Props {
  rotulo: string;
  ativo: boolean;
  onPress: () => void;
  cor?: string;
}

export function Chip({ rotulo, ativo, onPress, cor = cores.azul }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: ativo }}
      onPress={onPress}
      style={[estilos.chip, ativo && { backgroundColor: cor, borderColor: cor }]}
    >
      <Text style={[estilos.texto, ativo && estilos.textoAtivo]} numberOfLines={1}>
        {rotulo}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  chip: {
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.cartao,
    marginRight: espaco.sm,
    marginBottom: espaco.sm,
    maxWidth: 260,
  },
  texto: { fontSize: 13, color: cores.texto, fontFamily: fontes.medio },
  textoAtivo: { color: cores.branco },
});
