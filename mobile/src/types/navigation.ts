// mobile/src/types/navigation.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type RootStackParamList = {
  login: undefined;
  main: undefined;
  proofOfLife: {
    event: {
      id: string;
      title: string;
      type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
    };
  };
  documentPhoto: undefined;
  selfiePhoto: {
    documentPhoto: {
      uri: string;
    };
  };
  submissionSuccess: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;
