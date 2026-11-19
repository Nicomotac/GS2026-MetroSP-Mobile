import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { CartaoOcorrencia } from '../components/CartaoOcorrencia';
import { Chip } from '../components/Chip';
import { Carregando, ErroTela, Vazio } from '../components/EstadoTela';
import { useCarregamento } from '../hooks/useCarregamento';
import type { TelaAba } from '../navigation/tipos';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { cores, espaco, estilosBase } from '../theme/tema';

export function OcorrenciasScreen({ navigation, route }: TelaAba<'Ocorrencias'>) {
  const lista = useCarregamento(ocorrenciaService.listar);
  const [filtroEstacao, setFiltroEstacao] = useState<number | null>(null);
  const [estacaoEscolhida, setEstacaoEscolhida] = useState<{ id: number; nome: string } | null>(
    null,
  );
  const estacaoParametro = route.params?.estacaoId;
  const nomeParametro = route.params?.estacaoNome;

  const [parametroAplicado, setParametroAplicado] = useState<number | undefined>(undefined);

  // Vindo da tela de Estações: aplica o filtro uma vez por navegação.
  if (estacaoParametro !== parametroAplicado) {
    setParametroAplicado(estacaoParametro);
    if (estacaoParametro !== undefined) {
      setFiltroEstacao(estacaoParametro);
      if (nomeParametro) setEstacaoEscolhida({ id: estacaoParametro, nome: nomeParametro });
    }
  }

  // Limpa o parâmetro para a mesma estação poder ser escolhida de novo depois.
  useEffect(() => {
    if (estacaoParametro !== undefined) {
      navigation.setParams({ estacaoId: undefined, estacaoNome: undefined });
    }
  }, [estacaoParametro, navigation]);

  // Filtro: estações que têm ocorrência + a estação escolhida na tela de Estações.
  const estacoes = useMemo(() => {
    const mapa = new Map<number, string>();
    (lista.dados ?? []).forEach((o) => mapa.set(o.estacaoId, o.estacao));
    if (estacaoEscolhida && !mapa.has(estacaoEscolhida.id)) {
      mapa.set(estacaoEscolhida.id, estacaoEscolhida.nome);
    }
    return [...mapa.entries()].sort((a, b) => a[1].localeCompare(b[1]));
  }, [lista.dados, estacaoEscolhida]);

  const visiveis = useMemo(
    () =>
      (lista.dados ?? []).filter((o) => filtroEstacao === null || o.estacaoId === filtroEstacao),
    [lista.dados, filtroEstacao],
  );

  if (lista.carregando && !lista.dados)
    return <Carregando texto="Buscando ocorrências na API..." />;
  if (lista.erro && !lista.dados) {
    return <ErroTela mensagem={lista.erro} aoTentarDeNovo={lista.tentarDeNovo} />;
  }

  return (
    <View style={estilosBase.tela}>
      {(estacoes.length > 1 || filtroEstacao !== null) && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={estilos.filtros}
        >
          <Chip
            rotulo="Todas"
            ativo={filtroEstacao === null}
            onPress={() => setFiltroEstacao(null)}
          />
          {estacoes.map(([id, nome]) => (
            <Chip
              key={id}
              rotulo={nome}
              ativo={filtroEstacao === id}
              onPress={() => setFiltroEstacao(id)}
            />
          ))}
        </ScrollView>
      )}

      {!!lista.erro && <Text style={[estilosBase.erro, estilos.erroTopo]}>{lista.erro}</Text>}

      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={visiveis.length ? estilos.lista : estilos.listaVazia}
        refreshControl={
          <RefreshControl refreshing={lista.atualizando} onRefresh={lista.atualizar} />
        }
        ListEmptyComponent={
          <Vazio
            texto={
              filtroEstacao === null
                ? 'Nenhuma ocorrência registrada. Toque no + para registrar a primeira.'
                : 'Nenhuma ocorrência nesta estação.'
            }
          />
        }
        renderItem={({ item }) => (
          <CartaoOcorrencia
            ocorrencia={item}
            onPress={() => navigation.navigate('OcorrenciaDetalhe', { id: item.id })}
          />
        )}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Registrar ocorrência"
        style={({ pressed }) => [estilos.botaoNovo, pressed && { opacity: 0.85 }]}
        onPress={() =>
          navigation.navigate('OcorrenciaForm', filtroEstacao ? { estacaoId: filtroEstacao } : {})
        }
      >
        <Ionicons name="add" size={30} color={cores.branco} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  filtros: { paddingHorizontal: espaco.lg, paddingTop: espaco.md },
  erroTopo: { marginHorizontal: espaco.lg, marginTop: espaco.sm },
  lista: { padding: espaco.lg, gap: espaco.md, paddingBottom: 96 },
  listaVazia: { flexGrow: 1 },
  botaoNovo: {
    position: 'absolute',
    right: espaco.lg,
    bottom: espaco.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
});
