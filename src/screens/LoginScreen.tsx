import { useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { TelaComTeclado } from '../components/TelaComTeclado';
import { useAuth } from '../context/AuthContext';
import type { TelaPilha } from '../navigation/tipos';
import { cores, espaco, estilosBase } from '../theme/tema';
import { mensagemErro } from '../utils/erros';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginScreen({ navigation }: TelaPilha<'Login'>) {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoEntrar() {
    if (enviando) return;
    if (!EMAIL_VALIDO.test(email.trim())) return setErro('Informe um e-mail válido.');
    if (!senha) return setErro('Informe a senha.');
    setErro(null);
    setEnviando(true);
    try {
      await entrar(email, senha);
      // O navegador troca para as telas logadas sozinho.
    } catch (error) {
      setErro(mensagemErro(error));
      setEnviando(false);
    }
  }

  return (
    <SafeAreaView style={estilos.tela}>
      <TelaComTeclado>
        <ScrollView contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">
          <View style={estilos.topo}>
            <Image source={require('../../assets/logo.png')} style={estilos.logo} resizeMode="contain" />
            <Text style={estilos.titulo}>MetroSP Ocorrências</Text>
            <Text style={estilos.subtitulo}>Registre e acompanhe problemas nas estações</Text>
          </View>

          <View style={estilosBase.cartao}>
            <Campo
              rotulo="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect={false}
            />
            <Campo
              rotulo="Senha"
              value={senha}
              onChangeText={setSenha}
              placeholder="Sua senha"
              secureTextEntry
              autoCapitalize="none"
              onSubmitEditing={() => void aoEntrar()}
            />
            {!!erro && <Text style={estilosBase.erro}>{erro}</Text>}
            <Botao titulo="Entrar" icone="log-in-outline" carregando={enviando} onPress={() => void aoEntrar()} />
            <Botao titulo="Criar conta de passageiro" variante="secundario" onPress={() => navigation.navigate('Cadastro')} />
          </View>

          <Botao
            titulo="Sobre o App e teste de conexão"
            variante="texto"
            icone="information-circle-outline"
            onPress={() => navigation.navigate('Sobre')}
          />
        </ScrollView>
      </TelaComTeclado>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.primaria },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: espaco.lg, gap: espaco.lg },
  topo: { alignItems: 'center', gap: espaco.xs },
  logo: { width: 120, height: 120, borderRadius: 24, backgroundColor: cores.branco },
  titulo: { fontSize: 26, fontWeight: '800', color: cores.branco, marginTop: espaco.sm },
  subtitulo: { fontSize: 14, color: '#C9D3EA', textAlign: 'center' },
});
