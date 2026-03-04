'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { getArticles, type Article } from '@/features/backoffice/cms/actions/articles.action';
import { useAlert } from '@/providers/AlertContext';
import ArticleCard from './ArticleCard';
import CreateArticleDialog from './CreateArticleDialog';
import UpdateArticleDialog from './UpdateArticleDialog';
import DeleteArticleDialog from './DeleteArticleDialog';

interface ArticlesContentProps {
  initialArticles: Article[];
  initialSearch?: string;
}

/**
 * Articles Content Component
 *
 * Main container for CMS articles management
 * Combines grid, create, and edit dialogs
 *
 * @returns {React.ReactNode} Articles management interface
 */
export function ArticlesContent({ initialArticles, initialSearch = '' }: ArticlesContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const alert = useAlert();

  const [search, setSearch] = useState(initialSearch);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [isLoading, setIsLoading] = useState(false);

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    setSearch(searchParams.get('search') || '');
  }, [searchParams]);

  const refreshArticles = async () => {
    setIsLoading(true);
    try {
      const result = await getArticles({ search: search || undefined });
      if (result.success) {
        setArticles(result.data || []);
      } else {
        alert.error(result.error || 'Error al cargar artículos');
      }
    } catch (error) {
      console.error('Error recargando artículos:', error);
      alert.error('Error al recargar artículos');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearch(value);

    const params = new URLSearchParams();
    if (value.trim()) {
      params.set('search', value.trim());
    }

    router.replace(params.toString() ? `?${params.toString()}` : '?');
  };

  const handleCreate = () => {
    setSelectedArticle(null);
    setIsCreateDialogOpen(true);
  };

  const handleEdit = (article: Article) => {
    setSelectedArticle(article);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (article: Article) => {
    setSelectedArticle(article);
    setIsDeleteDialogOpen(true);
  };

  const handleCreateSuccess = () => {
    setIsCreateDialogOpen(false);
    refreshArticles();
  };

  const handleEditSuccess = () => {
    setIsEditDialogOpen(false);
    setSelectedArticle(null);
    refreshArticles();
  };

  const handleDeleteSuccess = () => {
    setIsDeleteDialogOpen(false);
    setSelectedArticle(null);
    refreshArticles();
  };

  const filteredArticles = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return articles;

    return articles.filter((article) => {
      const title = article.title?.toLowerCase() ?? '';
      const subtitle = article.subtitle?.toLowerCase() ?? '';
      const text = article.text?.toLowerCase() ?? '';
      const category = article.category?.toLowerCase() ?? '';

      return (
        title.includes(term) ||
        subtitle.includes(term) ||
        text.includes(term) ||
        category.includes(term)
      );
    });
  }, [articles, search]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Artículos</h1>
          <p className="text-muted-foreground mt-1">Gestiona los artículos del blog</p>
        </div>
        <IconButton
          ariaLabel="Agregar artículo"
          variant="text"
          onClick={handleCreate}
          icon="add"
          size="lg"
        />
      </div>

      <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
        <TextField
          label="Buscar artículos"
          value={search}
          onChange={handleSearchChange}
          startIcon="search"
          placeholder="Buscar por título, subtítulo o categoría..."
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-background rounded-lg border border-border shadow-sm overflow-hidden"
            >
              <div className="aspect-video bg-gray-100 animate-pulse" />
              <div className="p-6 space-y-3">
                <div className="h-6 bg-neutral animate-pulse rounded" />
                <div className="h-4 bg-neutral animate-pulse rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-muted">
          <span className="material-symbols-outlined text-6xl mb-4 block">
            article
          </span>
          <p className="text-lg font-medium mb-2 text-foreground">
            {search
              ? `No se encontraron artículos para "${search}"`
              : 'No hay artículos para mostrar.'}
          </p>
          {search && (
            <p className="text-sm">
              Intenta con otros términos de búsqueda o crea un nuevo artículo.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full items-stretch">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <CreateArticleDialog
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onSuccess={handleCreateSuccess}
      />

      <UpdateArticleDialog
        open={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setSelectedArticle(null);
        }}
        onSuccess={handleEditSuccess}
        article={selectedArticle}
      />

      <DeleteArticleDialog
        open={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedArticle(null);
        }}
        onSuccess={handleDeleteSuccess}
        article={selectedArticle}
      />
    </div>
  );
}
