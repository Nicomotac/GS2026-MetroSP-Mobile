import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import type { PublicStackParamList, RootDrawerParamList } from './navigation';
import { AMARELO, FONTE_MEDIA, MARINHO, useTema } from '../Theme/themeContext';
import LoginScreen from '../screen/LoginScreen';
import RegisterScreen from '../screen/RegisterScreen';
import HomeScreen from '../screen/HomeScreen';
import EstacaoScreen from '../screen/EstacaoScreen';
import OcorrenciaScreen from '../screen/OcorrenciaScreen';
import AssistenteIAScreen from '../screen/AssistenteIAScreen';
import FuncionarioScreen from '../screen/FuncionarioScreen';
import PassageiroScreen from '../screen/PassageiroScreen';
import PerfilScreen from '../screen/PerfilScreen';
import SobreAppScreen from '../screen/SobreAppScreen';

const PublicStack = createNativeStackNavigator<PublicStackParamList>();
const Drawer = createDrawerNavigator<RootDrawerParamList>();

const cabecalho = {
  headerStyle: { backgroundColor: MARINHO },
  headerTintColor: '#fff',
  headerTitleStyle: { fontFamily: FONTE_MEDIA },
};

function PublicNavigator() {
  return (
    <PublicStack.Navigator screenOptions={cabecalho}>
      <PublicStack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <PublicStack.Screen
        name="Cadastro"
        component={RegisterScreen}
        options={{ title: 'Criar conta' }}
      />
    </PublicStack.Navigator>
  );
}

/** Menu lateral: telas administrativas só aparecem para o perfil ADMIN. */
function PrivateNavigator() {
  const { usuario } = useAuth();
  const { cores } = useTema();
  const admin = usuario?.perfil === 'ADMIN';

  return (
    <Drawer.Navigator
      initialRouteName="Home"
      screenOptions={{
        ...cabecalho,
        drawerActiveTintColor: MARINHO,
        drawerActiveBackgroundColor: AMARELO,
        drawerInactiveTintColor: cores.texto,
        drawerStyle: { backgroundColor: cores.superficie },
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: admin ? 'Painel' : 'Início' }}
      />
      <Drawer.Screen
        name="Ocorrencias"
        component={OcorrenciaScreen}
        options={{ title: 'Ocorrências' }}
      />
      <Drawer.Screen name="Estacoes" component={EstacaoScreen} options={{ title: 'Estações' }} />
      <Drawer.Screen
        name="AssistenteIA"
        component={AssistenteIAScreen}
        options={{ title: 'Assistente IA' }}
      />
      {admin && (
        <>
          <Drawer.Screen
            name="Funcionarios"
            component={FuncionarioScreen}
            options={{ title: 'Funcionários' }}
          />
          <Drawer.Screen
            name="Passageiros"
            component={PassageiroScreen}
            options={{ title: 'Passageiros' }}
          />
        </>
      )}
      <Drawer.Screen name="Perfil" component={PerfilScreen} options={{ title: 'Meu Perfil' }} />
      <Drawer.Screen
        name="SobreApp"
        component={SobreAppScreen}
        options={{ title: 'Sobre o App' }}
      />
    </Drawer.Navigator>
  );
}

export default function RootNavigator() {
  const { usuario, carregandoSessao } = useAuth();
  if (carregandoSessao) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={AMARELO} />
      </View>
    );
  }
  // Rotas protegidas: sem sessão, só existem as telas públicas.
  return usuario ? <PrivateNavigator /> : <PublicNavigator />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: MARINHO },
});
