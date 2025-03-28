import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/auth';
import { Login } from '@/screens/Login';
import { TabRoutes } from './tab.routes';
import { ProofOfLife } from '@/screens/ProofOfLife';
import { DocumentFrontPhoto } from '@/screens/ProofOfLife/DocumentFrontPhoto';
import { DocumentBackPhoto } from '@/screens/ProofOfLife/DocumentBackPhoto';
import { CpfPhoto } from '@/screens/ProofOfLife/CpfPhoto';
import { SelfiePhoto } from '@/screens/ProofOfLife/SelfiePhoto';
import { SubmissionSuccess } from '@/screens/ProofOfLife/SubmissionSuccess';
import { RootStackParamList } from '@/types/navigation';
import { Splash } from '@/screens/Splash';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Routes() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Tela de Splash sempre aparece primeiro */}
        <Stack.Screen name="splash" component={Splash} />
        
        {!token ? (
          <Stack.Screen name="login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="main" component={TabRoutes} />
            <Stack.Screen name="proofOfLife" component={ProofOfLife} />
            <Stack.Screen name="documentFrontPhoto" component={DocumentFrontPhoto} />
            <Stack.Screen name="documentBackPhoto" component={DocumentBackPhoto} />
            <Stack.Screen name="cpfPhoto" component={CpfPhoto} />
            <Stack.Screen name="selfiePhoto" component={SelfiePhoto} />
            <Stack.Screen name="submissionSuccess" component={SubmissionSuccess} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
