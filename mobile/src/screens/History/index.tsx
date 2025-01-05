import { View } from 'react-native';
import { Header } from '@/components/Header';
import { HistoryTabs } from './components/HistoryTabs';
import { styles } from './styles';

export function History() {
  return (
    <View style={styles.container}>
      <Header />
      <HistoryTabs />
    </View>
  );
}