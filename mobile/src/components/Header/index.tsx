import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/stores/auth';
import { styles } from './styles';
import type { RootStackScreenProps } from '@/types/navigation';

type NavigationProp = RootStackScreenProps<'main'>['navigation'];

export function Header() {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();

  function handleProfilePress() {
    // @ts-ignore - This is actually valid since profile is in the tab navigator
    navigation.navigate('profile');
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.userInfo}>
          <Text style={styles.greeting} numberOfLines={1} ellipsizeMode="tail">
            Olá, {user?.name}
          </Text>
          <Text style={styles.organization} numberOfLines={1} ellipsizeMode="tail">
            {user?.organization.name}
          </Text>
        </View>
        
        <TouchableOpacity style={styles.profileButton} onPress={handleProfilePress}>
          <MaterialIcons name="person" size={26} color="#0284C7" />
        </TouchableOpacity>
      </View>
    </View>
  );
}