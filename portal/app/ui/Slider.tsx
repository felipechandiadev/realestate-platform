"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import { getPublicSlides, Slide } from "@/features/cms/actions/slides.action";
import { useSliderImagesReady } from "@/providers/SliderImagesReadyContext";

const AUTOPLAY_MS = 6000;
const CROSSFADE_MS = 800;
const EMPTY_BACKGROUND = "#F0F0F0";
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

type SlideAlign = "left" | "center" | "right";
type SlideCtaStyle = "none" | "button" | "link";

const ALIGN_CLASS: Record<SlideAlign, string> = {
  left: "items-start text-left",
  center: "items-center text-center mx-auto",
  right: "items-end text-right ml-auto",
};

function normalizeHex(value?: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return HEX_COLOR.test(trimmed) ? trimmed : null;
}

function isVideoUrl(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
}

function isExternalHref(href: string): boolean {
  return href.startsWith("http://") || href.startsWith("https://");
}

function resolveCta(slide: Slide): { style: SlideCtaStyle; label: string; href: string } | null {
  const href = slide.linkUrl?.trim() || "";
  const label = slide.ctaLabel?.trim() || "";
  const style = slide.ctaStyle;

  if (style === "button" || style === "link") {
    if (!label) return null;
    return { style, label, href: href || "/" };
  }

  if (slide.linkUrl?.trim() && !label) {
    return { style: "button", label: "Ver más", href: slide.linkUrl.trim() };
  }

  return null;
}

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setPrefersReducedMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return prefersReducedMotion;
}

function SlideCta({ slide }: { slide: Slide }) {
  const cta = resolveCta(slide);
  if (!cta) return null;

  const external = isExternalHref(cta.href);
  if (cta.style === "link") {
    const color = normalizeHex(slide.ctaLinkColor) || normalizeHex(slide.textColor) || "#ffffff";
    const className = "mt-6 inline-block text-xs font-medium underline underline-offset-4 transition hover:opacity-80 md:mt-8 md:text-base";
    if (external) {
      return (
        <a href={cta.href} className={className} style={{ color }} target="_blank" rel="noopener noreferrer">
          {cta.label}
        </a>
      );
    }
    return (
      <Link href={cta.href} className={className} style={{ color }}>
        {cta.label}
      </Link>
    );
  }

  const background = normalizeHex(slide.ctaButtonBgColor);
  const color = normalizeHex(slide.ctaButtonTextColor);
  const className = background || color
    ? "mt-6 inline-flex min-h-[40px] items-center rounded-lg px-4 py-2 text-xs font-semibold transition hover:opacity-95 md:mt-8 md:min-h-[44px] md:px-6 md:py-3 md:text-sm"
    : "mt-6 inline-flex min-h-[40px] items-center rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white transition hover:opacity-95 md:mt-8 md:min-h-[44px] md:px-6 md:py-3 md:text-sm";
  const style = {
    ...(background ? { backgroundColor: background } : {}),
    ...(color ? { color } : {}),
  };
  if (external) {
    return (
      <a href={cta.href} className={className} style={style} target="_blank" rel="noopener noreferrer">
        {cta.label}
      </a>
    );
  }
  return (
    <Link href={cta.href} className={className} style={style}>
      {cta.label}
    </Link>
  );
}

function SlideCopy({ slide }: { slide: Slide }) {
  const align = ALIGN_CLASS[slide.textAlign || "left"] ?? ALIGN_CLASS.left;
  const textColor = normalizeHex(slide.textColor);
  const textStyle = textColor
    ? { color: textColor }
    : { color: "#ffffff", textShadow: "2px 2px 8px #000, 0 0 2px #000" };

  return (
    <div className={`flex w-full max-w-2xl flex-col ${align}`}>
      {slide.title ? (
        <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-4xl lg:text-5xl" style={textStyle}>
          {slide.title}
        </h2>
      ) : null}
      {slide.description ? (
        <p className="mt-3 whitespace-pre-line text-xs sm:text-sm md:mt-4 md:text-xl" style={textStyle}>
          {slide.description}
        </p>
      ) : null}
      <SlideCta slide={slide} />
    </div>
  );
}

function NavButton({
  direction,
  color,
  onClick,
}: {
  direction: "prev" | "next";
  color: string;
  onClick: () => void;
}) {
  const Icon = direction === "prev" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      className={`absolute top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/25 transition hover:bg-black/40 ${
        direction === "prev" ? "left-3 md:left-5" : "right-3 md:right-5"
      }`}
      style={{ color }}
      aria-label={direction === "prev" ? "Slide anterior" : "Slide siguiente"}
      onClick={onClick}
    >
      <Icon className="h-5 w-5" strokeWidth={2} />
    </button>
  );
}

