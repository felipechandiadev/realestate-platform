/**
 * CMS Articles Management Page
 * 
 * Propósito:
 * - Gestionar artículos del blog/contenido editorial
 * - Visualizar listado de artículos publicados y borradores
 * - Búsqueda por título, autor, contenido
 * - Acciones: crear, editar, publicar, despublicar, eliminar
 * 
 * Funcionalidad:
 * - Server component: recibe searchParams (search)
 * - Fetcha datos de artículos desde getArticles action
 * - Renderiza ListArticles con listado filtrado
 * - Validación de respuesta y manejo de errores
 * 
 * Audiencia: Editores, Redactores, Administradores de contenido
 */

import React from 'react'
import { getArticles } from '@/features/backoffice/cms/actions/articles.action'
import { ArticlesContent } from '@/features/backoffice/cms/components'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function ArticlesPage({ searchParams }: PageProps) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : undefined

  const result = await getArticles({ search })
  const initialArticles = result.success && result.data ? result.data : []

  return <ArticlesContent initialArticles={initialArticles} initialSearch={search} />
}
