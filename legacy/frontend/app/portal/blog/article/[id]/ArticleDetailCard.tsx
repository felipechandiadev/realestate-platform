'use client'

import React from 'react'
import { Article } from '@/features/backoffice/cms/actions/articles.action'

interface ArticleDetailCardProps {
  article: Article
  fallbackImage: string
}

function formatDate(date?: string | Date): string {
  if (!date) return ''
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(dateObj)
}

export default function ArticleDetailCard({
  article,
  fallbackImage,
}: ArticleDetailCardProps) {
  return (
    <article className="w-full bg-white">
      {/* Imagen Hero */}
      <div className="relative mx-auto max-h-[70vh] overflow-hidden bg-gray-200 lg:max-w-6xl flex items-center justify-center">
        <img
          src={article.multimediaUrl || fallbackImage}
          alt={article.title}
          className="w-full h-full object-contain"
          onError={(e) => {
            const img = e.target as HTMLImageElement
            img.src = fallbackImage
          }}
        />
      </div>

      {/* Contenido */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Categoría y Fecha */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <span className="inline-block bg-primary text-white text-xs font-semibold px-4 py-2 rounded-full">
            {article.category}
          </span>
          <span className="text-sm text-muted-foreground">
            {formatDate(article.createdAt)}
          </span>
        </div>

        {/* Título */}
        <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
          {article.title}
        </h1>

        {/* Subtítulo */}
        {article.subtitle && (
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            {article.subtitle}
          </p>
        )}

        {/* Divider */}
        <div className="w-12 h-1 bg-primary rounded-full mb-8" />

        {/* Contenido del artículo */}
        <div className="prose prose-lg max-w-none text-foreground">
          <p className="text-base leading-relaxed whitespace-pre-wrap">
            {article.text}
          </p>
        </div>
      </div>
    </article>
  )
}
