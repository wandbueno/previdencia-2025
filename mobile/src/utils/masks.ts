// mobile/src/utils/masks.ts
import { Mask } from 'react-native-mask-input';

export const CPF_MASK: Mask = [
  /\d/, /\d/, /\d/, '.',
  /\d/, /\d/, /\d/, '.',
  /\d/, /\d/, /\d/, '-',
  /\d/, /\d/
];
