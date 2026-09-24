'use client';

import { useEffect, useState } from 'react';
import { LoadingState } from '@realestate/ui';
import { getPersonDocuments } from '@/features/contracts/actions/documents.action';

type DocumentsSectionProps = {
  personId?: string | null;
};

function formatDate(value?: string | Date | null) {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('es-CL');
  } catch {
    return String(value);
  }
}

export function DocumentsSection({ personId }: DocumentsSectionProps) {
  const [loading, setLoading] = useState(Boolean(personId));
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!personId) {
      setLoading(false);
      setItems([]);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      const result = await getPersonDocuments(personId);
      if (cancelled) return;
      if (!result.success) {
        setError(result.error || 'Error al cargar documentos');
        setItems([]);
      } else {
        setItems(result.data || []);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [personId]);

  if (!personId) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-documents-empty"
      >
        Requiere identidad vinculada para listar documentos
      </section>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingState label="Cargando documentos" />
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-red-600" data-test-id="community-user-documents-error">
        {error}
      </p>
    );
  }

  if (items.length === 0) {
    return (
      <section
        className="rounded-md border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground"
        data-test-id="community-user-documents-empty"
      >
        Sin documentos
      </section>
    );
  }

  return (
    <section className="space-y-2" data-test-id="community-user-documents-section">
      <ul className="divide-y divide-border rounded-md border border-border">
        {items.map((doc) => (
          <li
            key={doc.id}
            className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
            data-test-id="community-user-document-item"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">
                {doc.name || doc.filename || doc.type || 'Documento'}
              </p>
              <p className="text-xs text-muted-foreground">
                {doc.documentType?.name || doc.type || '—'} · {formatDate(doc.createdAt)}
              </p>
            </div>
            {doc.url ? (
              <a
                href={doc.url}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Abrir
              </a>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
