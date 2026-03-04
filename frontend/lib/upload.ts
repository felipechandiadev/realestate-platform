/**
 * Sistema centralizado de carga de archivos
 * Todas las rutas de upload apuntan a una única base URL configurable
 */

const UPLOAD_BASE_URL = process.env.NEXT_PUBLIC_UPLOAD_BASE_URL || 'http://localhost:3000/public';
const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3000';

/**
 * Configuración centralizada de upload
 */
export const uploadConfig = {
  baseUrl: UPLOAD_BASE_URL,
  apiUrl: BACKEND_API_URL,
  maxFileSize: 10485760, // 10MB
  allowedExtensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx'],
  endpoints: {
    document: '/document/upload',
    multimedia: '/multimedia/upload',
    profilePicture: '/users/profile-picture',
  },
};

/**
 * Interfaz para respuesta de upload
 */
export interface UploadResponse {
  url: string;
  filename: string;
  fileSize?: number;
}

/**
 * Sube un archivo al servidor
 * @param file - Archivo a subir
 * @param endpoint - Endpoint donde se sube (ej: '/document/upload')
 * @param accessToken - Token JWT del usuario
 * @param additionalData - Datos adicionales a enviar (ej: { title: '...', documentTypeId: '...' })
 * @returns Promise con URL y nombre del archivo
 */
export async function uploadFile(
  file: File,
  endpoint: string,
  accessToken: string,
  additionalData?: Record<string, any>
): Promise<UploadResponse> {
  // Validar tamaño del archivo
  if (file.size > uploadConfig.maxFileSize) {
    throw new Error(
      `Archivo demasiado grande. Máximo permitido: ${uploadConfig.maxFileSize / 1024 / 1024}MB`
    );
  }

  // Validar extensión
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !uploadConfig.allowedExtensions.includes(fileExtension)) {
    throw new Error(
      `Extensión no permitida. Permitidas: ${uploadConfig.allowedExtensions.join(', ')}`
    );
  }

  // Preparar FormData
  const formData = new FormData();
  formData.append('file', file);

  // Agregar datos adicionales si existen
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, String(value));
    });
  }

  try {
    const response = await fetch(`${uploadConfig.apiUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Upload failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    // Retornar URL completa y nombre del archivo
    return {
      url: data.url || `${uploadConfig.baseUrl}/${data.filename}`,
      filename: data.filename || file.name,
      fileSize: file.size,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Error durante la carga del archivo');
  }
}

/**
 * Sube un documento
 */
export async function uploadDocument(
  file: File,
  accessToken: string,
  documentTypeId: string,
  uploadedById: string,
  title?: string,
  status?: string
): Promise<UploadResponse> {
  return uploadFile(file, uploadConfig.endpoints.document, accessToken, {
    title: title || file.name,
    documentTypeId,
    uploadedById,
    status: status || 'PENDING',
  });
}

/**
 * Sube multimedia (imágenes, videos, etc.)
 */
export async function uploadMultimedia(
  file: File,
  accessToken: string,
  additionalData?: Record<string, any>
): Promise<UploadResponse> {
  return uploadFile(file, uploadConfig.endpoints.multimedia, accessToken, additionalData);
}

/**
 * Construye URL completa de un archivo
 */
export function buildFileUrl(filename: string): string {
  return `${uploadConfig.baseUrl}/${filename}`;
}

/**
 * Valida si un archivo puede ser subido
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Validar tamaño
  if (file.size > uploadConfig.maxFileSize) {
    return {
      valid: false,
      error: `Archivo demasiado grande. Máximo: ${uploadConfig.maxFileSize / 1024 / 1024}MB`,
    };
  }

  // Validar extensión
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  if (!fileExtension || !uploadConfig.allowedExtensions.includes(fileExtension)) {
    return {
      valid: false,
      error: `Extensión no permitida. Permitidas: ${uploadConfig.allowedExtensions.join(', ')}`,
    };
  }

  return { valid: true };
}
