import { api } from '@/lib/api';
import { uploadFile } from './upload';

interface CreateProofOfLifeParams {
  documentPhoto: { uri: string };
  selfiePhoto: { uri: string };
  eventId: string;
}

export async function createProofOfLife({ 
  documentPhoto, 
  selfiePhoto,
  eventId 
}: CreateProofOfLifeParams) {
  try {
    // Upload document photo
    console.log('Uploading document photo...');
    const documentFile = await uploadFile(documentPhoto, 'document');
    console.log('Document uploaded:', documentFile);

    // Upload selfie photo
    console.log('Uploading selfie photo...');
    const selfieFile = await uploadFile(selfiePhoto, 'selfie');
    console.log('Selfie uploaded:', selfieFile);

    // Create proof of life submission
    console.log('Creating proof of life submission...', {
      documentUrl: documentFile.path,
      selfieUrl: selfieFile.path,
      eventId
    });

    const response = await api.post('/proof-of-life', {
      documentUrl: documentFile.path,
      selfieUrl: selfieFile.path,
      eventId
    });

    console.log('Proof of life created:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('Error creating proof of life:', error);
    
    // Get error message from response or use default
    const errorMessage = error.response?.data?.error || 'Erro ao enviar prova de vida. Tente novamente.';
    
    // Map backend error messages to user-friendly messages
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

    // Try to find a user-friendly message or use the original error
    const userMessage = userMessages[errorMessage] || errorMessage;
    throw new Error(userMessage);
  }
}