// mobile/src/types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
}

export type RootStackParamList = {
  selectOrganization: undefined;
  login: {
    organization: Organization;
  };
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
