import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { infoStatus, type Ocorrencia } from '../model/Ocorrencia';
import { cores, espaco, estilosBase } from '../theme/tema';
import { formatarDataApi } from '../utils/datas';
import { StatusBadge } from './StatusBadge';

interface Props {
  ocorrencia: Ocorrencia;
  onPress: () => void;
  /** Versão curta, usada no painel inicial. */
  compacto?: boolean;
}

export function CartaoOcorrencia({ ocorrencia, onPress, compacto }: Props) {
  const status = infoStatus(ocorrencia.status).rotulo;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${ocorrencia.tipoProblema} na estação ${ocorrencia.estacao}, ${status}`}
      accessibilityHint="Abre os detalhes da ocorrência"
      style={({ pressed }) => [estilosBase.cartao, pressed && estilos.pressionado]}
    >
      <View style={estilos.cabecalho}>
        <Text style={[estilosBase.subtitulo, estilos.flex]} numberOfLines={1}>
          {ocorrencia.tipoProblema}
        </Text>
        <StatusBadge status={ocorrencia.status} />
      </View>
      {!compacto && (
        <Text style={estilosBase.texto} numberOfLines={2}>
          {ocorrencia.mensagem}
        </Text>
      )}
      <View style={estilos.linhaInfo}>
        <Ionicons name="train-outline" size={14} color={cores.textoSecundario} />
        <Text style={estilosBase.textoSecundario}>{ocorrencia.estacao}</Text>
        <Ionicons name="time-outline" size={14} color={cores.textoSecundario} />
        <Text style={estilosBase.textoSecundario}>{formatarDataApi(ocorrencia.dataInicio)}</Text>
      </View>
      {!compacto && (
        <Text style={estilosBase.textoSecundario}>
          #{ocorrencia.id} · Responsável: {ocorrencia.funcionario}
        </Text>
      )}
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  pressionado: { opacity: 0.85 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm },
  linhaInfo: { flexDirection: 'row', alignItems: 'center', gap: espaco.xs, flexWrap: 'wrap' },
});
