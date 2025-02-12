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
  benefitType?: BenefitType;
  retirementType?: string;
  insuredName?: string;
  legalRepresentative?: string;
  createdAt: string;
  updatedAt: string;
  organizationId?: string;
  organizationName?: string;
}

interface BaseFormData {
  name: string;
  email?: string;
}

export interface AdminFormData extends BaseFormData {
  cpf?: string;
  active?: boolean;
}

export interface AppUserFormData extends BaseFormData {
  cpf?: string;
  active?: boolean;
  canProofOfLife?: boolean;
  canRecadastration?: boolean;
  rg?: string;
  phone?: string;
  address?: string;
  registrationNumber?: string;
  processNumber?: string;
  benefitEndDate?: string;
  legalRepresentative?: string;
}

export type CreateFormData = AdminFormData | AppUserFormData;
export type UpdateFormData = AdminFormData | AppUserFormData;