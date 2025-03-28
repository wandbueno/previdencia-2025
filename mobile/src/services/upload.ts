import { api } from '@/lib/api';

interface UploadResponse {
  success: boolean;
  file: {
    path: string;
    filename: string;
    mimetype: string;
  };
}

export async function uploadFile(
  file: { uri: string; type?: string; name?: string },
  type: 'document' | 'selfie'
) {
  try {
    const formData = new FormData();
    
    // Get file name and extension from URI
    const fileName = file.uri.split('/').pop() || `${type}.jpg`;
    const fileType = file.type || 'image/jpeg';
    
    // Create file object
    formData.append('file', {
      uri: file.uri,
      type: fileType,
      name: fileName
    } as any);

    console.log(`Uploading ${type} file:`, { fileName, fileType });

    const response = await api.post<UploadResponse>(`/upload/${type}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      transformRequest: (data) => {
        return data;
      },
      timeout: 30000 // 30 seconds timeout for uploads
    });

    console.log(`${type} upload response:`, response.data);

    if (!response.data.success) {
      throw new Error(`${type} upload failed`);
    }

    return response.data.file;
  } catch (error) {
    console.error(`Error uploading ${type}:`, error);
    throw error;
  }
}