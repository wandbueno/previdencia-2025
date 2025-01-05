// mobile/src/components/Select/icons/ChevronDown.tsx
import { Path, Svg } from 'react-native-svg';

export function ChevronDown() {
  return (
    <Svg width={20} height={20} fill="none">
      <Path
        d="M5 7.5L10 12.5L15 7.5"
        stroke="#64748B"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
