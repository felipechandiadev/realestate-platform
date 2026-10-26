import { cache } from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getArticleById } from '@/features/cms/actions/articles.action'
import { metaDescription, pageMetadata } from '@/shared/lib/seo-core'
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

interface ArticlePageProps {
  params: Promise<{ id: string }>
}

// Se arma en el servidor para que Google reciba el texto completo del artículo.
const loadArticle = cache(async (id: string) => {
  const article = await getArticleById(id)
  return article && article.isActive !== false ? article : null
})

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const { id } = await params
  const article = await loadArticle(id)
  if (!article) return { title: 'Artículo no encontrado', robots: { index: false } }
  const seo = pageMetadata({
    path: `/blog/article/${id}`,
    title: article.title,
    description: metaDescription(article.subtitle || article.text),
  })
  const image = article.multimediaUrl && /^https?:\/\//i.test(article.multimediaUrl)
    ? [{ url: article.multimediaUrl, alt: article.title }]
    : undefined
  return {
    ...seo,
    openGraph: { ...seo.openGraph, type: 'article', publishedTime: article.createdAt, images: image },
  }
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { id } = await params
  const article = await loadArticle(id)
  if (!article) notFound()
  const relatedArticles = article.relatedArticles || []

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
