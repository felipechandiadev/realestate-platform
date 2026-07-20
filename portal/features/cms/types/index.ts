/**
 * @fileoverview CMS domain types
 * Handles Articles, About Us, Testimonials, and Slide content
 */

/**
 * Article entity
 */
export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  description: string;
  excerpt?: string;
  author: string;
  category: string;
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  thumbnail?: string;
  seoTitle?: string;
  seoDescription?: string;
  relatedArticles?: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * About Us page content
 */
export interface AboutUs {
  id: string;
  title: string;
  content: string;
  mission: string;
  vision: string;
  values: string[];
  team: TeamMember[];
  images: ContentImage[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Team member in About Us
 */
export interface TeamMember {
  id: string;
  name: string;
  position: string;
  bio: string;
  image?: string;
  email?: string;
}

/**
 * Testimonial from satisfied clients
 */
export interface Testimonial {
  id: string;
  name: string;
  clientName?: string;
  email?: string;
  role?: string;
  company?: string;
  content: string;
  text?: string;
  rating: number;
  image?: string;
  featured: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Carousel/Slider content
 */
export interface Slide {
  id: string;
  title: string;
  description?: string;
  image: string;
  url?: string;
  order: number;
  active: boolean;
  cta?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Generic content image
 */
export interface ContentImage {
  id: string;
  url: string;
  alt: string;
  caption?: string;
  order: number;
}

/**
 * Article grid item for lists
 */
export interface ArticleGridItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  thumbnail?: string;
  author: string;
  category: string;
  featured: boolean;
  published: boolean;
  publishedAt?: Date;
  views: number;
}

/**
 * Response for paginated articles
 */
export interface ArticleGridResponse {
  items: ArticleGridItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Create article DTO
 */
export interface CreateArticleDto {
  title: string;
  slug: string;
  content: string;
  description: string;
  excerpt?: string;
  author: string;
  category: string;
  featured?: boolean;
  published?: boolean;
  thumbnail?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type CreateArticleInput = CreateArticleDto;

/**
 * Update article DTO
 */
export interface UpdateArticleDto {
  title?: string;
  content?: string;
  description?: string;
  author?: string;
  category?: string;
  featured?: boolean;
  published?: boolean;
  thumbnail?: string;
  seoTitle?: string;
  seoDescription?: string;
}

export type UpdateArticleInput = UpdateArticleDto;

/**
 * Update About Us DTO
 */
export interface UpdateAboutUsDto {
  title?: string;
  content?: string;
  mission?: string;
  vision?: string;
  values?: string[];
}

export type UpdateAboutUsInput = UpdateAboutUsDto;

/**
 * Create testimonial DTO
 */
export interface CreateTestimonialDto {
  name: string;
  email?: string;
  role?: string;
  company?: string;
  content: string;
  rating: number;
  image?: string;
  featured?: boolean;
  published?: boolean;
  // Compatibility aliases
  clientName?: string;
  text?: string;
}

export type CreateTestimonialInput = CreateTestimonialDto;

/**
 * Update testimonial DTO
 */
export interface UpdateTestimonialDto {
  name?: string;
  content?: string;
  rating?: number;
  image?: string;
  featured?: boolean;
  published?: boolean;
}

export type UpdateTestimonialInput = UpdateTestimonialDto;

/**
 * Create slide DTO
 */
export interface CreateSlideDto {
  title: string;
  description?: string;
  image: string;
  url?: string;
  order: number;
  active?: boolean;
  cta?: string;
}

export type CreateSlideInput = CreateSlideDto;

/**
 * Update slide DTO
 */
export interface UpdateSlideDto {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  order?: number;
  active?: boolean;
  cta?: string;
}

export type UpdateSlideInput = UpdateSlideDto;

/**
 * Query parameters for filtering articles
 */
export interface ArticleQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  featured?: boolean;
  published?: boolean;
  sortField?: 'createdAt' | 'views' | 'title';
  sortOrder?: 'asc' | 'desc';
  pagination?: boolean;
  filtration?: boolean;
}