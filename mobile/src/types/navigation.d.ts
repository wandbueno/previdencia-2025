// mobile/src/types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  city: string;
  state: string;
}

export interface Event {
  id: string;
  type: 'PROOF_OF_LIFE' | 'RECADASTRATION';
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  active: boolean;
  status?: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  organizationId: string;
  organizationName?: string;
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
  documentFrontPhoto: {  // Atualizado
    event: Event;
  };
  documentBackPhoto: {   // Novo
    event: Event;
    documentFrontPhoto: {
      uri: string;
    };
  };
  selfiePhoto: {
    event: Event;
    documentFrontPhoto: {
      uri: string;
    };
    documentBackPhoto: {
      uri: string;
    };
  };
  submissionSuccess: undefined;
};

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;
