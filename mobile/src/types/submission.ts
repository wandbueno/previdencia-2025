export interface Submission {
  id: string;
  eventId: string;
  eventTitle: string;
  status: 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
  selfieUrl: string;
  documentUrl: string;
  comments?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
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