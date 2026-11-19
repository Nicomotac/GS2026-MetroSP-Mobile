import { StyleSheet, Text, View } from 'react-native';
import { infoStatus } from '../model/Ocorrencia';
import { fontes } from '../theme/tema';

export function StatusBadge({ status }: { status: string }) {
  const info = infoStatus(status);
  return (
    <View style={[estilos.badge, { backgroundColor: `${info.cor}1A`, borderColor: info.cor }]}>
      <Text style={[estilos.texto, { color: info.cor }]}>{info.rotulo}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
  },
  texto: { fontSize: 12, fontFamily: fontes.semi },
});
