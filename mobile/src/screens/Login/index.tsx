// mobile/src/screens/Login/index.tsx
import { useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth';
import { Input } from '@/components/Input';
import { Select } from '@/components/Select';
import { Button } from '@/components/Button';
import { api } from '@/lib/api';
import { styles } from './styles';
import { Masks } from 'react-native-mask-input';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
}

export function Login() {
  const [selectedOrganization, setSelectedOrganization] = useState('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuthStore();

  const { data: organizations, isLoading: loadingOrganizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations/public');
      return response.data;
    }
  });

  async function handleLogin() {
    try {
      setError('');
      setLoading(true);

      const response = await api.post('/auth/app/login', {
        cpf: cpf.replace(/\D/g, ''),
        password,
        subdomain: selectedOrganization
      });

      const { token, ...user } = response.data;
      signIn(token, user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  const organizationOptions = organizations?.map(org => ({
    label: `${org.name} - ${org.city}/${org.state}`,
    value: org.subdomain
  })) || [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Prova de Vida</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <View style={styles.form}>
        <Select
          label="Organização"
          placeholder="Selecione uma organização"
          value={selectedOrganization}
          options={organizationOptions}
          onChange={setSelectedOrganization}
        />

      <Input
        label="CPF"
        placeholder="Digite seu CPF"
        value={cpf}
        onChangeText={setCpf}
        keyboardType="numeric"
        mask={Masks.BRL_CPF}
      />

        <Input
          label="Senha"
          placeholder="Digite sua senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button 
          onPress={handleLogin}
          disabled={loading || !selectedOrganization || !cpf || !password}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            'Entrar'
          )}
        </Button>
      </View>
    </View>
  );
}
