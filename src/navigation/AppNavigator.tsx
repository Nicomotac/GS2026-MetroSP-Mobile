import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NomeIcone } from '../components/Botao';
import { Carregando } from '../components/EstadoTela';
import { useAuth } from '../context/AuthContext';
import { CadastroScreen } from '../screens/CadastroScreen';
import { ChatScreen } from '../screens/ChatScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { OcorrenciaDetalheScreen } from '../screens/OcorrenciaDetalheScreen';
import { OcorrenciaFormScreen } from '../screens/OcorrenciaFormScreen';
import { OcorrenciasScreen } from '../screens/OcorrenciasScreen';
import { PerfilScreen } from '../screens/PerfilScreen';
import { SobreScreen } from '../screens/SobreScreen';
import { cores } from '../theme/tema';
import type { AbasParams, RotasParams } from './tipos';

const Pilha = createNativeStackNavigator<RotasParams>();
const Abas = createBottomTabNavigator<AbasParams>();

const cabecalho = {
  headerStyle: { backgroundColor: cores.primaria },
  headerTintColor: cores.branco,
  headerTitleStyle: { fontWeight: '700' as const },
};

const ICONES: Record<keyof AbasParams, NomeIcone> = {
  Ocorrencias: 'alert-circle',
  Chat: 'chatbubbles',
  Perfil: 'person-circle',
};

function AbasPrincipais() {
  return (
    <Abas.Navigator
      screenOptions={({ route }) => ({
        ...cabecalho,
        tabBarActiveTintColor: cores.azul,
        tabBarInactiveTintColor: cores.textoSecundario,
        tabBarIcon: ({ color, size }) => <Ionicons name={ICONES[route.name]} size={size} color={color} />,
      })}
    >
      <Abas.Screen name="Ocorrencias" component={OcorrenciasScreen} options={{ title: 'Ocorrências' }} />
      <Abas.Screen name="Chat" component={ChatScreen} options={{ title: 'Chatbot' }} />
      <Abas.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Perfil' }} />
    </Abas.Navigator>
  );
}

export function AppNavigator() {
  const { sessao, carregandoSessao } = useAuth();
  if (carregandoSessao) return <Carregando texto="Abrindo o MetroSP..." />;

  return (
    <Pilha.Navigator screenOptions={cabecalho}>
      {sessao ? (
        <>
          <Pilha.Screen name="Abas" component={AbasPrincipais} options={{ headerShown: false }} />
          <Pilha.Screen name="OcorrenciaDetalhe" component={OcorrenciaDetalheScreen} options={{ title: 'Ocorrência' }} />
          <Pilha.Screen name="OcorrenciaForm" component={OcorrenciaFormScreen} options={{ title: 'Nova ocorrência' }} />
        </>
      ) : (
        <>
          <Pilha.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Pilha.Screen name="Cadastro" component={CadastroScreen} options={{ title: 'Criar conta' }} />
        </>
      )}
      <Pilha.Screen name="Sobre" component={SobreScreen} options={{ title: 'Sobre o App' }} />
    </Pilha.Navigator>
  );
}
