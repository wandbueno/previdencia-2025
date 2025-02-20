export interface Submission {
  id: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  comments?: string;
  event: {
    id: string;
    title: string;
  };
}

export interface ProofOfLifeSubmission extends Submission {
  selfieUrl: string;
  documentUrl: string;
}

export interface RecadastrationSubmission extends Submission {
  data: {
    address: {
      street: string;
      number: string;
      complement?: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
    dependents?: Array<{
      name: string;
      birthDate: string;
      relationship: string;
    }>;
  };
  documentsUrls: {
    addressProof: string;
    identityDocument: string;
    marriageCertificate?: string;
  };
}