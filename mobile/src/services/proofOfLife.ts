import { api } from '@/lib/api';
import { uploadFile } from './upload';

interface CreateProofOfLifeParams {
  documentFrontPhoto: { uri: string };
  documentBackPhoto: { uri: string };
  cpfPhoto: { uri: string };
  selfiePhoto: { uri: string };
  eventId: string;
}

export async function createProofOfLife({ 
  documentFrontPhoto,
  documentBackPhoto,
  cpfPhoto,
  selfiePhoto,
  eventId 
}: CreateProofOfLifeParams) {
  try {
    // Upload document front photo
    console.log('Uploading document front photo...');
    const documentFrontFile = await uploadFile(documentFrontPhoto, 'document');
    console.log('Document front uploaded:', documentFrontFile);

    // Upload document back photo
    console.log('Uploading document back photo...');
    const documentBackFile = await uploadFile(documentBackPhoto, 'document');
    console.log('Document back uploaded:', documentBackFile);

    // Upload CPF photo
    console.log('Uploading CPF photo...');
    const cpfFile = await uploadFile(cpfPhoto, 'document');
    console.log('CPF uploaded:', cpfFile);

    // Upload selfie photo
    console.log('Uploading selfie photo...');
    const selfieFile = await uploadFile(selfiePhoto, 'selfie');
    console.log('Selfie uploaded:', selfieFile);

    // Create proof of life submission
    console.log('Creating proof of life submission...', {
      documentFrontUrl: documentFrontFile.path,
      documentBackUrl: documentBackFile.path,
      cpfUrl: cpfFile.path,
      selfieUrl: selfieFile.path,
      eventId
    });

    const response = await api.post('/proof-of-life', {
      documentFrontUrl: documentFrontFile.path,
      documentBackUrl: documentBackFile.path,
      cpfUrl: cpfFile.path,
      selfieUrl: selfieFile.path,
      eventId
    });

    // Refetch events to update status
    await api.get('/events');

    console.log('Proof of life created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating proof of life:', error);
    
    const errorMessage = error.response?.data?.error || 'Erro ao enviar prova de vida. Tente novamente.';
    
    const userMessages: Record<string, string> = {
      'You already have a pending proof of life for this event': 
        'Você já possui uma prova de vida em análise para este evento.',
      'User not authorized for proof of life': 
        'Você não tem permissão para realizar prova de vida.',
      'Event is not within valid date range': 
        'Este evento não está mais disponível.',
      'Event is not active':
        'Este evento não está mais ativo.',
      'Event not found':
        'Evento não encontrado.',
      'Organization not found or inactive':
        'Organização não encontrada ou inativa.',
      'Proof of Life service not available':
        'Serviço de Prova de Vida não disponível.',
    };

    const userMessage = userMessages[errorMessage] || errorMessage;
    throw new Error(userMessage);
  }
}