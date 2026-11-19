import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { Botao } from '../components/Botao';
import { Campo } from '../components/Campo';
import { TelaComTeclado } from '../components/TelaComTeclado';
import { useAuth } from '../context/AuthContext';
import type { TelaPilha } from '../navigation/tipos';
import { estilosBase } from '../theme/tema';
import { mensagemErro } from '../utils/erros';

const EMAIL_VALIDO = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Regras iguais ao UsuarioRequest da API: nome até 200, e-mail válido, senha de 3 a 72. */
function validar(nome: string, email: string, senha: string, confirmacao: string): string | null {
  if (!nome.trim()) return 'Informe o nome.';
  if (nome.trim().length > 200) return 'O nome pode ter no máximo 200 caracteres.';
  if (!EMAIL_VALIDO.test(email.trim())) return 'Informe um e-mail válido.';
  if (senha.length < 3 || senha.length > 72) return 'A senha deve ter de 3 a 72 caracteres.';
  if (senha !== confirmacao) return 'As senhas não conferem.';
  return null;
}

export function CadastroScreen(_props: TelaPilha<'Cadastro'>) {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function aoCadastrar() {
    if (enviando) return;
    const problema = validar(nome, email, senha, confirmacao);
    if (problema) return setErro(problema);
    setErro(null);
    setEnviando(true);
    try {
      await cadastrar(nome, email, senha);
    } catch (error) {
      setErro(mensagemErro(error));
      setEnviando(false);
    }
  }

  return (
    <TelaComTeclado style={estilosBase.tela}>
      <ScrollView contentContainerStyle={estilosBase.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={estilosBase.textoSecundario}>
          A conta é criada na API Java (tabela T_USUARIO) e você entra logo em seguida.
        </Text>
        <Campo rotulo="Nome" value={nome} onChangeText={setNome} placeholder="Seu nome" maxLength={200} />
        <Campo
          rotulo="E-mail"
          value={email}
          onChangeText={setEmail}
          placeholder="voce@email.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={200}
        />
        <Campo
          rotulo="Senha"
          value={senha}
          onChangeText={setSenha}
          placeholder="De 3 a 72 caracteres"
          secureTextEntry
          autoCapitalize="none"
          maxLength={72}
        />
        <Campo
          rotulo="Confirmar senha"
          value={confirmacao}
          onChangeText={setConfirmacao}
          placeholder="Repita a senha"
          secureTextEntry
          autoCapitalize="none"
          maxLength={72}
        />
        {!!erro && <Text style={estilosBase.erro}>{erro}</Text>}
        <Botao titulo="Criar conta" icone="person-add-outline" carregando={enviando} onPress={() => void aoCadastrar()} />
      </ScrollView>
    </TelaComTeclado>
  );
}
