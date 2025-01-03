// src/routes/tab.routes.tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home } from '@/screens/Home';
import { History } from '@/screens/History';
import { Profile } from '@/screens/Profile';
import { MaterialIcons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export function TabRoutes() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#E2E8F0',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#0284C7',
        tabBarInactiveTintColor: '#64748B',
        tabBarLabelStyle: {
          fontFamily: 'Inter_500Medium',
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="home"
        component={Home}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="home" size={size} color={color} />
          ),
        }}
      />
      
      <Tab.Screen
        name="history"
        component={History}
        options={{
          tabBarLabel: 'Histórico',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="profile"
        component={Profile}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
