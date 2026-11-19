import Constants from 'expo-constants';
import { useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Botao } from '../components/Botao';
import { API_URL } from '../config';
import type { TelaPilha } from '../navigation/tipos';
import { verificarApi } from '../services/statusService';
import { cores, espaco, estilosBase, fontes } from '../theme/tema';
import { mensagemErro } from '../utils/erros';

const INTEGRANTES = ['Nicolas Mota · RM561857', 'Caio Kenzo · RM592979'];

export function SobreScreen(_props: TelaPilha<'Sobre'>) {
  const insets = useSafeAreaInsets();
  const [testando, setTestando] = useState(false);
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);

  const commit = String(Constants.expoConfig?.extra?.commitHash ?? 'indisponível');
  const versao = Constants.expoConfig?.version ?? '—';

  async function testar() {
    setTestando(true);
    setResultado(null);
    try {
      const status = await verificarApi();
      setResultado({
        ok: status.status === 'UP',
        texto: `API respondeu "${status.status}" em ${(status.milissegundos / 1000).toFixed(1)} s.`,
      });
    } catch (error) {
      setResultado({ ok: false, texto: mensagemErro(error) });
    } finally {
      setTestando(false);
    }
  }

  return (
    <ScrollView
      style={estilosBase.tela}
      contentContainerStyle={[estilosBase.conteudo, { paddingBottom: insets.bottom + espaco.xl }]}
    >
      <View style={estilosBase.cartao}>
        <Text style={estilosBase.titulo}>MetroSP Ocorrências</Text>
        <Text style={estilosBase.texto}>
          Global Solution FIAP 2026/2 (CitizenTech). Passageiros registram e acompanham ocorrências
          nas estações do metrô e tiram dúvidas com um chatbot de IA.
        </Text>
        <Text style={estilosBase.rotulo}>Versão</Text>
        <Text style={estilosBase.texto}>{versao}</Text>
        <Text style={estilosBase.rotulo}>Commit do build</Text>
        <Text style={[estilosBase.texto, estilos.mono]} selectable>
          {commit}
        </Text>
      </View>

      <View style={estilosBase.cartao}>
        <Text style={estilosBase.subtitulo}>Conexão com a API</Text>
        <Text style={[estilosBase.texto, estilos.mono]} selectable>
          {API_URL}
        </Text>
        <Botao
          titulo="Testar conexão"
          icone="pulse-outline"
          variante="secundario"
          carregando={testando}
          onPress={() => void testar()}
        />
        {resultado && (
          <Text style={[estilos.resultado, { color: resultado.ok ? cores.sucesso : cores.erro }]}>
            {resultado.texto}
          </Text>
        )}
        <Text style={estilosBase.textoSecundario}>
          A chave da OpenAI fica somente no Web App (OPENAI_API_KEY). O app nunca recebe essa chave.
        </Text>
      </View>

      <View style={estilosBase.cartao}>
        <Text style={estilosBase.subtitulo}>Integrantes</Text>
        {INTEGRANTES.map((nome) => (
          <Text key={nome} style={estilosBase.texto}>
            {nome}
          </Text>
        ))}
      </View>
    </ScrollView>
  );
}

const estilos = StyleSheet.create({
  mono: { fontFamily: Platform.select({ ios: 'Menlo', default: 'monospace' }), fontSize: 13 },
  resultado: { fontSize: 14, fontFamily: fontes.semi },
});
