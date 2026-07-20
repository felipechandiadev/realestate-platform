"use client";
import React from "react";

import {
  layoutPageContentClassName,
  layoutPageHeaderClassName,
  layoutPageRootClassName,
  layoutPageSubtitleClassName,
  layoutPageTitleClassName,
} from "./layoutPageTokens";

export type BasicPageLayoutProps = {
  /** Título principal (h1). */
  title?: React.ReactNode;
  /** Texto o nodo bajo el título. */
  subtitle?: React.ReactNode;
  /**
   * Acciones o controles alineados a la derecha del encabezado (p. ej. selector de vista).
   * Misma fila que el bloque de títulos en `md+`.
   */
  headerEnd?: React.ReactNode;
  /** Contenido principal de la página. */
  children: React.ReactNode;
  className?: string;
  /** Clases extra en el contenedor del cuerpo (debajo del encabezado). */
  contentClassName?: string;
  /** Clases extra en el contenedor del encabezado. */
  headerClassName?: string;
  "data-test-id"?: string;
};

function hasHeadingChunk(node: React.ReactNode): boolean {
  if (node == null || node === false) return false;
  if (typeof node === "string") return node.trim().length > 0;
  if (typeof node === "number") return true;
  return true;
}

/**
 * Layout mínimo de página: encabezado opcional (título + subtítulo) y área de contenido.
 * Sin `"use client"` — usable en Server y Client Components.
 */
export function BasicPageLayout({
  title,
  subtitle,
  headerEnd,
  children,
  className = "",
  contentClassName = "",
  headerClassName = "",
  "data-test-id": dataTestId,
}: BasicPageLayoutProps) {
  const showTitle = hasHeadingChunk(title);
  const showSubtitle = hasHeadingChunk(subtitle);
  const showHeading = showTitle || showSubtitle;
  const showHeaderEnd = hasHeadingChunk(headerEnd);

  const titlesBlock =
    showHeading ? (
      <div className="min-w-0" data-test-id="basic-page-layout-titles">
        {showTitle ? (
          <h1 className={layoutPageTitleClassName}>{title}</h1>
        ) : null}
        {showSubtitle ? (
          <p
            className={layoutPageSubtitleClassName}
            data-test-id="basic-page-layout-subtitle"
          >
            {subtitle}
          </p>
        ) : null}
      </div>
    ) : null;

  return (
    <div
      className={`${layoutPageRootClassName} ${className}`.trim()}
      data-test-id={dataTestId ?? "basic-page-layout"}
    >
      {showHeading || showHeaderEnd ? (
        <header
          className={`${layoutPageHeaderClassName} ${headerClassName}`.trim()}
          data-test-id="basic-page-layout-header"
        >
          {showHeading && showHeaderEnd ? (
            <div
              className="grid w-full min-w-0 grid-cols-1 items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto] md:gap-4"
              data-test-id="basic-page-layout-header-row"
            >
              {titlesBlock}
              <div
                className="flex min-w-0 justify-start md:justify-end md:justify-self-end"
                data-test-id="basic-page-layout-header-end"
              >
                {headerEnd}
              </div>
            </div>
          ) : showHeading ? (
            titlesBlock
          ) : (
            <div
              className="flex min-w-0 w-full justify-end"
              data-test-id="basic-page-layout-header-end"
            >
              {headerEnd}
            </div>
          )}
        </header>
      ) : null}

      <section
        className={`${layoutPageContentClassName} ${contentClassName}`.trim()}
        data-test-id="basic-page-layout-content"
      >
        {children}
      </section>
    </div>
  );
}
