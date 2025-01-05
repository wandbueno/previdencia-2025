import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from './styles';

interface Tab {
  id: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  activeTab: string;
  onChangeTab: (tabId: Tab['id']) => void;
}

export function TabBar({ tabs, activeTab, onChangeTab }: TabBarProps) {
  return (
    <View style={styles.tabBar}>
      {tabs.map(tab => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.tab,
            activeTab === tab.id && styles.activeTab
          ]}
          onPress={() => onChangeTab(tab.id)}
        >
          <Text style={[
            styles.tabText,
            activeTab === tab.id && styles.activeTabText
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}