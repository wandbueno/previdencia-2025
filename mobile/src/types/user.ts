export interface User {
  id: string;
  name: string;
  email: string;
  cpf: string;
  role: string;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  organization: {
    id: string;
    name: string;
    subdomain: string;
  };
}

export interface AuthState {
  token: string | null;
  user: User | null;
  signIn: (token: string, user: User) => void;
  signOut: () => void;
}