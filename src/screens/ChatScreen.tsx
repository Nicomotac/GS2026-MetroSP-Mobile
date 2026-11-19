import { Ionicons } from '@expo/vector-icons';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Chip } from '../components/Chip';
import { TelaComTeclado } from '../components/TelaComTeclado';
import { useCarregamento } from '../hooks/useCarregamento';
import { useChat } from '../hooks/useChat';
import { LIMITE_MENSAGEM, type MensagemTela } from '../model/Chat';
import type { TelaAba } from '../navigation/tipos';
import { ocorrenciaService } from '../services/ocorrenciaService';
import { cores, espaco, estilosBase, fontes } from '../theme/tema';

export function ChatScreen({ navigation, route }: TelaAba<'Chat'>) {
  const parametro = route.params?.ocorrenciaId ?? null;
  const chat = useChat(parametro);
  const ocorrencias = useCarregamento(ocorrenciaService.listar);
  const [texto, setTexto] = useState('');
  const listaRef = useRef<FlatList<MensagemTela>>(null);
  const { setOcorrenciaId } = chat;

  // Vindo do detalhe de uma ocorrência: seleciona o contexto e limpa o parâmetro,
  // para a mesma ocorrência poder ser escolhida de novo depois.
  useEffect(() => {
    if (parametro === null) return;
    setOcorrenciaId(parametro);
    navigation.setParams({ ocorrenciaId: undefined });
  }, [parametro, setOcorrenciaId, navigation]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          accessibilityLabel="Limpar conversa"
          onPress={chat.limpar}
          style={estilos.botaoCabecalho}
        >
          <Ionicons name="trash-outline" size={22} color={cores.branco} />
        </Pressable>
      ),
    });
  }, [navigation, chat.limpar]);

  async function aoEnviar() {
    const enviado = await chat.enviar(texto);
    if (enviado) setTexto('');
  }

  const selecionada = ocorrencias.dados?.find((o) => o.id === chat.ocorrenciaId);

  return (
    <TelaComTeclado style={estilosBase.tela}>
      <View style={estilos.contexto}>
        <Text style={estilosBase.rotulo}>
          Contexto:{' '}
          {selecionada
            ? `#${selecionada.id} ${selecionada.tipoProblema} · ${selecionada.estacao}`
            : 'pergunta geral'}
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            rotulo="Geral"
            ativo={chat.ocorrenciaId === null}
            onPress={() => setOcorrenciaId(null)}
          />
          {(ocorrencias.dados ?? []).slice(0, 30).map((o) => (
            <Chip
              key={o.id}
              rotulo={`#${o.id} ${o.tipoProblema}`}
              ativo={chat.ocorrenciaId === o.id}
              onPress={() => setOcorrenciaId(o.id)}
            />
          ))}
        </ScrollView>
        {chat.chatLivreIndisponivel && chat.ocorrenciaId === null && (
          <Text style={estilosBase.aviso}>
            Perguntas gerais precisam da rota POST /api/chat na API. Escolha uma ocorrência para
            usar a orientação de IA.
          </Text>
        )}
      </View>

      <FlatList
        ref={listaRef}
        data={chat.mensagens}
        keyExtractor={(m) => m.id}
        contentContainerStyle={estilos.mensagens}
        onContentSizeChange={() => listaRef.current?.scrollToEnd({ animated: true })}
        renderItem={({ item }) => <Balao mensagem={item} />}
        ListFooterComponent={
          chat.enviando ? (
            <View style={estilos.digitando}>
              <ActivityIndicator color={cores.azul} />
              <Text style={estilosBase.textoSecundario}>A IA está respondendo...</Text>
            </View>
          ) : undefined
        }
      />

      <View style={estilos.barraEnvio}>
        <TextInput
          style={estilos.entrada}
          value={texto}
          onChangeText={setTexto}
          placeholder="Escreva sua pergunta"
          placeholderTextColor={cores.textoSecundario}
          multiline
          maxLength={LIMITE_MENSAGEM}
        />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Enviar"
          disabled={chat.enviando || !texto.trim()}
          onPress={() => void aoEnviar()}
          style={[estilos.enviar, (chat.enviando || !texto.trim()) && { opacity: 0.5 }]}
        >
          <Ionicons name="send" size={20} color={cores.branco} />
        </Pressable>
      </View>
    </TelaComTeclado>
  );
}

function Balao({ mensagem }: { mensagem: MensagemTela }) {
  if (mensagem.autor === 'sistema') {
    return <Text style={[estilosBase.aviso, estilos.sistema]}>{mensagem.texto}</Text>;
  }
  const minha = mensagem.autor === 'usuario';
  return (
    <View style={[estilos.balao, minha ? estilos.balaoMeu : estilos.balaoIa]}>
      <Text style={[estilosBase.texto, minha && { color: cores.branco }]}>{mensagem.texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  botaoCabecalho: { paddingHorizontal: espaco.lg },
  contexto: {
    paddingHorizontal: espaco.lg,
    paddingTop: espaco.md,
    gap: espaco.xs,
    borderBottomWidth: 1,
    borderBottomColor: cores.borda,
    backgroundColor: cores.cartao,
  },
  mensagens: { padding: espaco.lg, gap: espaco.sm },
  balao: { maxWidth: '85%', borderRadius: 16, padding: espaco.md },
  balaoMeu: { alignSelf: 'flex-end', backgroundColor: cores.azul, borderBottomRightRadius: 4 },
  balaoIa: {
    alignSelf: 'flex-start',
    backgroundColor: cores.cartao,
    borderWidth: 1,
    borderColor: cores.borda,
    borderBottomLeftRadius: 4,
  },
  sistema: { alignSelf: 'stretch' },
  digitando: { flexDirection: 'row', alignItems: 'center', gap: espaco.sm, paddingTop: espaco.sm },
  barraEnvio: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: espaco.sm,
    padding: espaco.md,
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    backgroundColor: cores.cartao,
  },
  entrada: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 22,
    paddingHorizontal: espaco.lg,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: fontes.regular,
    color: cores.texto,
    backgroundColor: cores.fundo,
  },
  enviar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: cores.azul,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
