"use client";

import React, { Suspense } from "react";
import {
  layoutPageContentClassName,
  layoutPageRootClassName,
  layoutPageSubtitleClassName,
} from "./layoutPageTokens";
import { CollectionGridHeader } from "../CollectionGrid/CollectionGridHeader";
import {
  buildContentGridClassNames,
  DEFAULT_COLLECTION_EMPTY_MESSAGE,
  renderCollectionGridContent,
  type CollectionGridColumnConfig,
} from "../CollectionGrid/collectionGridUtils";

export type { CollectionGridColumnConfig } from "../CollectionGrid/collectionGridUtils";

export type CollectionPageLayoutProps = {
  title?: string;
  subtitle?: string;
  addAction?: React.ReactNode;
  onAddClick?: () => void;
  addButtonAriaLabel?: string;
  showSearch?: boolean;
  searchParamName?: string;
  searchLabel?: string;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  contentItems?: React.ReactNode[];
  contentEmptyMessage?: string;
  contentGridColumns?: number | CollectionGridColumnConfig;
  contentGridGapClassName?: string;
  contentGridClassName?: string;
  contentGridItemsAlign?: "start" | "stretch";
  className?: string;
  "data-test-id"?: string;
};

function CollectionPageLayoutView({
  title,
  subtitle,
  addAction,
  onAddClick,
  addButtonAriaLabel = "Añadir",
  showSearch = true,
  searchParamName = "search",
  searchLabel = "Buscar",
  searchPlaceholder = "Buscar...",
  children,
  contentItems,
  contentGridColumns,
  contentGridGapClassName,
  contentGridClassName,
  contentEmptyMessage,
  contentGridItemsAlign,
  className = "",
  "data-test-id": dataTestId,
}: CollectionPageLayoutProps) {
  const subtitleTrim = subtitle?.trim() ?? "";
  const showSubtitle = Boolean(subtitleTrim);

  return (
    <div
      className={`${layoutPageRootClassName} ${className}`.trim()}
      data-test-id={dataTestId ?? "collection-page-layout-root"}
    >
      <CollectionGridHeader
        title={title}
        addAction={addAction}
        onAddClick={onAddClick}
        addButtonAriaLabel={addButtonAriaLabel}
        showSearch={showSearch}
        searchParamName={searchParamName}
        searchLabel={searchLabel}
        searchPlaceholder={searchPlaceholder}
        data-test-id="collection-page-layout-header"
      />
      {showSubtitle ? (
        <p className={layoutPageSubtitleClassName}>{subtitleTrim}</p>
      ) : null}

      <section
        className={layoutPageContentClassName}
        data-test-id="collection-page-layout-content"
      >
        {renderCollectionGridContent({
          contentItems,
          contentGridColumns,
          contentGridGapClassName,
          contentGridClassName,
          contentEmptyMessage: contentEmptyMessage ?? DEFAULT_COLLECTION_EMPTY_MESSAGE,
          contentGridItemsAlign,
          children,
          emptyTestId: "collection-page-layout-empty",
          gridTestId: "collection-page-layout-grid",
          cellTestIdPrefix: "collection-page-layout-cell",
        })}
      </section>
    </div>
  );
}

function CollectionPageLayoutFallback({
  title,
  subtitle,
  addAction,
  onAddClick,
  showSearch = true,
  children,
  contentItems,
  contentGridColumns,
  contentGridGapClassName,
  contentGridClassName,
  contentEmptyMessage,
  contentGridItemsAlign,
  className,
}: CollectionPageLayoutProps) {
  const titleTrim = title?.trim() ?? "";
  const subtitleTrim = subtitle?.trim() ?? "";
  const hasContentItems = contentItems != null;
  const hasGrid = hasContentItems && contentItems.length > 0;
  const isContentEmpty = hasContentItems && contentItems.length === 0;
  const hasCustomAdd = addAction !== undefined;
  const hasDefaultAdd = !hasCustomAdd && onAddClick != null;
  const hasAddSlot = hasCustomAdd || hasDefaultAdd;
  const showTitleRow = hasAddSlot || Boolean(titleTrim) || showSearch;
  const showSubtitle = Boolean(subtitleTrim);
  const showHeaderBlock = showTitleRow || showSubtitle;
  const emptyText =
    (contentEmptyMessage ?? DEFAULT_COLLECTION_EMPTY_MESSAGE).trim() ||
    DEFAULT_COLLECTION_EMPTY_MESSAGE;
  const fallbackAlignClass = contentGridItemsAlign === "stretch" ? "items-stretch" : "items-start";

  return (
    <div className={`${layoutPageRootClassName} ${className ?? ""}`.trim()}>
      {showHeaderBlock ? (
        <header className="w-full min-w-0" data-test-id="collection-page-layout-header">
          {showTitleRow ? (
            <>
              <div className="flex w-full items-center gap-2 py-0">
                {hasAddSlot ? (
                  <div
                    className="h-10 w-10 shrink-0 animate-pulse rounded-md bg-neutral/60"
                    aria-hidden
                    data-test-id="collection-page-layout-add-skeleton"
                  />
                ) : null}
                {titleTrim ? (
                  <div
                    className="h-7 w-40 max-w-[60%] shrink-0 animate-pulse rounded-md bg-neutral/60"
                    aria-hidden
                  />
                ) : null}
                <div className="min-w-0 flex-1" aria-hidden />
                {showSearch ? (
                  <div
                    className="hidden h-10 w-64 max-w-[40%] shrink-0 animate-pulse rounded-md bg-neutral/60 sm:block"
                    aria-hidden
                  />
                ) : null}
              </div>
              {showSearch ? (
                <div
                  className="mt-1 h-10 w-full max-w-xs animate-pulse rounded-md bg-neutral/60 sm:hidden"
                  aria-hidden
                />
              ) : null}
            </>
          ) : null}
          {showSubtitle ? (
            <div className="mt-2 h-4 w-72 max-w-full animate-pulse rounded-md bg-neutral/60" aria-hidden />
          ) : null}
        </header>
      ) : null}
      <section className={layoutPageContentClassName}>
        {hasGrid && contentItems ? (
          <div
            className={`grid w-full min-w-0 ${fallbackAlignClass} ${buildContentGridClassNames(
              contentGridColumns ?? 1,
            )} ${contentGridGapClassName?.trim() || "gap-4"} ${contentGridClassName ?? ""}`.trim()}
          >
            {contentItems.map((_, i) => (
              <div
                key={i}
                className="h-32 min-w-0 animate-pulse rounded-md bg-neutral/60"
                aria-hidden
                data-test-id={`collection-page-layout-cell-skeleton-${i}`}
              />
            ))}
          </div>
        ) : isContentEmpty ? (
          <div
            className="flex min-h-[12rem] w-full min-w-0 flex-col items-center justify-center py-10"
            data-test-id="collection-page-layout-empty"
          >
            <p className="text-center text-sm text-muted-foreground">{emptyText}</p>
          </div>
        ) : (
          children
        )}
      </section>
    </div>
  );
}

/**
 * Plantilla de página de colección/índice sin paginación integrada.
 * Para listas paginadas con pie tipo DataGrid, usa {@link CollectionGrid}.
 */
export function CollectionPageLayout(props: CollectionPageLayoutProps) {
  return (
    <Suspense fallback={<CollectionPageLayoutFallback {...props} />}>
      <CollectionPageLayoutView {...props} />
    </Suspense>
  );
}

export { buildContentGridClassNames };
export default CollectionPageLayout;
