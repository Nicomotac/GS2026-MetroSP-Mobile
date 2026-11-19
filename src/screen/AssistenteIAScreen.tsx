import React, { useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import StatusBadge from '../components/StatusBadge';
import Text from '../components/ThemedText';
import { useAssistenteControl } from '../control/useAssistenteControl';
import type { RootDrawerParamList } from '../navigation/navigation';
import { mensagemErroApi } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { FONTE_TITULO, MARINHO, useTema } from '../Theme/themeContext';

type Props = DrawerScreenProps<RootDrawerParamList, 'AssistenteIA'>;

export default function AssistenteIAScreen({ route }: Props) {
  const { cores } = useTema();
  const base = criarEstilosBase(cores);
  const rolagem = useRef<ScrollView>(null);
  const {
    ocorrencias,
    selecionada,
    selecionadaId,
    selecionar,
    entrada,
    setEntrada,
    mensagens,
    carregando,
    erro,
    enviar,
    perguntarOrientacao,
    limparConversa,
  } = useAssistenteControl(route.params?.ocorrenciaId);

  return (
    <KeyboardAvoidingView
      style={base.pagina}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        ref={rolagem}
        contentContainerStyle={base.conteudo}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => rolagem.current?.scrollToEnd({ animated: true })}
      >
        <View style={styles.hero}>
          <Text style={styles.heroTitulo}>Chat MetroSP</Text>
          <Text style={styles.heroTexto}>
            Tire dúvidas sobre deslocamentos e ocorrências. As respostas são geradas por IA,
            não por uma central oficial de monitoramento.
          </Text>
        </View>

        <Text style={base.rotulo}>Contexto da conversa (opcional)</Text>
        {ocorrencias.isLoading && <ActivityIndicator color={cores.primaria} />}
        {ocorrencias.isError && <Text style={base.erro}>{mensagemErroApi(ocorrencias.error)}</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={base.chips}>
          <TouchableOpacity
            style={[base.chip, selecionadaId === null && base.chipAtivo]}
            onPress={() => selecionar(null)}
            disabled={carregando}
            accessibilityLabel="Conversar sem vincular ocorrência"
          >
            <Text style={selecionadaId === null ? base.chipTextoAtivo : undefined}>
              Sem ocorrência
            </Text>
          </TouchableOpacity>
          {(ocorrencias.data ?? []).map((o) => (
            <TouchableOpacity
              key={o.id}
              style={[base.chip, selecionadaId === o.id && base.chipAtivo]}
              onPress={() => selecionar(o.id)}
              disabled={carregando}
              accessibilityLabel={`Selecionar ocorrência ${o.id} na estação ${o.estacao}`}
            >
              <Text style={selecionadaId === o.id ? base.chipTextoAtivo : undefined}>
                #{o.id} {o.estacao} · {o.tipoProblema}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selecionada && (
          <View style={base.card}>
            <StatusBadge status={selecionada.status} />
            <Text style={[base.nome, { marginTop: 6 }]}>{selecionada.tipoProblema}</Text>
            <Text>{selecionada.mensagem}</Text>
            <TouchableOpacity
              style={[base.destaque, { marginTop: 12 }]}
              onPress={() => void perguntarOrientacao()}
              disabled={carregando}
              accessibilityLabel="Pedir orientação automática para a ocorrência"
            >
              <Text style={base.destaqueTexto}>Orientação rápida para esta ocorrência</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.barraTitulo}>
          <Text style={base.subtitulo}>Conversa</Text>
          <TouchableOpacity onPress={limparConversa} disabled={carregando || mensagens.length === 0}>
            <Text style={{ color: cores.primaria, opacity: mensagens.length ? 1 : 0.5 }}>
              Limpar conversa
            </Text>
          </TouchableOpacity>
        </View>

        {mensagens.length === 0 && (
          <View style={[base.card, { backgroundColor: cores.fundoSecundario }]}>
            <Text>
              Olá! Pergunte, por exemplo: "Como devo me preparar se uma estação estiver com
              elevador indisponível?"
            </Text>
          </View>
        )}
        {mensagens.map((m) => (
          <View
            key={m.id}
            style={[
              styles.balao,
              {
                alignSelf: m.papel === 'usuario' ? 'flex-end' : 'flex-start',
                backgroundColor: m.papel === 'usuario' ? MARINHO : cores.superficie,
                borderColor: cores.borda,
              },
            ]}
          >
            <Text style={[styles.remetente, { color: m.papel === 'usuario' ? '#FFC72C' : cores.primaria }]}>
              {m.papel === 'usuario' ? 'Você' : 'Assistente MetroSP'}
            </Text>
            <Text style={{ color: m.papel === 'usuario' ? '#fff' : cores.texto }}>
              {m.texto}
            </Text>
          </View>
        ))}

        {carregando && (
          <View style={styles.progresso}>
            <ActivityIndicator color={cores.primaria} />
            <Text style={base.textoSecundario}>Consultando a API Java e o modelo de IA...</Text>
          </View>
        )}
        {!!erro && <Text style={base.erro}>{erro}</Text>}

        <TextInput
          value={entrada}
          onChangeText={setEntrada}
          style={[base.input, styles.campo]}
          placeholder="Digite sua pergunta sobre o Metrô..."
          placeholderTextColor={cores.textoSecundario}
          multiline
          maxLength={1000}
          editable={!carregando}
          accessibilityLabel="Pergunta para o assistente de IA"
        />
        <TouchableOpacity
          style={[base.primario, (carregando || !entrada.trim()) && styles.desabilitado]}
          onPress={() => void enviar()}
          disabled={carregando || !entrada.trim()}
          accessibilityLabel="Enviar pergunta ao assistente"
        >
          <Text style={base.botaoTexto}>Enviar pergunta</Text>
        </TouchableOpacity>
        <Text style={[base.textoSecundario, styles.aviso]}>
          Orientações informativas. Não são dados em tempo real; confirme mudanças nos canais
          oficiais do Metrô de São Paulo.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  hero: { backgroundColor: MARINHO, borderRadius: 16, padding: 18, marginBottom: 16 },
  heroTitulo: { color: '#fff', fontSize: 22, fontFamily: FONTE_TITULO },
  heroTexto: { color: '#C9D4EE', marginTop: 4 },
  barraTitulo: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  balao: { maxWidth: '92%', borderWidth: 1, borderRadius: 14, padding: 12, marginBottom: 10 },
  remetente: { fontWeight: 'bold', fontSize: 12, marginBottom: 4 },
  progresso: { flexDirection: 'row', gap: 8, alignItems: 'center', marginVertical: 12 },
  campo: { minHeight: 90, textAlignVertical: 'top', marginTop: 8 },
  desabilitado: { opacity: 0.5 },
  aviso: { fontSize: 12, marginTop: 12, marginBottom: 18 },
});
