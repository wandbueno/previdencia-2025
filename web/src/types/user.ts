export type UserType = 'ADMIN' | 'USER';
export type UserTableType = 'admin' | 'app';
export type BenefitType = 'APOSENTADORIA' | 'PENSAO';

export interface User {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  role: UserType;
  active: boolean;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  registrationNumber?: string;
  processNumber?: string;
  benefitStartDate?: string;
  benefitEndDate?: string;
  benefitType?: 'APOSENTADORIA' | 'PENSAO';
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface Organization {
  id: string;
  name: string;
  subdomain: string;
  state: string;
  city: string;
  active: boolean;
  services: string[];
}

export interface CreateUserFormData {
  name: string;
  email?: string;
  cpf: string;
  password: string;
  type: UserTableType;
  organizationId: string;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg: string;
  birthDate: string;
  address?: string;
  phone?: string;
  registrationNumber: string;
  processNumber: string;
  benefitStartDate: string;
  benefitEndDate: string;
  benefitType: BenefitType;
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
}

export interface UpdateUserFormData {
  name: string;
  email?: string;
  active: boolean;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg: string;
  birthDate: string;
  address?: string;
  phone?: string;
  registrationNumber: string;
  processNumber: string;
  benefitStartDate: string;
  benefitEndDate: string;
  benefitType: BenefitType;
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
  type?: UserTableType;
  organizationId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  role: UserType;
  active: boolean;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg?: string;
  birthDate?: string;
  address?: string;
  phone?: string;
  registrationNumber?: string;
  processNumber?: string;
  benefitStartDate?: string;
  benefitEndDate?: string;
  benefitType?: BenefitType;
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface UserTokenPayload {
  id: string;
  email?: string;
  isSuperAdmin?: boolean;
  organizationId?: string;
  role?: UserType;
}