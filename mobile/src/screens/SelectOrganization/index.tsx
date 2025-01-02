// mobile/src/screens/SelectOrganization/index.tsx
import { useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/Button';
import { styles } from './styles';
import type { AppStackScreenProps } from '@/types/navigation';

type Organization = {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
};

export function SelectOrganization() {
  const navigation = useNavigation<AppStackScreenProps<'selectOrganization'>['navigation']>();
  const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get<Organization[]>('/organizations/public');
      return response.data;
    }
  });

  function handleSelectOrganization(organization: Organization) {
    setSelectedOrganization(organization);
  }

  function handleContinue() {
    if (!selectedOrganization) return;

    navigation.navigate('login', {
      organization: selectedOrganization
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prova de Vida</Text>
        <Text style={styles.subtitle}>Selecione sua organização</Text>
      </View>

      <FlatList
        data={organizations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <Button
            onPress={() => handleSelectOrganization(item)}
            style={[
              styles.organizationButton,
              selectedOrganization?.id === item.id && styles.organizationButtonSelected
            ]}
          >
            <Text style={styles.organizationName}>{item.name}</Text>
            <Text style={styles.organizationLocation}>
              {item.city}/{item.state}
            </Text>
          </Button>
        )}
        contentContainerStyle={styles.list}
      />

      <Button
        onPress={handleContinue}
        disabled={!selectedOrganization || isLoading}
      >
        Continuar
      </Button>
    </View>
  );
}
