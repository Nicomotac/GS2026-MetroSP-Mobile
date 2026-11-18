import React from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import logo from '../assets/logo.png';
import Text from '../components/ThemedText';
import { useLoginFormulario } from '../control/useLoginFormulario';
import type { PublicStackParamList } from '../navigation/navigation';
import { AMARELO, FONTE_TITULO, MARINHO, useTema, type Cores } from '../Theme/themeContext';

type Props = NativeStackScreenProps<PublicStackParamList, 'Login'>;

const LINHAS = ['#0455A1', '#007E5E', '#EE372F', '#FFD100', '#A05EB5', '#9EA1A3'];

export default function LoginScreen({ navigation }: Props) {
  const { email, setEmail, senha, setSenha, erro, entrando, enviar } = useLoginFormulario();
  const { cores } = useTema();
  const styles = criarEstilos(cores);

  return (
    <KeyboardAvoidingView
      style={styles.pagina}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.marca}>
        <Image source={logo} style={styles.logo} accessibilityLabel="Logotipo MetroSP" />
        <Text style={styles.nomeApp}>MetroSP Ocorrências</Text>
        <View style={styles.linhas}>
          {LINHAS.map((cor) => (
            <View key={cor} style={[styles.linha, { backgroundColor: cor }]} />
          ))}
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.titulo}>Entrar</Text>
        <Text style={styles.subtitulo}>Acompanhe as ocorrências nas estações do metrô.</Text>
        <Text style={styles.rotulo}>E-mail</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholder="voce@email.com"
          placeholderTextColor={cores.textoSecundario}
          accessibilityLabel="E-mail"
        />
        <Text style={styles.rotulo}>Senha</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          placeholder="Senha"
          placeholderTextColor={cores.textoSecundario}
          accessibilityLabel="Senha"
        />
        {!!erro && <Text style={styles.erro}>{erro}</Text>}
        <TouchableOpacity
          style={styles.botao}
          onPress={() => {
            void enviar();
          }}
          disabled={entrando}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>{entrando ? 'Entrando...' : 'Entrar'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Cadastro')} accessibilityRole="link">
          <Text style={styles.link}>Criar conta de passageiro</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const criarEstilos = (cores: Cores) =>
  StyleSheet.create({
    pagina: { flex: 1, backgroundColor: MARINHO, justifyContent: 'center', padding: 22 },
    marca: { alignItems: 'center', marginBottom: 20 },
    logo: { width: 96, height: 96 },
    nomeApp: { color: '#fff', fontSize: 24, fontFamily: FONTE_TITULO, marginTop: 6 },
    linhas: { flexDirection: 'row', gap: 6, marginTop: 8 },
    linha: { width: 26, height: 5, borderRadius: 3 },
    card: {
      backgroundColor: cores.superficie,
      borderRadius: 18,
      padding: 20,
      maxWidth: 440,
      width: '100%',
      alignSelf: 'center',
    },
    titulo: { fontSize: 22, fontFamily: FONTE_TITULO, textAlign: 'center' },
    subtitulo: {
      color: cores.textoSecundario,
      marginTop: 4,
      marginBottom: 18,
      textAlign: 'center',
    },
    rotulo: { fontWeight: 'bold', marginBottom: 5 },
    input: {
      color: cores.texto,
      borderColor: cores.borda,
      borderWidth: 1,
      borderRadius: 9,
      padding: 12,
      marginBottom: 12,
      minHeight: 48,
    },
    erro: { color: cores.perigo, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    botao: { backgroundColor: AMARELO, padding: 14, borderRadius: 10 },
    botaoTexto: { color: MARINHO, textAlign: 'center', fontWeight: 'bold', fontSize: 16 },
    link: { color: cores.primaria, textAlign: 'center', fontWeight: 'bold', marginTop: 16 },
  });
