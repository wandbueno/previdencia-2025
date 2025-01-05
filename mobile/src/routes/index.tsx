import React from 'react';
// mobile/src/routes/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/auth';
import { Login } from '@/screens/Login';
import { TabRoutes } from './tab.routes';
import { ProofOfLife } from '@/screens/ProofOfLife';
import { DocumentPhoto } from '@/screens/ProofOfLife/DocumentPhoto';
import { SelfiePhoto } from '@/screens/ProofOfLife/SelfiePhoto';
import { SubmissionSuccess } from '@/screens/ProofOfLife/SubmissionSuccess';
import { RootStackParamList } from '@/types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function Routes() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="login" component={Login} />
        ) : (
          <>
            <Stack.Screen name="main" component={TabRoutes} />
            <Stack.Screen name="proofOfLife" component={ProofOfLife} />
            <Stack.Screen name="documentPhoto" component={DocumentPhoto} />
            <Stack.Screen name="selfiePhoto" component={SelfiePhoto} />
            <Stack.Screen name="submissionSuccess" component={SubmissionSuccess} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
