'use client'

import React from 'react'
import { Article } from '@/features/backoffice/cms/actions/articles.action'

interface RelatedArticleMiniCardProps {
  article: Article
  fallbackImage: string
}

function formatDate(date?: string | Date): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(dateObj)
}

export default function RelatedArticleMiniCard({
  article,
  fallbackImage,
}: RelatedArticleMiniCardProps) {
  return (
    <div className="relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 group h-full flex flex-col">
      {/* Imagen */}
      <div className="relative w-full h-40 overflow-hidden bg-gray-200">
        <img
          src={article.multimediaUrl || fallbackImage}
          alt={article.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = fallbackImage
          }}
        />

        {/* Badge de categoría - esquina superior izquierda */}
        <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-full border border-white/30 shadow-sm">
          {article.category}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4 flex-1 flex flex-col">
        {/* Título */}
        <h3 className="text-sm font-bold text-foreground mb-2 line-clamp-2 leading-tight">
          {article.title}
        </h3>

        {/* Subtítulo */}
        {article.subtitle && (
          <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
            {article.subtitle}
          </p>
        )}

        {/* Separador */}
        <div className="flex-1" />

        {/* Fecha al pie */}
        <div className="text-xs text-muted-foreground pt-3 border-t border-gray-100">
          {formatDate(article.createdAt)}
        </div>
      </div>
    </div>
  )
}
