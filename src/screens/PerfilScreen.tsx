import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Botao } from '../components/Botao';
import { useAuth } from '../context/AuthContext';
import type { TelaAba } from '../navigation/tipos';
import { cores, espaco, estilosBase, fontes } from '../theme/tema';
import { dataParaTexto } from '../utils/datas';

export function PerfilScreen({ navigation }: TelaAba<'Perfil'>) {
  const { sessao, sair } = useAuth();
  if (!sessao) return null;

  const modoDemonstracao = sessao.conta === 'USER' && sessao.perfil === 'ADMIN';

  function confirmarSaida() {
    Alert.alert('Sair da conta?', 'Você vai voltar para a tela de login.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => void sair() },
    ]);
  }

  return (
    <ScrollView style={estilosBase.tela} contentContainerStyle={estilosBase.conteudo}>
      <View style={[estilosBase.cartao, estilos.topo]}>
        <Ionicons name="person-circle" size={72} color={cores.azul} />
        <Text style={estilosBase.titulo}>{sessao.nome}</Text>
        <Text style={estilosBase.textoSecundario}>{sessao.email}</Text>
      </View>

      <View style={estilosBase.cartao}>
        <Linha
          rotulo="Tipo de conta"
          valor={sessao.conta === 'ADMIN' ? 'Funcionário (ADMIN)' : 'Passageiro (USER)'}
        />
        <Linha rotulo="Permissão devolvida pela API" valor={sessao.perfil} />
        <Linha rotulo="ID na API" valor={String(sessao.id)} />
        <Linha rotulo="Sessão válida até" valor={dataParaTexto(new Date(sessao.expiraEm))} />
        {modoDemonstracao && (
          <Text style={estilosBase.aviso}>
            Modo demonstração ativo no Web App (APP_DEMO_ALL_USERS_ADMIN=true): sua conta de
            passageiro recebe permissão de ADMIN, por isso você consegue cadastrar, editar e excluir
            ocorrências.
          </Text>
        )}
      </View>

      <Botao
        titulo="Sobre o App"
        icone="information-circle-outline"
        variante="secundario"
        onPress={() => navigation.navigate('Sobre')}
      />
      <Botao titulo="Sair" icone="log-out-outline" variante="perigo" onPress={confirmarSaida} />
    </ScrollView>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={estilos.linha}>
      <Text style={estilosBase.textoSecundario}>{rotulo}</Text>
      <Text style={[estilosBase.texto, estilos.valor]}>{valor}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  topo: { alignItems: 'center' },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: espaco.md },
  valor: { fontFamily: fontes.semi, flexShrink: 1, textAlign: 'right' },
});
