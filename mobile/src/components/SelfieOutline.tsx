import * as React from 'react';
import Svg, { Path, G } from 'react-native-svg';

export function SelfieOutline() {
  return (
    <Svg width="100%" height="100%" viewBox="0 0 1200 900" fill="none">
      {/* Silhueta simplificada da cabeça e ombros - rotacionada 90 graus */}
      <G transform="translate(600, 450) rotate(90)">
        {/* Cabeça */}
        <Path
          d="M-120 -360
             C-120 -440, -80 -480, 0 -480
             C80 -480, 120 -440, 120 -360
             C120 -280, 80 -200, 0 -120
             C-80 -200, -120 -280, -120 -360"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />

        {/* Pescoço e ombros */}
        <Path
          d="M-60 -120
             C-60 -100, -40 -80, 0 -80
             C40 -80, 60 -100, 60 -120
             
             M-180 0 
             C-180 -40, -120 -80, 0 -80
             C120 -80, 180 -40, 180 0"
          stroke="#64748B"
          strokeWidth={4}
          fill="none"
        />
      </G>
    </Svg>
  );
}