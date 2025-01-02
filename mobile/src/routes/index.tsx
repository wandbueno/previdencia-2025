// mobile/src/routes/index.tsx
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/stores/auth';
import { Login } from '@/screens/Login';
import { Home } from '@/screens/Home';

const Stack = createNativeStackNavigator();

export function Routes() {
  const { token } = useAuthStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!token ? (
        <Stack.Screen name="login" component={Login} />
      ) : (
        <Stack.Screen name="home" component={Home} />
      )}
    </Stack.Navigator>
  );
}