export default function Slider() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});
  const { setSliderImagesReady } = useSliderImagesReady();
  const pathname = usePathname();
  const isMainPortalPage = pathname === "/";
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    let ignore = false;
    async function fetchSlides() {
      try {
        const result = await getPublicSlides();
        if (ignore) return;
        if (result.success && result.data) {
          setSlides(result.data);
        } else {
          setSlides([]);
        }
      } catch {
        if (!ignore) setSlides([]);
      } finally {
        if (!ignore) setLoaded(true);
      }
    }
    fetchSlides();
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!isMainPortalPage) return;
    if (!loaded) {
      setSliderImagesReady(false);
      return;
    }
    if (slides.length === 0) {
      setSliderImagesReady(true);
      return;
    }

    const timer = setTimeout(() => {
      const images = document.querySelectorAll<HTMLImageElement>("[data-hero-slider] img");
      if (images.length === 0) {
        setSliderImagesReady(true);
        return;
      }
      let loadedCount = 0;
      const done = () => {
        loadedCount += 1;
        if (loadedCount >= images.length) setSliderImagesReady(true);
      };
      images.forEach((img) => {
        if (img.complete) done();
        else {
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [isMainPortalPage, loaded, slides, setSliderImagesReady]);

  const count = slides.length;
  const goTo = useCallback((next: number) => {
    setIndex(((next % count) + count) % count);
  }, [count]);

  useEffect(() => {
    if (prefersReducedMotion || count < 2 || !loaded) return;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const schedule = () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIndex((current) => (current + 1) % count);
      }, AUTOPLAY_MS);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        timeoutId = undefined;
        return;
      }
      schedule();
    };
    if (document.visibilityState !== "hidden") schedule();
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [index, count, prefersReducedMotion, loaded]);

  useEffect(() => {
    const current = slides[index];
    Object.entries(videoRefs.current).forEach(([id, video]) => {
      if (!video) return;
      if (current && id === current.id && isVideoUrl(current.multimediaUrl || "")) {
        video.currentTime = 0;
        video.play().catch(() => undefined);
      } else {
        video.pause();
      }
    });
  }, [index, slides]);

  if (!loaded || slides.length === 0) return null;

  const active = slides[index];
  const activeColor = normalizeHex(active?.textColor) || "#ffffff";
  const carousel = slides.length > 1;
  const sectionClass = "relative h-[380px] w-full overflow-hidden md:h-[560px]";

  return (
    <section
      data-hero-slider
      className={sectionClass}
      aria-roledescription={carousel ? "carousel" : undefined}
      aria-label="Destacados"
    >
      {slides.map((slide, i) => {
        const isActive = i === index;
        return (
          <div
            key={slide.id}
            className={`absolute inset-0 ${prefersReducedMotion ? "" : "transition-opacity ease-in-out"} ${
              isActive ? "z-10 opacity-100" : "pointer-events-none z-0 opacity-0"
            }`}
            style={prefersReducedMotion ? undefined : { transitionDuration: `${CROSSFADE_MS}ms` }}
            role="group"
            aria-roledescription="slide"
            aria-label={slide.title || `Slide ${i + 1}`}
            aria-hidden={!isActive}
          >
            {slide.multimediaUrl && isVideoUrl(slide.multimediaUrl) ? (
              <video
                ref={(node) => {
                  videoRefs.current[slide.id] = node;
                }}
                src={slide.multimediaUrl}
                className="absolute inset-0 h-full w-full object-cover"
                autoPlay={isActive}
                muted
                loop
                playsInline
                preload="metadata"
              />
            ) : slide.multimediaUrl ? (
              <img src={slide.multimediaUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
            ) : (
              <div className="absolute inset-0" style={{ backgroundColor: EMPTY_BACKGROUND }} />
            )}
            {(slide.overlayOpacity ?? 45) > 0 ? (
              <div
                className="absolute inset-0 bg-black"
                style={{ opacity: Math.min(90, Math.max(0, Number(slide.overlayOpacity ?? 45))) / 100 }}
              />
            ) : null}
            <div className={`absolute inset-x-0 bottom-0 z-10 ${carousel ? "pb-10 md:pb-12" : "pb-5 md:pb-6"}`}>
              <div className="mx-auto w-full max-w-6xl px-6 md:px-8">
                <SlideCopy slide={slide} />
              </div>
            </div>
          </div>
        );
      })}

      {carousel ? (
        <>
          <NavButton direction="prev" color={activeColor} onClick={() => goTo(index - 1)} />
          <NavButton direction="next" color={activeColor} onClick={() => goTo(index + 1)} />
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-2 md:bottom-5">
            {slides.map((slide, i) => {
              const isActive = i === index;
              const dotColor = normalizeHex(slide.textColor) || "#ffffff";
              return (
                <button
                  key={slide.id}
                  type="button"
                  className={`h-2.5 rounded-full transition-all duration-500 ${isActive ? "w-8" : "w-2.5 opacity-50 hover:opacity-80"}`}
                  style={{ backgroundColor: dotColor }}
                  aria-label={`Ir al slide ${i + 1}`}
                  aria-current={isActive ? "true" : undefined}
                  onClick={() => goTo(i)}
                />
              );
            })}
          </div>
        </>
      ) : null}
    </section>
  );
}