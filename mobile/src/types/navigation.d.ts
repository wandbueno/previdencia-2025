// mobile/src/types/navigation.d.ts
import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AppStackParamList = {
  selectOrganization: undefined;
  login: {
    organization: {
      id: string;
      name: string;
      subdomain: string;
      city: string;
      state: string;
    };
  };
  home: undefined;
};

export type AppStackScreenProps<T extends keyof AppStackParamList> = 
  NativeStackScreenProps<AppStackParamList, T>;
