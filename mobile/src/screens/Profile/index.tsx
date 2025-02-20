import { View, Text, Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { User } from '@/types/user';
import { formatDate } from '@/utils/format';
import { styles } from './styles';

export function Profile() {
  const { user, signOut } = useAuthStore() as { user: User | null; signOut: () => void };

  function handleLogout() {
    Alert.alert(
      'Sair',
      'Tem certeza que deseja sair?',
      [
        {
          text: 'Não',
          style: 'cancel'
        },
        {
          text: 'Sim',
          onPress: signOut,
          style: 'destructive'
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      <Header />

      <View style={styles.content}>
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>Órgão</Text>
            <Text style={styles.value}>{user?.organization.name}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1, styles.marginRight]}>
              <Text style={styles.label}>CPF</Text>
              <Text style={styles.value}>{user?.cpf}</Text>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>RG</Text>
              <Text style={styles.value}>{user?.rg || '-'}</Text>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{user?.email || '-'}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Tipo de Benefício</Text>
            <Text style={styles.value}>
              {user?.benefitType ? (
                user.benefitType === 'APOSENTADORIA' ? 'Aposentadoria' : 'Pensão'
              ) : '-'}
              {user?.benefitType === 'APOSENTADORIA' && user?.retirementType ? 
                ` - ${user.retirementType}` 
                : ''}
            </Text>
          </View>

          <View style={styles.row}>
            <View style={[styles.field, styles.flex1, styles.marginRight]}>
              <Text style={styles.label}>Início do Benefício</Text>
              <Text style={styles.value}>{formatDate(user?.benefitStartDate)}</Text>
            </View>

            <View style={[styles.field, styles.flex1]}>
              <Text style={styles.label}>Fim do Benefício</Text>
              <Text style={styles.value}>{user?.benefitEndDate || 'Vitalício'}</Text>
            </View>
          </View>
        </View>

        <Button onPress={handleLogout}>
          Sair
        </Button>
      </View>
    </View>
  );
}