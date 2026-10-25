'use client';

import { useCallback, useRef, useState } from 'react';
import { useSession } from 'next-auth/react';
import { env } from '@/lib/env';
import {
  createQueueItems,
  runUploadQueue,
  summarizeQueue,
  type UploadQueueItem,
} from './upload-queue';
import { uploadFileWithProgress } from './upload-file-xhr';

/**
 * Cola de subida de multimedia de una propiedad, archivo por archivo, con progreso.
 * `onItemDone` permite refrescar la galería a medida que llegan los archivos.
 */
export function usePropertyUploadQueue(options?: { onItemDone?: () => void }) {
  const { data: session } = useSession();
  const [items, setItems] = useState<UploadQueueItem[]>([]);
  const runningRef = useRef(false);
  const onItemDone = options?.onItemDone;

  const run = useCallback(
    async (propertyId: string, queue: UploadQueueItem[]) => {
      const token = (session as { accessToken?: string } | null)?.accessToken;
      if (runningRef.current) return queue;
      if (!token) {
        const failed = queue.map((item) =>
          item.status === 'done' ? item : { ...item, status: 'error' as const, error: 'Sesión expirada: vuelve a ingresar' },
        );
        setItems(failed);
        return failed;
      }

      runningRef.current = true;
      setItems(queue);
      try {
        return await runUploadQueue(
          queue,
          (file, onProgress) =>
            uploadFileWithProgress({
              url: `${env.backendApiUrl}/properties/${propertyId}/multimedia`,
              token,
              file,
              onProgress,
            }),
          (updated) => {
            setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
            if (updated.status === 'done') onItemDone?.();
          },
        );
      } finally {
        runningRef.current = false;
      }
    },
    [session, onItemDone],
  );

  const start = useCallback(
    (propertyId: string, files: File[]) => run(propertyId, createQueueItems(files)),
    [run],
  );

  const retryFailed = useCallback(
    (propertyId: string) => run(propertyId, items),
    [run, items],
  );

  const reset = useCallback(() => setItems([]), []);

  return { items, summary: summarizeQueue(items), start, retryFailed, reset };
}
