import { View, Text } from 'react-native';
import { styles } from './styles';

export function EmptyEvents() {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyDescription}>
        No momento não há eventos disponíveis para você
      </Text>
    </View>
  );
}