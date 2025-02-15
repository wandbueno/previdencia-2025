export type UserType = 'ADMIN' | 'USER';
export type UserTableType = 'admin' | 'app';
export type BenefitType = 'APOSENTADORIA' | 'PENSAO';

export interface User {
  id: string;
  name: string;
  insuredName: string;
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
  legalRepresentative?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

export interface CreateUserDTO {
  name: string;
  insuredName: string;
  email?: string;
  cpf: string;
  password: string;
  tableType: UserTableType;
  organizationId: string;
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
  legalRepresentative?: string;
}

export interface UpdateUserDTO {
  id: string;
  name: string;
  insuredName: string;
  email?: string;
  active: boolean;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg: string;
  birthDate: string;
  address?: string;
  phone?: string;
  registrationNumber?: string;
  processNumber?: string;
  benefitStartDate: string;
  benefitEndDate: string;
  benefitType: BenefitType;
  retirementType?: string;
  legalRepresentative?: string;
  subdomain?: string;
  tableType?: UserTableType;
  organizationId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  insuredName: string;
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

export interface DeleteUserRequest {
  id: string;
  tableType: UserTableType;
  organizationId: string;
}
