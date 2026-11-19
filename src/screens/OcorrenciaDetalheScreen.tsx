import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao } from '../components/Botao';
import { Carregando, ErroTela } from '../components/EstadoTela';
import { StatusBadge } from '../components/StatusBadge';
import { useCarregamento } from '../hooks/useCarregamento';
import { MENSAGEM_SEM_PERMISSAO } from '../hooks/useOcorrenciaForm';
import type { TelaPilha } from '../navigation/tipos';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { cores, espaco, estilosBase } from '../theme/tema';
import { formatarDataApi } from '../utils/datas';
import { mensagemErro, statusHttp } from '../utils/erros';

export function OcorrenciaDetalheScreen({ navigation, route }: TelaPilha<'OcorrenciaDetalhe'>) {
  const { id } = route.params;
  const insets = useSafeAreaInsets();
  const buscar = useCallback(() => ocorrenciaService.buscar(id), [id]);
  const ocorrencia = useCarregamento(buscar, id);
  const [excluindo, setExcluindo] = useState(false);
  const [orientacao, setOrientacao] = useState<string | null>(null);
  const [erroOrientacao, setErroOrientacao] = useState<string | null>(null);
  const [buscandoOrientacao, setBuscandoOrientacao] = useState(false);

  useEffect(() => {
    navigation.setOptions({ title: `Ocorrência #${id}` });
  }, [navigation, id]);

  async function pedirOrientacao() {
    setBuscandoOrientacao(true);
    setErroOrientacao(null);
    try {
      const resposta = await ocorrenciaService.orientacao(id);
      setOrientacao(resposta.orientacao);
    } catch (error) {
      setErroOrientacao(mensagemErro(error));
    } finally {
      setBuscandoOrientacao(false);
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir ocorrência?', `A ocorrência #${id} será removida do banco de dados.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => void excluir() },
    ]);
  }

  async function excluir() {
    setExcluindo(true);
    try {
      await ocorrenciaService.excluir(id);
      Alert.alert('Ocorrência excluída', `A ocorrência #${id} foi removida.`);
      navigation.goBack();
    } catch (error) {
      setExcluindo(false);
      Alert.alert('Não foi possível excluir', statusHttp(error) === 403 ? MENSAGEM_SEM_PERMISSAO : mensagemErro(error));
    }
  }

  if (ocorrencia.carregando && !ocorrencia.dados) return <Carregando />;
  if (!ocorrencia.dados) {
    return <ErroTela mensagem={ocorrencia.erro ?? 'Ocorrência não encontrada.'} aoTentarDeNovo={ocorrencia.tentarDeNovo} />;
  }
  const o = ocorrencia.dados;

  return (
    <ScrollView
      style={estilosBase.tela}
      contentContainerStyle={[estilosBase.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
    >
      <View style={estilosBase.cartao}>
        <StatusBadge status={o.status} />
        <Text style={estilosBase.titulo}>{o.tipoProblema}</Text>
        <Text style={estilosBase.texto}>{o.mensagem}</Text>
        <Info rotulo="Estação" valor={o.estacao} />
        <Info rotulo="Responsável" valor={o.funcionario} />
        <Info rotulo="Início" valor={formatarDataApi(o.dataInicio)} />
        <Info rotulo="Encerramento" valor={o.dataFim ? formatarDataApi(o.dataFim) : 'Em aberto'} />
      </View>

      <View style={estilosBase.cartao}>
        <Text style={estilosBase.subtitulo}>Orientação da IA</Text>
        {buscandoOrientacao && <ActivityIndicator color={cores.azul} />}
        {!!orientacao && <Text style={estilosBase.texto}>{orientacao}</Text>}
        {!!erroOrientacao && <Text style={estilosBase.erro}>{erroOrientacao}</Text>}
        <Botao
          titulo={orientacao ? 'Gerar de novo' : 'Pedir orientação'}
          icone="sparkles-outline"
          variante="secundario"
          desabilitado={buscandoOrientacao}
          onPress={() => void pedirOrientacao()}
        />
        <Botao
          titulo="Conversar com o chatbot sobre ela"
          icone="chatbubbles-outline"
          variante="texto"
          onPress={() => navigation.navigate('Abas', { screen: 'Chat', params: { ocorrenciaId: o.id } })}
        />
      </View>

      <Botao titulo="Editar" icone="create-outline" onPress={() => navigation.navigate('OcorrenciaForm', { id: o.id })} />
      <Botao titulo="Excluir" icone="trash-outline" variante="perigo" carregando={excluindo} onPress={confirmarExclusao} />
      {!!ocorrencia.erro && <Text style={estilosBase.erro}>{ocorrencia.erro}</Text>}
    </ScrollView>
  );
}

function Info({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.info}>
      <Text style={estilosBase.rotulo}>{rotulo}</Text>
      <Text style={estilosBase.texto}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  info: { gap: 2 },
});
