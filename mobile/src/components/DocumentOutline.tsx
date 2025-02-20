import * as React from 'react';
import Svg, { Path, Rect, Text } from 'react-native-svg';

export function DocumentOutline() {
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

      {/* Área da foto */}
      <Rect
        x="30"
        y="60"
        width="100"
        height="140"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
        fill="none"
      />

      {/* Linhas de texto */}
      <Path
        d="M150 80h270M150 120h270M150 160h270M150 200h270"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
      />

      {/* Assinatura */}
      <Path
        d="M30 240h390"
        stroke="#64748B"
        strokeWidth={2}
        strokeDasharray="8,8"
      />

      {/* Textos indicativos */}
      <Text
        x="80"
        y="140"
        fontSize="14"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        FOTO 3x4
      </Text>

      <Text
        x="225"
        y="40"
        fontSize="14"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
        fontWeight="bold"
      >
        REPÚBLICA FEDERATIVA DO BRASIL
      </Text>

      <Text
        x="225"
        y="270"
        fontSize="12"
        fill="#64748B"
        textAnchor="middle"
        fontFamily="sans-serif"
      >
        ASSINATURA DO TITULAR
      </Text>
    </Svg>
  );
}