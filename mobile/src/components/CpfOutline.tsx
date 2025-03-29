// mobile/src/components/CpfOutline.tsx
import * as React from 'react';
import Svg, { Path, Rect, Text } from 'react-native-svg';

export function CpfOutline() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 450 300" fill="none">
      {/* Borda externa do documento */}
      <Rect
        x="10"
        y="10"
        width="430"
        height="280"
        rx="8"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
        fill="none"
      />

      {/* Título do CPF */}
      <Text
        x="225"
        y="40"
        fontSize="14"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        CADASTRO DE PESSOA FÍSICA - CPF
      </Text>

      {/* Número do CPF */}
      <Rect
        x="50"
        y="70"
        width="350"
        height="40"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
        fill="none"
      />
      <Text
        x="225"
        y="95"
        fontSize="12"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        NÚMERO DO CPF
      </Text>

      {/* Nome */}
      <Rect
        x="50"
        y="130"
        width="350"
        height="40"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
        fill="none"
      />
      <Text
        x="225"
        y="155"
        fontSize="12"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        NOME COMPLETO
      </Text>

      {/* Data de Nascimento */}
      <Rect
        x="50"
        y="190"
        width="350"
        height="40"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
        fill="none"
      />
      <Text
        x="225"
        y="215"
        fontSize="12"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        DATA DE NASCIMENTO
      </Text>

      
      
    </Svg>
  );
}
