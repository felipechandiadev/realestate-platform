'use client';

import { useCallback, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import DataGrid from '@/shared/components/ui/DataGrid/DataGrid';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import { Button } from '@/shared/components/ui/Button/Button';
import { TextField } from '@/shared/components/ui/TextField';
import { useCMSArticlesGrid, useDeleteArticle } from '@/features/backoffice/cms/hooks';
import type { Article } from '@/features/backoffice/cms/types';

interface ArticleGridItem {
  id: string;
  title: string;
  slug: string;
  author: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ArticlesGridProps {
  onEdit?: (article: Article) => void;
  onRefresh?: () => void;
}

/**
 * Articles Grid Component
 *
 * Displays a paginated, sortable grid of all CMS articles
 * Supports searching, filtering, deletion, and inline actions
 *
 * @param {ArticlesGridProps} props - Component props
 * @returns {React.ReactNode} Grid component
 */
export function ArticlesGrid({ onEdit, onRefresh }: ArticlesGridProps) {
  const searchParams = useSearchParams();
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const page = parseInt(searchParams?.get('page') || '1');
  const limit = parseInt(searchParams?.get('limit') || '10');
  const sortField = searchParams?.get('sortField') || 'createdAt';
  const sort = searchParams?.get('sort') || 'desc';

  const {
    data: gridResponse,
    isLoading,
    error,
    refetch,
  } = useCMSArticlesGrid({
    page,
    limit,
    search: searchTerm,
    sortField: sortField as any,
    sortOrder: sort as 'asc' | 'desc',
    pagination: true,
    filtration: !!searchTerm,
  });

  const { mutate: deleteArticle, isPending: isDeleting } = useDeleteArticle();

  const articles = gridResponse?.items || [];
  const totalRecords = (gridResponse as any)?.total || articles.length;
  const totalPages = Math.ceil(totalRecords / limit);

  const gridItems: ArticleGridItem[] = useMemo(
    () =>
      articles.map((article: any) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        author: article.authorId || 'N/A',
        status: article.published ? 'Publicado' : 'Borrador',
        createdAt: new Date(article.createdAt).toLocaleDateString('es-MX'),
        updatedAt: new Date(article.updatedAt).toLocaleDateString('es-MX'),
      })),
    [articles]
  );

  const handleConfirmDelete = useCallback(() => {
    if (!selectedArticleId) return;

    deleteArticle(selectedArticleId);
    setOpenDeleteDialog(false);
    setSelectedArticleId(null);
    refetch();
    onRefresh?.();
  }, [selectedArticleId, deleteArticle, refetch, onRefresh]);

  const handleRowAction = useCallback(
    (action: string, row: ArticleGridItem) => {
      const article = articles.find((a: any) => a.id === row.id) as Article | undefined;
      if (!article) return;

      if (action === 'edit') {
        onEdit?.(article);
      } else if (action === 'delete') {
        setSelectedArticleId(row.id);
        setOpenDeleteDialog(true);
      }
    },
    [articles, onEdit]
  );

  const columns = [
    { field: 'title', headerName: 'Título', width: 300 },
    { field: 'slug', headerName: 'Slug', width: 200 },
    { field: 'author', headerName: 'Autor', width: 150 },
    { field: 'status', headerName: 'Estado', width: 100 },
    { field: 'createdAt', headerName: 'Creado', width: 120 },
    { field: 'updatedAt', headerName: 'Actualizado', width: 120 },
  ];

  const actions = [
    { label: 'Editar', id: 'edit', variant: 'blue' as const },
    { label: 'Eliminar', id: 'delete', variant: 'red' as const },
  ];

  if (error) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 className="text-red-900 font-semibold mb-2">
          Error al cargar artículos
        </h3>
        <Button variant="primary" onClick={() => refetch()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <TextField
          placeholder="Buscar por título, slug..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        <Button variant="secondary" onClick={() => refetch()}>
          Actualizar
        </Button>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <DataGrid
          columns={columns}
          rows={articles}
          loading={isLoading}
          pagination={{ page, limit: limit, rowCount: totalRecords }}
        />
      </div>

      <Dialog
        open={openDeleteDialog}
        onOpenChange={setOpenDeleteDialog}
        title="Eliminar Artículo"
        description="¿Está seguro de que desea eliminar este artículo?"
        actions={[
          {
            label: 'Cancelar',
            onClick: () => setOpenDeleteDialog(false),
            variant: 'secondary' as const,
          },
          {
            label: 'Eliminar',
            onClick: handleConfirmDelete,
            variant: 'danger' as const,
            loading: isDeleting,
          },
        ]}
      />
    </div>
  );
}
