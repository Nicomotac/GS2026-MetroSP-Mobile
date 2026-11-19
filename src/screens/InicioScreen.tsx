import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { CartaoOcorrencia } from '../components/CartaoOcorrencia';
import { Carregando, ErroTela } from '../components/EstadoTela';
import { useAuth } from '../context/AuthContext';
import { useCarregamento } from '../hooks/useCarregamento';
import { STATUS_OCORRENCIA } from '../model/Ocorrencia';
import type { TelaAba } from '../navigation/tipos';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { cores, espaco, estilosBase, fontes } from '../theme/tema';

/** Painel inicial: resumo das ocorrências por status, atalhos e últimas registradas. */
export function InicioScreen({ navigation }: TelaAba<'Inicio'>) {
  const { sessao } = useAuth();
  const ocorrencias = useCarregamento(ocorrenciaService.listar);
  const primeiroNome = sessao?.nome.trim().split(/\s+/)[0] ?? '';

  const totais = useMemo(
    () =>
      STATUS_OCORRENCIA.map((s) => ({
        ...s,
        total: (ocorrencias.dados ?? []).filter((o) => o.status === s.valor).length,
      })),
    [ocorrencias.dados],
  );

  if (ocorrencias.carregando && !ocorrencias.dados) {
    return <Carregando texto="Montando o painel..." />;
  }
  if (ocorrencias.erro && !ocorrencias.dados) {
    return <ErroTela mensagem={ocorrencias.erro} aoTentarDeNovo={ocorrencias.tentarDeNovo} />;
  }

  const recentes = (ocorrencias.dados ?? []).slice(0, 3);

  return (
    <ScrollView
      style={estilosBase.tela}
      contentContainerStyle={estilosBase.conteudo}
      refreshControl={
        <RefreshControl refreshing={ocorrencias.atualizando} onRefresh={ocorrencias.atualizar} />
      }
    >
      <View style={estilos.boasVindas}>
        <Image
          source={require('../../assets/logo.png')}
          style={estilos.logo}
          accessibilityIgnoresInvertColors
        />
        <View style={estilos.flex}>
          <Text style={estilos.ola}>Olá, {primeiroNome}!</Text>
          <Text style={estilos.legenda}>Acompanhe a situação das estações do metrô.</Text>
        </View>
      </View>

      <View style={estilos.resumo} accessibilityRole="summary">
        {totais.map((s) => (
          <View
            key={s.valor}
            style={[estilos.cartaoResumo, { borderTopColor: s.cor }]}
            accessible
            accessibilityLabel={`${s.total} ocorrências ${s.rotulo.toLowerCase()}`}
          >
            <Text style={[estilos.numero, { color: s.cor }]}>{s.total}</Text>
            <Text style={estilos.rotuloResumo}>{s.rotulo}</Text>
          </View>
        ))}
      </View>

      <View style={estilosBase.cartao}>
        <Text style={estilosBase.subtitulo}>Atalhos</Text>
        <Botao
          titulo="Registrar ocorrência"
          icone="add-circle-outline"
          onPress={() => navigation.navigate('OcorrenciaForm')}
        />
        <Botao
          titulo="Ver estações"
          icone="train-outline"
          variante="secundario"
          onPress={() => navigation.navigate('Estacoes')}
        />
        <Botao
          titulo="Perguntar ao chatbot"
          icone="chatbubbles-outline"
          variante="secundario"
          onPress={() => navigation.navigate('Chat')}
        />
      </View>

      <View style={estilos.cabecalhoSecao}>
        <Text style={estilosBase.subtitulo}>Últimas ocorrências</Text>
        <Botao
          titulo="Ver todas"
          variante="texto"
          onPress={() => navigation.navigate('Ocorrencias')}
        />
      </View>
      {recentes.length === 0 ? (
        <View style={[estilosBase.cartao, estilos.vazio]}>
          <Ionicons name="checkmark-circle-outline" size={32} color={cores.sucesso} />
          <Text style={estilosBase.textoSecundario}>Nenhuma ocorrência registrada.</Text>
        </View>
      ) : (
        recentes.map((o) => (
          <CartaoOcorrencia
            key={o.id}
            ocorrencia={o}
            compacto
            onPress={() => navigation.navigate('OcorrenciaDetalhe', { id: o.id })}
          />
        ))
      )}
      {!!ocorrencias.erro && <Text style={estilosBase.erro}>{ocorrencias.erro}</Text>}
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  boasVindas: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: espaco.md,
    backgroundColor: cores.primaria,
    borderRadius: 16,
    padding: espaco.lg,
  },
  logo: { width: 56, height: 56, borderRadius: 14, backgroundColor: cores.branco },
  ola: { fontSize: 20, fontFamily: fontes.negrito, color: cores.branco },
  legenda: { fontSize: 13, fontFamily: fontes.regular, color: '#C9D3EA' },
  resumo: { flexDirection: 'row', gap: espaco.sm },
  cartaoResumo: {
    flex: 1,
    backgroundColor: cores.cartao,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: cores.borda,
    borderTopWidth: 4,
    paddingVertical: espaco.md,
    alignItems: 'center',
  },
  numero: { fontSize: 26, fontFamily: fontes.negrito },
  rotuloResumo: {
    fontSize: 12,
    fontFamily: fontes.medio,
    color: cores.textoSecundario,
    textAlign: 'center',
  },
  cabecalhoSecao: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  vazio: { alignItems: 'center' },
});
