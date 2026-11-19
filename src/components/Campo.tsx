import { StyleSheet, Text, TextInput, type TextInputProps, View } from 'react-native';
import { cores, espaco } from '../theme/tema';

interface Props extends TextInputProps {
  rotulo: string;
  dica?: string;
}

export function Campo({ rotulo, dica, style, multiline, ...props }: Props) {
  return (
    <View style={estilos.bloco}>
      <Text style={estilos.rotulo}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={cores.textoSecundario}
        multiline={multiline}
        style={[estilos.input, multiline && estilos.multilinha, style]}
        {...props}
      />
      {!!dica && <Text style={estilos.dica}>{dica}</Text>}
    </View>
  );
}

const estilos = StyleSheet.create({
  bloco: { gap: espaco.xs },
  rotulo: { fontSize: 13, fontWeight: '600', color: cores.textoSecundario },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 12,
    paddingHorizontal: espaco.md,
    paddingVertical: espaco.sm,
    backgroundColor: cores.cartao,
    fontSize: 15,
    color: cores.texto,
  },
  multilinha: { minHeight: 110, textAlignVertical: 'top' },
  dica: { fontSize: 12, color: cores.textoSecundario },
});
