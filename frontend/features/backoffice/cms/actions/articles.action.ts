'use server'

import { revalidatePath } from 'next/cache'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { env } from '@/lib/env'
import { ArticleCategory } from '@/shared/types/article'

// Types
export interface Article {
  id: string;
  title: string;
  subtitle?: string;
  text: string;
  multimediaUrl?: string;
  category: ArticleCategory;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleDto {
  title: string;
  subtitle?: string;
  text: string;
  multimediaUrl?: string;
  category: ArticleCategory;
}

export interface UpdateArticleDto {
  title?: string;
  subtitle?: string;
  text?: string;
  multimediaUrl?: string;
  category?: ArticleCategory;
}

export interface GetArticlesParams {
  search?: string;
  category?: string;
  limit?: number;
  offset?: number;
}

export async function getArticles(params: GetArticlesParams = {}): Promise<{
  success: boolean;
  data?: Article[];
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const url = new URL(`${env.backendApiUrl}/articles`)

    // Agregar parámetros de búsqueda
    if (params.search) {
      url.searchParams.set('search', params.search)
    }

    // Agregar parámetro de categoría
    if (params.category) {
      url.searchParams.set('category', params.category)
    }

    const res = await fetch(url.toString(), {
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `HTTP ${res.status}`
      }
    }

    const data = await res.json()
    return { success: true, data }
  } catch (error) {
    console.error('Error fetching articles:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

/**
 * Obtiene artículos públicos del blog (sin autenticación requerida)
 */
export async function listArticles(params: GetArticlesParams = {}): Promise<Article[]> {
  try {
    const queryParams = new URLSearchParams();

    if (params.search) queryParams.append('search', params.search);
    if (params.category) queryParams.append('category', params.category);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const url = `${env.backendApiUrl}/articles?${queryParams.toString()}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Failed to fetch articles: ${res.statusText}`)
    }

    const data = await res.json()
    return Array.isArray(data) ? data : data.data || []
  } catch (error) {
    console.error('Error fetching articles:', error)
    return []
  }
}

/**
 * Obtiene un artículo público por ID (sin autenticación requerida)
 * Incluye artículos relacionados basados en estrategia robusta
 */
export async function getArticleById(id: string): Promise<Article | null> {
  try {
    const url = `${env.backendApiUrl}/articles/${id}`;

    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    if (!res.ok) {
      console.error(`Failed to fetch article ${id}: ${res.statusText}`)
      return null
    }

    const data = await res.json()
    return data || null
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

export async function createArticle(formData: FormData): Promise<{
  success: boolean;
  data?: Article;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/articles`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to create article: ${res.status}`
      }
    }

    const result = await res.json()

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/articles')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error creating article:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function updateArticle(id: string, formData: FormData): Promise<{
  success: boolean;
  data?: Article;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/articles/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: formData,
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to update article: ${res.status}`
      }
    }

    const result = await res.json()

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/articles')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error updating article:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function deleteArticle(id: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to delete article: ${res.status}`
      }
    }

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/articles')

    return { success: true }
  } catch (error) {
    console.error('Error deleting article:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function toggleArticleActive(id: string, isActive: boolean): Promise<{
  success: boolean;
  data?: Article;
  error?: string;
}> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.accessToken) {
      return { success: false, error: 'No authenticated' }
    }

    const res = await fetch(`${env.backendApiUrl}/articles/${id}/toggle-active`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${session.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => null)
      return {
        success: false,
        error: errorData?.message || `Failed to toggle article: ${res.status}`
      }
    }

    const result = await res.json()

    // Revalidar la página para reflejar los cambios
    revalidatePath('/backOffice/cms/articles')
    revalidatePath('/portal/blog')

    return { success: true, data: result }
  } catch (error) {
    console.error('Error toggling article:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}