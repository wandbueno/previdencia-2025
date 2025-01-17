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

// Add navigation helper types
export type RootStackNavigationProp = RootStackScreenProps<keyof RootStackParamList>['navigation'];
export type RootStackRouteProp<T extends keyof RootStackParamList> = RootStackScreenProps<T>['route'];

// Add camera types
export interface CameraResult {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

export interface CameraOptions {
  quality?: number;
  allowsEditing?: boolean;
  mediaTypes?: 'photo' | 'video' | 'all';
  aspect?: [number, number];
  base64?: boolean;
  exif?: boolean;
}
