export interface Submission {
  id: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  reviewedAt?: string;
  comments?: string;
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