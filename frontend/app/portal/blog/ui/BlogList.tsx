"use client";

import React from 'react';
import { Article } from '@/features/backoffice/cms/actions/articles.action';
import ArticleCard from './ArticleCard';

export interface BlogListProps {
  blogs: Article[];
  loading?: boolean;
  emptyMessage?: string;
}

export default function BlogList({
  blogs,
  loading = false,
  emptyMessage = "No hay artículos disponibles"
}: BlogListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="bg-gray-200 rounded-lg overflow-hidden animate-pulse"
            style={{ aspectRatio: '4/3' }}
          >
            <div className="h-full bg-gradient-to-br from-gray-200 to-gray-300" />
          </div>
        ))}
      </div>
    );
  }

  if (!blogs || blogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-16 h-16"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-500 text-center max-w-md">
          Pronto publicaremos nuevos artículos sobre el mundo inmobiliario.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {blogs.map((article) => (
        <ArticleCard
          key={article.id}
          {...article}
        />
      ))}
    </div>
  );
}