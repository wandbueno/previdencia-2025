// src/routes/index.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/auth';
import { Login } from '@/screens/Login';
import { TabRoutes } from './tab.routes';

const Stack = createNativeStackNavigator();

export function Routes() {
  const { token } = useAuthStore();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!token ? (
          <Stack.Screen name="login" component={Login} />
        ) : (
          <Stack.Screen name="main" component={TabRoutes} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
