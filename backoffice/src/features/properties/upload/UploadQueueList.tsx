'use client';

import { CheckCircle2, Clock, Film, Image as ImageIcon, Loader2, XCircle } from 'lucide-react';
import type { UploadQueueItem } from './upload-queue';
import { summarizeQueue } from './upload-queue';

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;

const STATUS_LABEL: Record<UploadQueueItem['status'], string> = {
  pending: 'En espera',
  uploading: 'Subiendo…',
  done: 'Subido',
  error: 'Error',
};

/** Lista de la cola de subida con el estado y progreso de cada archivo. */
export function UploadQueueList({ items }: { items: UploadQueueItem[] }) {
  if (items.length === 0) return null;
  const { total, done, failed } = summarizeQueue(items);

  return (
    <div className="space-y-3" data-test-id="upload-queue">
      <p className="text-sm font-medium text-foreground" aria-live="polite">
        {done} de {total} archivo(s) subido(s)
        {failed > 0 ? ` · ${failed} con error` : ''}
      </p>
      <ul className="space-y-2">
        {items.map((item) => {
          const isVideo = item.file.type.startsWith('video/');
          return (
            <li key={item.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center gap-3">
                {isVideo ? (
                  <Film className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                ) : (
                  <ImageIcon className="h-5 w-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-foreground" title={item.file.name}>
                    {item.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatSize(item.file.size)} · {STATUS_LABEL[item.status]}
                    {item.status === 'uploading' ? ` ${item.progress}%` : ''}
                  </p>
                </div>
                {item.status === 'done' ? (
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" aria-label="Subido" />
                ) : item.status === 'error' ? (
                  <XCircle className="h-5 w-5 shrink-0 text-red-600" aria-label="Error" />
                ) : item.status === 'uploading' ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-primary" aria-label="Subiendo" />
                ) : (
                  <Clock className="h-5 w-5 shrink-0 text-muted-foreground" aria-label="En espera" />
                )}
              </div>
              {item.status === 'uploading' || item.status === 'done' ? (
                <div
                  className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuenow={item.progress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className={`h-full transition-all ${item.status === 'done' ? 'bg-green-600' : 'bg-primary'}`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>
              ) : null}
              {item.error ? <p className="mt-2 text-xs text-red-600">{item.error}</p> : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
