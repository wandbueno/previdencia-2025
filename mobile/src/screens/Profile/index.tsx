import { View, Text, Alert } from 'react-native';
import { useAuthStore } from '@/stores/auth';
import { Button } from '@/components/Button';
import { Header } from '@/components/Header';
import { User } from '@/types/user';
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
            <Text style={styles.label}>Nome</Text>
            <Text style={styles.value}>{user?.name}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>CPF</Text>
            <Text style={styles.value}>{user?.cpf}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>E-mail</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Organização</Text>
            <Text style={styles.value}>{user?.organization.name}</Text>
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>Serviços Ativos</Text>
            <View>
              {user?.canProofOfLife && (
                <Text style={styles.value}>• Prova de Vida</Text>
              )}
              {user?.canRecadastration && (
                <Text style={styles.value}>• Recadastramento</Text>
              )}
              {!user?.canProofOfLife && !user?.canRecadastration && (
                <Text style={styles.noServices}>Nenhum serviço ativo</Text>
              )}
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