import { Svg, Path } from 'react-native-svg';
import { View } from 'react-native';

export function Check() {
  return (
    <View>
      <Svg width={20} height={20} fill="none" viewBox="0 0 20 20">
        <Path
          d="M16.6666 5L7.49992 14.1667L3.33325 10"
          stroke="#0284C7"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}