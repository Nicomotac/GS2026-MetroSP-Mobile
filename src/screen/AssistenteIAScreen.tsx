import React from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import StatusBadge from '../components/StatusBadge';
import Text from '../components/ThemedText';
import { useAssistenteControl } from '../control/useAssistenteControl';
import type { RootDrawerParamList } from '../navigation/navigation';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { FONTE_TITULO, MARINHO, useTema } from '../Theme/themeContext';
import { formatarDataHora } from '../utils/datas';

type Props = DrawerScreenProps<RootDrawerParamList, 'AssistenteIA'>;

export default function AssistenteIAScreen({ route }: Props) {
  const { cores } = useTema();
  const base = criarEstilosBase(cores);
  const { ocorrencias, selecionada, selecionar, perguntar, resposta, carregando, erro } =
    useAssistenteControl(route.params?.ocorrenciaId);

  return (
    <ScrollView style={base.pagina} contentContainerStyle={base.conteudo}>
      <View style={styles.hero}>
        <Text style={styles.heroTitulo}>Assistente MetroSP</Text>
        <Text style={styles.heroTexto}>
          Escolha uma ocorrência e a IA orienta como seguir viagem com base nos dados registrados.
        </Text>
      </View>

      <Text style={base.rotulo}>Ocorrência</Text>
      {ocorrencias.isLoading && <ActivityIndicator color={cores.primaria} />}
      {ocorrencias.isError && <Text style={base.erro}>{mensagemErroApi(ocorrencias.error)}</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={base.chips}>
        {(ocorrencias.data ?? []).map((o) => (
          <TouchableOpacity
            key={o.id}
            style={[base.chip, selecionada?.id === o.id && base.chipAtivo]}
            onPress={() => selecionar(o.id)}
          >
            <Text style={selecionada?.id === o.id ? base.chipTextoAtivo : undefined}>
              {o.estacao} • {o.tipoProblema}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selecionada ? (
        <View style={base.card}>
          <StatusBadge status={selecionada.status} />
          <Text style={[base.nome, { marginTop: 6 }]}>{selecionada.tipoProblema}</Text>
          <Text>{selecionada.mensagem}</Text>
          <Text style={[base.textoSecundario, { marginTop: 6 }]}>
            {selecionada.estacao} • {formatarDataHora(selecionada.dataInicio)}
          </Text>
          <TouchableOpacity
            style={[base.destaque, { marginTop: 12 }]}
            onPress={perguntar}
            disabled={carregando}
          >
            <Text style={base.destaqueTexto}>
              {carregando ? 'Consultando IA...' : 'Como devo proceder?'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={base.vazio}>Selecione uma ocorrência acima.</Text>
      )}

      {carregando && <ActivityIndicator color={cores.primaria} />}
      {!!erro && <Text style={base.erro}>{erro}</Text>}
      {resposta && (
        <View style={[base.card, { borderColor: cores.primaria, borderWidth: 2 }]}>
          <Text style={base.rotulo}>Orientação</Text>
          <Text>{resposta}</Text>
          <Text style={[base.textoSecundario, { marginTop: 10, fontSize: 12 }]}>
            Conteúdo gerado por IA. Consulte também os canais oficiais do Metrô.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: MARINHO, borderRadius: 16, padding: 18, marginBottom: 16 },
  heroTitulo: { color: '#fff', fontSize: 22, fontFamily: FONTE_TITULO },
  heroTexto: { color: '#C9D4EE', marginTop: 4 },
});
