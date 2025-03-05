import React, { useEffect } from 'react';
import { View, Text, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/types/navigation';
import { styles } from './styles';
import { useAuthStore } from '@/stores/auth';
import Svg, { Circle, Path } from 'react-native-svg';
import { APP } from '@/config';
import Constants from 'expo-constants';

type SplashScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'splash'>;

export function Splash() {
  const navigation = useNavigation<SplashScreenNavigationProp>();
  const { token } = useAuthStore();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    // Animação de fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ]).start();

    // Navegar para a próxima tela após 2.5 segundos
    const timer = setTimeout(() => {
      // Se o usuário estiver autenticado, vai para a tela principal
      // Caso contrário, vai para a tela de login
      if (token) {
        navigation.replace('main');
      } else {
        navigation.replace('login', { organization: undefined });
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigation, token]);

  // Logo SVG com texto E-Prev separado do círculo
  const LogoSVG = () => (
    <View style={styles.logoContainer}>
      {/* Círculo com check */}
      <Svg width="160" height="160" viewBox="0 0 160 160" fill="none">
        {/* Círculo principal */}
        <Circle cx="80" cy="80" r="75" fill="#0284C7" stroke="white" strokeWidth="6"/>
        
        {/* Ícone de check */}
        <Path 
          d="M50 80L70 100L110 60" 
          stroke="white" 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
      </Svg>
      
      {/* Texto E-Prev abaixo do círculo */}
      <Text style={styles.logoText}>{APP.NAME}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }] 
          }
        ]}
      >
        {/* Logo SVG */}
        <LogoSVG />
      </Animated.View>
      
      <Text style={styles.version}>
        Versão {APP.VERSION}
      </Text>
    </View>
  );
}