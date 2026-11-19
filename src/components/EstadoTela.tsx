import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { cores, espaco, fontes } from '../theme/tema';
import { Botao, type NomeIcone } from './Botao';

export function Carregando({ texto = 'Carregando...' }: { texto?: string }) {
  return (
    <View style={estilos.centro}>
      <ActivityIndicator size="large" color={cores.azul} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

export function ErroTela({
  mensagem,
  aoTentarDeNovo,
}: {
  mensagem: string;
  aoTentarDeNovo: () => void;
}) {
  return (
    <View style={estilos.centro}>
      <Ionicons name="cloud-offline-outline" size={44} color={cores.erro} />
      <Text style={[estilos.texto, estilos.erro]}>{mensagem}</Text>
      <Botao
        titulo="Tentar de novo"
        icone="refresh"
        variante="secundario"
        onPress={aoTentarDeNovo}
      />
    </View>
  );
}

export function Vazio({
  texto,
  icone = 'file-tray-outline',
}: {
  texto: string;
  icone?: NomeIcone;
}) {
  return (
    <View style={estilos.centro}>
      <Ionicons name={icone} size={44} color={cores.textoSecundario} />
      <Text style={estilos.texto}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  centro: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: espaco.xl,
    gap: espaco.md,
  },
  texto: {
    fontSize: 15,
    fontFamily: fontes.regular,
    color: cores.textoSecundario,
    textAlign: 'center',
    lineHeight: 22,
  },
  erro: { color: cores.erro },
});
