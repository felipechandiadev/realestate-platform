'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getArticleById, Article } from '@/features/backoffice/cms/actions/articles.action'
import DotProgress from '@/shared/components/ui/DotProgress/DotProgress'
import ArticleDetailCard from './ArticleDetailCard'
import RelatedArticlesSection from './RelatedArticlesSection'

const FALLBACK_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="400" viewBox="0 0 1200 400">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="Arial, Helvetica, sans-serif">
        Imagen no disponible
      </text>
    </svg>`
  );

export default function ArticleDetailPage() {
  const params = useParams()
  const id = params.id as string
  
  const [article, setArticle] = useState<Article | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      try {
        // Cargar artículo principal con sus relacionados (desde backend)
        const data = await getArticleById(id)
        
        if (data) {
          setArticle(data)
          // Los artículos relacionados vienen del backend
          setRelatedArticles((data as any).relatedArticles || [])
        }
      } catch (error) {
        console.error('Error loading article:', error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotProgress />
      </div>
    )
  }

  if (!article) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Artículo no encontrado</h1>
          <p className="text-muted-foreground">Lo sentimos, el artículo que buscas no existe.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      {/* Artículo Principal */}
      <ArticleDetailCard article={article} fallbackImage={FALLBACK_IMAGE_DATA_URL} />

      {/* Artículos Relacionados */}
      {relatedArticles.length > 0 && (
        <RelatedArticlesSection articles={relatedArticles} fallbackImage={FALLBACK_IMAGE_DATA_URL} />
      )}
    </div>
  )
}
