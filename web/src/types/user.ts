export type UserType = 'ADMIN' | 'USER';
export type UserTableType = 'admin' | 'app';
export type BenefitType = 'APOSENTADORIA' | 'PENSAO';

// Interfaces e tipos relacionados a usuários
export interface User {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  role: UserType; // Usa UserType - define o papel do usuário no sistema
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
  pensionGrantorName?: string;
  legalRepresentative?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

// Interfaces para criação/atualização de usuários
export interface CreateUserFormData {
  name: string;
  email?: string;
  cpf: string;
  password: string;
  type: UserTableType; // Usa UserTableType - define o tipo de tabela/formulário
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
  type?: UserTableType; // Usa UserTableType - define o tipo de tabela/formulário
  organizationId?: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email?: string;
  cpf: string;
  role: UserType; // Usa UserType - define o papel do usuário no sistema
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
  pensionGrantorName?: string;
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
  role?: UserType; // Usa UserType - define o papel do usuário no sistema
}