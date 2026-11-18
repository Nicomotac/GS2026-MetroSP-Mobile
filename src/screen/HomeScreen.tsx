import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import Text from '../components/ThemedText';
import { useAuth } from '../context/AuthContext';
import { useEstacoes } from '../control/useEstacaoControl';
import { useOcorrencias } from '../control/useOcorrenciaControl';
import { STATUS_OCORRENCIA } from '../model/Ocorrencia';
import type { RootDrawerParamList } from '../navigation/navigation';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { FONTE_TITULO, MARINHO, useTema } from '../Theme/themeContext';
import { formatarDataHora } from '../utils/datas';

type Props = DrawerScreenProps<RootDrawerParamList, 'Home'>;

export default function HomeScreen({ navigation }: Props) {
  const { usuario } = useAuth();
  const { cores } = useTema();
  const base = criarEstilosBase(cores);
  const ocorrencias = useOcorrencias();
  const estacoes = useEstacoes();
  const admin = usuario?.perfil === 'ADMIN';
  const lista = ocorrencias.data ?? [];

  return (
    <ScrollView
      style={base.pagina}
      contentContainerStyle={base.conteudo}
      refreshControl={
        <RefreshControl
          refreshing={ocorrencias.isFetching}
          onRefresh={() => {
            void ocorrencias.refetch();
            void estacoes.refetch();
          }}
        />
      }
    >
      <View style={styles.hero}>
        <Text style={styles.ola}>Olá, {usuario?.nome?.split(' ')[0]}!</Text>
        <Text style={styles.heroTexto}>
          {admin
            ? 'Central de operações: registre e acompanhe as ocorrências das estações.'
            : 'Veja o que está acontecendo nas estações antes de sair de casa.'}
        </Text>
      </View>

      <View style={styles.resumo}>
        {STATUS_OCORRENCIA.map((status) => (
          <View key={status.valor} style={[styles.indicador, { borderColor: status.cor }]}>
            <Text style={[styles.numero, { color: status.cor }]}>
              {lista.filter((o) => o.status === status.valor).length}
            </Text>
            <Text style={base.textoSecundario}>{status.rotulo}</Text>
          </View>
        ))}
      </View>
      {admin && (
        <Text style={[base.textoSecundario, { marginBottom: 12 }]}>
          {estacoes.data?.length ?? 0} estações cadastradas
        </Text>
      )}

      <View style={base.acoes}>
        <TouchableOpacity
          style={[base.destaque, styles.flex]}
          onPress={() => navigation.navigate('Ocorrencias')}
        >
          <Text style={base.destaqueTexto}>
            {admin ? 'Registrar ocorrência' : 'Ver ocorrências'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[base.primario, styles.flex]}
          onPress={() => navigation.navigate('AssistenteIA')}
        >
          <Text style={base.botaoTexto}>Assistente IA</Text>
        </TouchableOpacity>
      </View>

      <Text style={[base.subtitulo, { marginTop: 20 }]}>Últimas ocorrências</Text>
      {ocorrencias.isLoading && <Loading />}
      {ocorrencias.isError && <Text style={base.erro}>{mensagemErroApi(ocorrencias.error)}</Text>}
      {!ocorrencias.isLoading && !ocorrencias.isError && lista.length === 0 && (
        <Text style={base.vazio}>
          Nenhuma ocorrência registrada. Estações operando normalmente.
        </Text>
      )}
      {lista.slice(0, 5).map((item) => (
        <TouchableOpacity
          key={item.id}
          style={base.card}
          onPress={() => navigation.navigate('AssistenteIA', { ocorrenciaId: item.id })}
        >
          <StatusBadge status={item.status} />
          <Text style={[base.nome, { marginTop: 6 }]}>{item.tipoProblema}</Text>
          <Text style={base.textoSecundario}>
            {item.estacao} • {formatarDataHora(item.dataInicio)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  hero: { backgroundColor: MARINHO, borderRadius: 16, padding: 18, marginBottom: 14 },
  ola: { color: '#fff', fontSize: 24, fontFamily: FONTE_TITULO },
  heroTexto: { color: '#C9D4EE', marginTop: 4 },
  resumo: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  indicador: { flex: 1, borderWidth: 2, borderRadius: 12, padding: 10, alignItems: 'center' },
  numero: { fontSize: 24, fontFamily: FONTE_TITULO },
});
