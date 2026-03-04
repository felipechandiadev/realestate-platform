"use client";

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button/Button';
import { Article } from '@/features/backoffice/cms/actions/articles.action';

export interface CategoriesBlogProps {
  articles: Article[];
  className?: string;
}

export default function CategoriesBlog({ articles, className = '' }: CategoriesBlogProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentCategory = searchParams.get('category');
  
  // Si category está vacío o no existe, es "Todos"
  const isAllCategories = !currentCategory || currentCategory === '';

  // Obtener categorías únicas de los artículos
  const categories = Array.from(new Set(articles.map(article => article.category)));

  const handleCategoryClick = (category: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (category) {
      params.set('category', category);
    } else {
      // Cuando es "Todos", establecer category a string vacío
      params.set('category', '');
    }

    // Mantener otros parámetros pero resetear página
    params.delete('page');

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : '';

    router.push(newUrl, { scroll: false });
  };

  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`}>
      {/* Botón "Todos" */}
      <Button
        variant={isAllCategories ? 'primary' : 'outlined'}
        size="sm"
        onClick={() => handleCategoryClick(null)}
        className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
      >
        Todos
      </Button>

      {/* Botones de categorías */}
      {categories.map((category) => (
        <Button
          key={category}
          variant={currentCategory === category ? 'primary' : 'outlined'}
          size="sm"
          onClick={() => handleCategoryClick(category)}
          className="rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
        >
          {category}
        </Button>
      ))}
    </div>
  );
}