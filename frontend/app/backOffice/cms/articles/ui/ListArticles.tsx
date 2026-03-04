'use client';
import { useState, useEffect } from "react";
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from '@/shared/components/ui/Button/Button';
import { useAlert } from '@/providers/AlertContext';
import ArticleCard from './ArticleCard';
import CreateArticleDialog from './CreateArticleDialog';
import UpdateArticleDialog from './UpdateArticleDialog';
import DeleteArticleDialog from './DeleteArticleDialog';
import { Article } from '@/features/backoffice/cms/actions/articles.action';

export interface ListArticlesProps {
  articles: Article[];
  search?: string;
}

const ListArticles: React.FC<ListArticlesProps> = ({
  articles,
  search,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success, error } = useAlert();

  const [searchValue, setSearchValue] = useState(search || "");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [filteredArticles, setFilteredArticles] = useState(articles);

  useEffect(() => {
    setSearchValue(search || "");
    setFilteredArticles(articles);
  }, [search, articles]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    const params = new URLSearchParams(Array.from(searchParams.entries()));
    if (value) {
      params.set("search", value);
    } else {
      params.delete("search");
    }
    router.push(`?${params.toString()}`);
  };

  const handleCreateClick = () => {
    setCreateDialogOpen(true);
  };

  const handleEditClick = (article: Article) => {
    setSelectedArticle(article);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (article: Article) => {
    setSelectedArticle(article);
    setDeleteDialogOpen(true);
  };

  const handleRemoveArticle = (articleId: string) => {
    // Remover el artículo de la lista local
    setFilteredArticles((prevArticles) =>
      prevArticles.filter((article) => article.id !== articleId)
    );
  };

  const handleCreateSuccess = () => {
    setCreateDialogOpen(false);
    // La página se revalidará automáticamente por la action
  };

  const handleEditSuccess = () => {
    setEditDialogOpen(false);
    setSelectedArticle(null);
    // La página se revalidará automáticamente por la action
  };

  const handleDeleteSuccess = () => {
    setDeleteDialogOpen(false);
    setSelectedArticle(null);
    // La página se revalidará automáticamente por la action
  };

  const handleCloseDialogs = () => {
    setCreateDialogOpen(false);
    setEditDialogOpen(false);
    setDeleteDialogOpen(false);
    setSelectedArticle(null);
  };

  return (
    <div className="space-y-6">
      {/* Header with search and create button */}
      <div className="flex items-center w-full">
        <IconButton
          icon="add"
          variant="containedPrimary"
          onClick={handleCreateClick}
          ariaLabel="Crear artículo"
        />
        <TextField
          label=""
          placeholder="Buscar artículos..."
          value={searchValue}
          onChange={handleSearchChange}
          className="w-80 ml-auto"
          startIcon="search"
        />
      </div>

      {/* Articles grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12">
          <span className="material-symbols-outlined text-gray-400 mx-auto mb-4" style={{ fontSize: '64px' }}>
            article
          </span>
          <p className="text-muted-foreground">
            {searchValue ? 'No se encontraron artículos con esa búsqueda.' : 'No hay artículos disponibles.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onRemove={handleRemoveArticle}
            />
          ))}
        </div>
      )}

      {/* Dialogs */}
      <CreateArticleDialog
        open={createDialogOpen}
        onClose={handleCloseDialogs}
        onSuccess={handleCreateSuccess}
      />

      <UpdateArticleDialog
        open={editDialogOpen}
        onClose={handleCloseDialogs}
        onSuccess={handleEditSuccess}
        article={selectedArticle}
      />

      <DeleteArticleDialog
        open={deleteDialogOpen}
        onClose={handleCloseDialogs}
        onSuccess={handleDeleteSuccess}
        article={selectedArticle}
      />
    </div>
  );
};

export default ListArticles;