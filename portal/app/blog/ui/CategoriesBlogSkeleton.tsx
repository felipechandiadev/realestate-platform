'use client';

export default function CategoriesBlogSkeleton() {
  return (
    <div className="flex flex-wrap gap-2 justify-center" aria-hidden>
      {Array.from({ length: 5 }).map((_, index) => (
        <div
          key={index}
          className="h-9 rounded-full border border-gray-200/50 bg-gray-300/30 animate-pulse"
          style={{ width: `${72 + (index % 3) * 24}px` }}
        />
      ))}
    </div>
  );
}
