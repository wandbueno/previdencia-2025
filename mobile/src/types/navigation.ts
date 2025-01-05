import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Event } from './event';

export type RootStackParamList = {
  login: undefined;
  main: undefined;
  proofOfLife: {
    event: Event;
  };
  documentPhoto: {
    event: Event;
  };
  selfiePhoto: {
    documentPhoto: {
      uri: string;
    };
    event: Event;
  };
  submissionSuccess: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;
