import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { app } from './config';
import { USE_MOCK } from './mockDb';

/**
 * Obtém a instância ativa do Firebase Storage
 */
export const getStorageInstance = () => {
  return getStorage(app);
};

/**
 * Upload genérico de arquivo para o Firebase Storage
 * @param file Arquivo do tipo File ou Blob
 * @param storagePath Caminho no bucket (ex: 'occupational_exams/emp-1/file.pdf')
 * @returns URL pública de download segura (HTTPS)
 */
export const uploadFileToStorage = async (
  file: File | Blob,
  storagePath: string
): Promise<string> => {
  if (USE_MOCK) {
    return URL.createObjectURL(file);
  }

  try {
    const storage = getStorage(app);
    const fileRef = ref(storage, storagePath);
    const contentType = file instanceof File && file.type ? file.type : 'application/octet-stream';
    
    const snapshot = await uploadBytes(fileRef, file, {
      contentType
    });

    const downloadUrl = await getDownloadURL(snapshot.ref);
    return downloadUrl;
  } catch (error) {
    console.error('Erro no upload para o Cloud Storage:', error);
    throw error;
  }
};

/**
 * Upload especializado de comprovante/laudo de Exame Ocupacional (ASO)
 * @param file Arquivo selecionado (PDF, PNG, JPG, etc)
 * @param employeeId Identificador do colaborador
 * @param examType Tipo do exame (Admissional, Periódico, etc)
 * @returns URL pública de download segura
 */
export const uploadOccupationalExamDoc = async (
  file: File,
  employeeId: string,
  examType: string = 'ASO'
): Promise<string> => {
  const cleanEmpId = (employeeId || 'geral').replace(/[^a-zA-Z0-9_-]/g, '_');
  const cleanType = (examType || 'ASO').replace(/[^a-zA-Z0-9_-]/g, '_');
  const timestamp = Date.now();
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `occupational_exams/${cleanEmpId}/${cleanType}_${timestamp}_${cleanFileName}`;

  return uploadFileToStorage(file, path);
};

/**
 * Exclusão de arquivo do Firebase Storage
 * @param fileUrlOrPath URL completa do download ou caminho relativo
 */
export const deleteFileFromStorage = async (fileUrlOrPath: string): Promise<void> => {
  if (USE_MOCK || !fileUrlOrPath) return;

  try {
    const storage = getStorage(app);
    const fileRef = ref(storage, fileUrlOrPath);
    await deleteObject(fileRef);
  } catch (error) {
    console.warn('Aviso ao excluir arquivo do Cloud Storage (pode já ter sido removido):', error);
  }
};
