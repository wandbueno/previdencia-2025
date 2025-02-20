import * as React from 'react';
import Svg, { Path, Rect, Text, G } from 'react-native-svg';

export function DocumentBackOutline() {
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

      {/* Área da digital */}
      <G>
        <Rect
          x="320"
          y="40"
          width="100"
          height="120"
          stroke="#64748B"
          strokeWidth={2}
          strokeDasharray="8,8"
          fill="none"
        />
        {/* Digital mais realista */}
        <Path
          d="M370 50
             c-20 0, -35 15, -35 35
             c0 20, 15 35, 35 35
             c20 0, 35 -15, 35 -35
             c0 -20, -15 -35, -35 -35z
             
             M370 55
             c-17 0, -30 13, -30 30
             c0 17, 13 30, 30 30
             c17 0, 30 -13, 30 -30
             c0 -17, -13 -30, -30 -30z
             
             M370 60
             c-14 0, -25 11, -25 25
             c0 14, 11 25, 25 25
             c14 0, 25 -11, 25 -25
             c0 -14, -11 -25, -25 -25z
             
             M370 65
             c-11 0, -20 9, -20 20
             c0 11, 9 20, 20 20
             c11 0, 20 -9, 20 -20
             c0 -11, -9 -20, -20 -20z
             
             M370 70
             c-8 0, -15 7, -15 15
             c0 8, 7 15, 15 15
             c8 0, 15 -7, 15 -15
             c0 -8, -7 -15, -15 -15z
             
             M370 75
             c-5 0, -10 5, -10 10
             c0 5, 5 10, 10 10
             c5 0, 10 -5, 10 -10
             c0 -5, -5 -10, -10 -10z
             
             M370 80
             c-3 0, -5 2, -5 5
             c0 3, 2 5, 5 5
             c3 0, 5 -2, 5 -5
             c0 -3, -2 -5, -5 -5z"
          stroke="#64748B"
          strokeWidth={1}
          fill="none"
        />
        
        {/* Linhas curvas adicionais para dar mais realismo */}
        <Path
          d="M350 85 Q360 95, 370 85 Q380 75, 390 85
             M345 75 Q360 90, 370 75 Q380 60, 395 75
             M340 65 Q360 85, 370 65 Q380 45, 400 65"
          stroke="#64748B"
          strokeWidth={1}
          fill="none"
        />
      </G>

      {/* Campos de dados */}
      <G>
        <Path
          d="M30 60h270M30 100h270M30 140h270"
          stroke="#64748B"
          strokeWidth={2}
          strokeDasharray="8,8"
        />
        <Text
          x="150"
          y="45"
          fontSize="12"
          fill="#64748B"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          REGISTRO GERAL / DATA DE EXPEDIÇÃO
        </Text>
      </G>

      {/* Campos de dados profissionais */}
      <G>
        <Path
          d="M30 180h390M30 220h390"
          stroke="#64748B"
          strokeWidth={2}
          strokeDasharray="8,8"
        />
        <Text
          x="150"
          y="165"
          fontSize="12"
          fill="#64748B"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          DADOS PROFISSIONAIS
        </Text>
      </G>

      {/* Área de observações */}
      <G>
        <Rect
          x="30"
          y="240"
          width="390"
          height="40"
          stroke="#64748B"
          strokeWidth={2}
          strokeDasharray="8,8"
          fill="none"
        />
        <Text
          x="215"
          y="265"
          fontSize="12"
          fill="#64748B"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          OBSERVAÇÕES
        </Text>
      </G>
    </Svg>
  );
}