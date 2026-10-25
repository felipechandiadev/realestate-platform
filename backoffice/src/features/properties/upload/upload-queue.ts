/**
 * Cola de subida de multimedia: sube los archivos de a uno y reporta el estado
 * de cada archivo, para que el usuario vea el avance mientras espera.
 */

export type UploadStatus = 'pending' | 'uploading' | 'done' | 'error';

export type UploadQueueItem = {
  id: string;
  file: File;
  status: UploadStatus;
  /** 0–100 */
  progress: number;
  error?: string;
};

export type UploadOne = (
  file: File,
  onProgress: (percent: number) => void,
) => Promise<void>;

let sequence = 0;

export function createQueueItems(files: File[]): UploadQueueItem[] {
  return files.map((file) => ({
    id: `${Date.now()}-${sequence++}-${file.name}`,
    file,
    status: 'pending',
    progress: 0,
  }));
}

/**
 * Sube en orden los ítems pendientes o con error. Un archivo que falla no
 * detiene la cola: queda marcado para reintentar.
 */
export async function runUploadQueue(
  items: UploadQueueItem[],
  uploadOne: UploadOne,
  onUpdate: (item: UploadQueueItem) => void,
): Promise<UploadQueueItem[]> {
  const results: UploadQueueItem[] = [];

  for (const original of items) {
    if (original.status === 'done') {
      results.push(original);
      continue;
    }

    let current: UploadQueueItem = { ...original, status: 'uploading', progress: 0, error: undefined };
    onUpdate(current);

    try {
      await uploadOne(current.file, (percent) => {
        // El 100 % lo marca el servidor al responder, no el fin del envío.
        current = { ...current, progress: Math.min(99, Math.max(0, Math.round(percent))) };
        onUpdate(current);
      });
      current = { ...current, status: 'done', progress: 100 };
    } catch (error) {
      current = {
        ...current,
        status: 'error',
        error: error instanceof Error ? error.message : 'Error al subir el archivo',
      };
    }

    onUpdate(current);
    results.push(current);
  }

  return results;
}

export function summarizeQueue(items: UploadQueueItem[]) {
  const done = items.filter((i) => i.status === 'done').length;
  const failed = items.filter((i) => i.status === 'error').length;
  const active = items.some((i) => i.status === 'uploading' || i.status === 'pending');
  return { total: items.length, done, failed, active, finished: items.length > 0 && !active };
}
