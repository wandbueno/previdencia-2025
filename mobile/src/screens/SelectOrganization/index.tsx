import { View, Text, TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Check } from '@/components/Select/icons/Check';
import { styles } from './styles';
import type { Organization } from '@/types/navigation';

interface SelectOrganizationProps {
  value?: Organization;
  onChange: (organization: Organization) => void;
  onClose: () => void;
}

export function SelectOrganization({ value, onChange, onClose }: SelectOrganizationProps) {
  const { data: organizations, isLoading } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations/public');
      return response.data;
    }
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Carregando organizações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {organizations?.map((organization) => (
        <TouchableOpacity
          key={organization.id}
          style={[
            styles.option,
            value?.id === organization.id && styles.optionSelected
          ]}
          onPress={() => {
            onChange(organization);
            onClose();
          }}
        >
          <View style={styles.optionContent}>
            <Text style={styles.optionName}>{organization.name}</Text>
            <Text style={styles.optionLocation}>
              {organization.city}/{organization.state}
            </Text>
          </View>
          
          {value?.id === organization.id && (
            <Check />
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}