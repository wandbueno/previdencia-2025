import * as React from 'react';
import Svg, { Path, Circle, G } from 'react-native-svg';

export function SelfieOutline() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 1200 900" fill="none">
      <G transform="translate(600, 450) rotate(90)">
        {/* Círculo da cabeça */}
        <Circle
          cx="0"
          cy="-200"
          r="200"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />

        {/* Ombros */}
        <Path
          d="M-200 0 C-200 100, -100 200, 0 200 C100 200, 200 100, 200 0"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />

        {/* Olhos */}
        <Circle
          cx="-70"
          cy="-220"
          r="20"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />
        <Circle
          cx="70"
          cy="-220"
          r="20"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />

        {/* Sorriso */}
        <Path
          d="M-80 -140 C-40 -100, 40 -100, 80 -140"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />
      </G>
    </Svg>
  );
}