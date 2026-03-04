"use client";

import React from 'react';
import Link from 'next/link';
import { Article } from '@/features/backoffice/cms/actions/articles.action';

export type ArticleCardProps = Article;

const FALLBACK_IMAGE_DATA_URL =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="400" viewBox="0 0 300 400">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="16" font-family="Arial, Helvetica, sans-serif">
        Imagen no disponible
      </text>
    </svg>`
  );

function formatDate(date?: string | Date): string {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(dateObj);
}

export default function ArticleCard({
  id,
  title,
  subtitle,
  text,
  category,
  multimediaUrl,
  createdAt,
}: ArticleCardProps) {
  const CardInner = (
    <div
      className="relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
      style={{ aspectRatio: '3/4' }}
    >
      {/* Imagen con etiqueta img */}
      <img
        src={multimediaUrl || FALLBACK_IMAGE_DATA_URL}
        alt={title}
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => {
          const img = e.target as HTMLImageElement;
          img.src = FALLBACK_IMAGE_DATA_URL;
        }}
      />

      {/* Overlay gradiente sutil en la parte inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent" />

      {/* Badge de categoría y fecha - misma fila con space between */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
        <div className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-white/30 shadow-sm">
          {category}
        </div>

        {createdAt && (
          <div className="bg-black/70 backdrop-blur-sm text-white/90 text-xs font-medium px-3 py-1.5 rounded-lg">
            {formatDate(createdAt)}
          </div>
        )}
      </div>

      {/* Contenido principal - parte inferior con mejor espaciado */}
      <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
        <div className="text-left">
          <h3
            className="text-white text-xl font-bold mb-2 leading-tight"
            style={{
              textShadow: '0 2px 4px rgba(0,0,0,0.5), 0 1px 2px rgba(0,0,0,0.3)'
            }}
          >
            {title.length > 60 ? `${title.substring(0, 60)}...` : title}
          </h3>
          {subtitle && (
            <p
              className="text-gray-300 text-xs leading-snug font-normal"
              style={{
                textShadow: '0 1px 2px rgba(0,0,0,0.4)'
              }}
            >
              {subtitle.length > 80 ? `${subtitle.substring(0, 80)}...` : subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Overlay hover sutil */}
      <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
    </div>
  );

  return (
    <Link href={`/portal/blog/article/${id}`}>
      {CardInner}
    </Link>
  );
}