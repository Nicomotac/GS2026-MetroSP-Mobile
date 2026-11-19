import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NomeIcone } from '../components/Botao';
import { Carregando } from '../components/EstadoTela';
import { useAuth } from '../context/AuthContext';
import { CadastroScreen } from '../screens/CadastroScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { EstacoesScreen } from '../screens/EstacoesScreen';
import { InicioScreen } from '../screens/InicioScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OcorrenciaDetalheScreen } from '../screens/OcorrenciaDetalheScreen';
import { OcorrenciaFormScreen } from '../screens/OcorrenciaFormScreen';
import { OcorrenciasScreen } from '../screens/OcorrenciasScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { cores, fontes } from '../theme/tema';
import type { AbasParams, RotasParams } from './tipos';

const Pilha = createNativeStackNavigator<RotasParams>();
const Abas = createBottomTabNavigator<AbasParams>();

const cabecalho = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.branco,
  headerTitleStyle: { fontFamily: fontes.semi },
};

const ICONES: Record<keyof AbasParams, NomeIcone> = {
  Inicio: 'home',
  Ocorrencias: 'alert-circle',
  Estacoes: 'train',
  Chat: 'chatbubbles',
  Perfil: 'person-circle',
};

/** Área logada: abas principais. */
function AbasPrincipais() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        ...cabecalho,
        tabBarActiveTintColor: cores.azul,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarLabelStyle: { fontFamily: fontes.medio, fontSize: 11 },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONES[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Abas.Screen name="Inicio" component={InicioScreen} options={{ title: 'Início' }} />
      <Abas.Screen
        name="Ocorrencias"
        component={OcorrenciasScreen}
        options={{ title: 'Ocorrências' }}
      />
      <Abas.Screen name="Estacoes" component={EstacoesScreen} options={{ title: 'Estações' }} />
      <Abas.Screen name="Chat" component={ChatScreen} options={{ title: 'Chatbot' }} />
      <Abas.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Abas.Navigator>
  );
}

/**
 * Proteção de rotas: sem sessão só existem Login, Cadastro e Sobre.
 * Ao sair, as telas logadas deixam de existir na pilha.
 */
export function AppNavigator() {
  const { sessao, carregandoSessao } = useAuth();
  if (carregandoSessao) return <Carregando texto="Abrindo o MetroSP..." />;

  return (
    <Pilha.Navigator screenOptions={cabecalho}>
      {sessao ? (
        <>
          <Pilha.Screen name="Abas" component={AbasPrincipais} options={{ headerShown: false }} />
          <Pilha.Screen
            name="OcorrenciaDetalhe"
            component={OcorrenciaDetalheScreen}
            options={{ title: 'Ocorrência' }}
          />
          <Pilha.Screen
            name="OcorrenciaForm"
            component={OcorrenciaFormScreen}
            options={{ title: 'Nova ocorrência' }}
          />
        </>
      ) : (
        <>
          <Pilha.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Pilha.Screen
            name="Cadastro"
            component={CadastroScreen}
            options={{ title: 'Criar conta' }}
          />
        </>
      )}
      <Pilha.Screen name="Sobre" component={SobreScreen} options={{ title: 'Sobre o App' }} />
    </Pilha.Navigator>
  );
}
