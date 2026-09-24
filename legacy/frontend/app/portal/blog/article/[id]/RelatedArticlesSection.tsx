'use client'

import React from 'react'
import Link from 'next/link'
import { Article } from '@/features/backoffice/cms/actions/articles.action'
import RelatedArticleMiniCard from './RelatedArticleMiniCard'

interface RelatedArticlesSectionProps {
  articles: Article[]
  fallbackImage: string
}

export default function RelatedArticlesSection({
  articles,
  fallbackImage,
}: RelatedArticlesSectionProps) {
  return (
    <section className="w-full bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-6">
        {/* Encabezado */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Artículos Relacionados
          </h2>
          <p className="text-muted-foreground">
            Descubre más contenido de nuestro blog
          </p>
        </div>

        {/* Grid de artículos relacionados */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/portal/blog/article/${article.id}`}
              className="transition-transform duration-300 hover:scale-105"
            >
              <RelatedArticleMiniCard
                article={article}
                fallbackImage={fallbackImage}
              />
            </Link>
          ))}
        </div>

        {/* Botón para ver más */}
        <div className="flex justify-center mt-12">
          <Link
            href="/portal/blog"
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver todos los artículos
          </Link>
        </div>
      </div>
    </section>
  )
}
