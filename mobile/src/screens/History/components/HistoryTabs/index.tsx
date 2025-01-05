import { useState } from 'react';
import { View } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { User } from '@/types/user';
import { TabBar } from './TabBar';
import { SubmissionsList } from '../SubmissionsList';
import { styles } from './styles';

type TabType = 'PROOF_OF_LIFE' | 'RECADASTRATION';

interface Tab {
  id: TabType;
  label: string;
}

export function HistoryTabs() {
  const [activeTab, setActiveTab] = useState<TabType>('PROOF_OF_LIFE');
  const { user } = useAuthStore() as { user: User | null };

  // Filtra as tabs baseado nas permissões do usuário
  const availableTabs: Tab[] = [
    user?.canProofOfLife ? { 
      id: 'PROOF_OF_LIFE', 
      label: 'Prova de Vida'
    } : null,
    user?.canRecadastration ? { 
      id: 'RECADASTRATION', 
      label: 'Recadastramento'
    } : null
  ].filter((tab): tab is Tab => tab !== null);

  return (
    <View style={styles.container}>
      <TabBar 
        tabs={availableTabs}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
      />
      
      <SubmissionsList type={activeTab} />
    </View>
  );
}