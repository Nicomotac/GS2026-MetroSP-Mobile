import React from 'react';
import { Image, ScrollView, StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';
import logo from '../assets/logo.png';
import Text from '../components/ThemedText';
import { API_URL } from '../services/api';
import { criarEstilosBase } from '../Theme/estilosBase';
import { FONTE_TITULO, MARINHO, useTema } from '../Theme/themeContext';

export default function SobreAppScreen() {
  const { cores } = useTema();
  const base = criarEstilosBase(cores);
  const versao = Constants.expoConfig?.version ?? 'Não informada';
  const commitHash = String(Constants.expoConfig?.extra?.commitHash ?? 'indisponível');

  return (
    <ScrollView style={base.pagina} contentContainerStyle={base.conteudo}>
      <View style={styles.hero}>
        <Image source={logo} style={styles.logo} accessibilityLabel="Logotipo MetroSP" />
        <Text style={styles.nome}>MetroSP Ocorrências</Text>
      </View>

      <View style={base.card}>
        <Text style={base.rotulo}>Hash do commit</Text>
        <Text style={styles.hash} selectable>
          {commitHash}
        </Text>
        <Text style={[base.rotulo, styles.espaco]}>Versão</Text>
        <Text>{versao}</Text>
        <Text style={[base.rotulo, styles.espaco]}>API</Text>
        <Text>{API_URL}</Text>
      </View>

      <View style={base.card}>
        <Text style={base.rotulo}>Propósito</Text>
        <Text>
          Aproximar o passageiro da operação do metrô: o cidadão consulta ocorrências por estação e
          recebe orientação gerada por IA; os funcionários registram e acompanham cada problema até
          a resolução.
        </Text>
        <Text style={[base.rotulo, styles.espaco]}>Equipe</Text>
        <Text>Nicolas Mota — RM561857</Text>
        <Text>Caio Kenzo — RM592979</Text>
      </View>

      <Text style={[base.textoSecundario, styles.rodape]}>
        FIAP — Global Solution 2026/2 — CitizenTech
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: MARINHO,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
  },
  logo: { width: 80, height: 80 },
  nome: { color: '#fff', fontSize: 22, fontFamily: FONTE_TITULO, marginTop: 6 },
  hash: { fontSize: 12, fontFamily: 'monospace' },
  espaco: { marginTop: 14 },
  rodape: { textAlign: 'center', marginTop: 12 },
});
