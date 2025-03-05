import React from 'react'
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
import Constants from 'expo-constants';
import { APP } from '@/config';

interface Organization {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
}

export function Login() {
  const [selectedOrganization, setSelectedOrganization] = useState<string>('');
  const [cpf, setCpf] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn } = useAuthStore();

  const { data: organizations } = useQuery<Organization[]>({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await api.get('/organizations/public');
      return response.data;
    }
  });

  const selectedOrgData = organizations?.find(org => org.subdomain === selectedOrganization);

  async function handleLogin() {
    try {
      setError('');
      setLoading(true);

      const response = await api.post('/auth/app/login', {
        cpf: cpf.replace(/\D/g, ''),
        password,
        subdomain: selectedOrganization
      });

      console.log('Login response:', response.data);

      const { token, ...user } = response.data;
      signIn(token, user);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  }

  const organizationOptions = organizations?.map(org => ({
    label: `${org.subdomain.charAt(0).toUpperCase()}${org.subdomain.slice(1)} - ${org.city}/${org.state}`,
    value: org.subdomain
  })) || [];

  // Função auxiliar para obter a versão do app de forma segura
  function getAppVersion(): string {
    // No expo-config, podemos acessar diretamente a versão definida no app.config.js
    return require('../../../app.config.js').version;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{APP.NAME}</Text>
        <Text style={styles.subtitle}>Faça login para continuar</Text>
      </View>

      <View style={styles.form}>
        <Select
          label="Orgão"
          placeholder="Selecione Seu Orgão"
          value={selectedOrganization}
          options={organizationOptions}
          onChange={setSelectedOrganization}
        />

        {selectedOrganization && (
          <>
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
              disabled={loading || !cpf || !password}
            >
              {loading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                'Entrar'
              )}
            </Button>
          </>
        )}
      </View>
      <View style={styles.footer}>
        <Text style={styles.version}>
          Versão {APP.VERSION}
        </Text>
      </View>
    </View>
  );
}