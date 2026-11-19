import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { Carregando, ErroTela, Vazio } from '../components/EstadoTela';
import { useCarregamento } from '../hooks/useCarregamento';
import type { Estacao } from '../model/Cadastros';
import type { TelaAba } from '../navigation/tipos';
import { estacaoService } from '../services/cadastroService';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { cores, espaco, estilosBase, fontes } from '../theme/tema';

interface EstacaoComTotal extends Estacao {
  abertas: number;
}

/** Estações (GET /api/estacoes) com o total de ocorrências ainda não resolvidas. */
async function buscarEstacoes(): Promise<EstacaoComTotal[]> {
  const [estacoes, ocorrencias] = await Promise.all([
    estacaoService.listar(),
    ocorrenciaService.listar(),
  ]);
  const abertasPorEstacao = new Map<number, number>();
  ocorrencias
    .filter((o) => o.status !== 'R')
    .forEach((o) =>
      abertasPorEstacao.set(o.estacaoId, (abertasPorEstacao.get(o.estacaoId) ?? 0) + 1),
    );
  return estacoes
    .map((e) => ({ ...e, abertas: abertasPorEstacao.get(e.id) ?? 0 }))
    .sort(
      (a, b) =>
        (a.sentido ?? '').localeCompare(b.sentido ?? '') ||
        a.ordem - b.ordem ||
        a.nome.localeCompare(b.nome),
    );
}

export function EstacoesScreen({ navigation }: TelaAba<'Estacoes'>) {
  const estacoes = useCarregamento(buscarEstacoes);
  const [busca, setBusca] = useState('');

  const visiveis = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = estacoes.dados ?? [];
    return termo ? lista.filter((e) => e.nome.toLowerCase().includes(termo)) : lista;
  }, [estacoes.dados, busca]);

  if (estacoes.carregando && !estacoes.dados) {
    return <Carregando texto="Buscando estações na API..." />;
  }
  if (estacoes.erro && !estacoes.dados) {
    return <ErroTela mensagem={estacoes.erro} aoTentarDeNovo={estacoes.tentarDeNovo} />;
  }

  return (
    <View style={estilosBase.tela}>
      <View style={estilos.busca}>
        <Campo
          rotulo="Buscar estação"
          value={busca}
          onChangeText={setBusca}
          placeholder="Ex.: Sé, Paraíso, Jabaquara"
          autoCorrect={false}
          accessibilityLabel="Buscar estação pelo nome"
        />
      </View>
      <FlatList
        data={visiveis}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={visiveis.length ? estilos.lista : estilos.listaVazia}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={estacoes.atualizando} onRefresh={estacoes.atualizar} />
        }
        ListEmptyComponent={
          <Vazio
            icone="train-outline"
            texto={
              busca
                ? 'Nenhuma estação com esse nome.'
                : 'Nenhuma estação cadastrada na API (tabela T_ESTACAO vazia).'
            }
          />
        }
        renderItem={({ item }) => (
          <ItemEstacao
            estacao={item}
            aoVerOcorrencias={() =>
              navigation.navigate('Ocorrencias', { estacaoId: item.id, estacaoNome: item.nome })
            }
            aoRegistrar={() => navigation.navigate('OcorrenciaForm', { estacaoId: item.id })}
          />
        )}
      />
    </View>
  );
}

interface ItemProps {
  estacao: EstacaoComTotal;
  aoVerOcorrencias: () => void;
  aoRegistrar: () => void;
}

function ItemEstacao({ estacao, aoVerOcorrencias, aoRegistrar }: ItemProps) {
  const ativa = estacao.ativa !== 'N';
  const detalhes = [
    estacao.linha ? `Linha ${estacao.linha}` : null,
    estacao.sentido ? `Sentido ${estacao.sentido}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <View style={estilosBase.cartao}>
      <Pressable
        onPress={aoVerOcorrencias}
        accessibilityRole="button"
        accessibilityLabel={`${estacao.nome}, ${estacao.abertas} ocorrências em aberto`}
        accessibilityHint="Mostra as ocorrências desta estação"
        style={({ pressed }) => [estilos.topo, pressed && { opacity: 0.8 }]}
      >
        <View style={estilos.ordem}>
          <Text style={estilos.ordemTexto}>{estacao.ordem}</Text>
        </View>
        <View style={estilos.flex}>
          <Text style={estilosBase.subtitulo}>{estacao.nome}</Text>
          {!!detalhes && <Text style={estilosBase.textoSecundario}>{detalhes}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={cores.textoSecundario} />
      </Pressable>

      <View style={estilos.rodape}>
        <Text style={[estilos.etiqueta, { color: ativa ? cores.sucesso : cores.erro }]}>
          {ativa ? 'Em operação' : 'Inativa'}
        </Text>
        <Text
          style={[
            estilos.etiqueta,
            { color: estacao.abertas ? cores.alerta : cores.textoSecundario },
          ]}
        >
          {estacao.abertas === 1 ? '1 ocorrência aberta' : `${estacao.abertas} ocorrências abertas`}
        </Text>
      </View>
      <Botao
        titulo="Registrar ocorrência aqui"
        variante="texto"
        icone="add"
        onPress={aoRegistrar}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  flex: { flex: 1 },
  busca: { paddingHorizontal: espaco.lg, paddingTop: espaco.md },
  lista: { padding: espaco.lg, gap: espaco.md },
  listaVazia: { flexGrow: 1 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: espaco.md },
  ordem: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ordemTexto: { color: cores.branco, fontFamily: fontes.semi, fontSize: 14 },
  rodape: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap' },
  etiqueta: { fontSize: 13, fontFamily: fontes.medio },
});
