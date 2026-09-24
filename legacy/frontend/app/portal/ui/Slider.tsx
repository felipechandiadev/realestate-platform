"use client";
import React, { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getPublicSlides, Slide } from "@/features/backoffice/cms/actions/slides.action";
import { useSliderImagesReady } from "@/providers/SliderImagesReadyContext";
import { usePathname } from "next/navigation";

interface SliderProps {
  transitionTime?: number;
}

export default function Slider({ transitionTime = 2000 }: SliderProps) {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState(0);
  const [sliderHeight, setSliderHeight] = useState<number | null>(null);
  const videoRefs = React.useRef<{ [key: string]: HTMLVideoElement | null }>({});
  const sliderRef = useRef<HTMLDivElement>(null);
  const { setSliderImagesReady } = useSliderImagesReady();
  const pathname = usePathname();
  
  // Only track slider images for the main /portal page, not /portal/* subpages
  const isMainPortalPage = pathname === '/portal';

  // Calculate initial height to reach bottom of viewport
  useEffect(() => {
    if (typeof window !== 'undefined' && sliderRef.current) {
      const sliderTop = sliderRef.current.getBoundingClientRect().top;
      const availableHeight = window.innerHeight - sliderTop;
      setSliderHeight(availableHeight);
    }
  }, []); // Solo se ejecuta una vez al montar

  // Helper functions
  const isVideo = (url: string) => {
    return /\.mp4$/i.test(url);
  };

  const goToSlide = (index: number) => {
    setCurrent(index);
  };

  const goToPrevious = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
  };

  // Fetch slides data
  useEffect(() => {
    async function fetchSlides() {
      try {
        setLoading(true);
        setError(null);
        const result = await getPublicSlides();
        
        if (result.success && result.data) {
          setSlides(result.data);
        } else {
          setError(result.error || 'Error al cargar slides');
        }
      } catch (err) {
        setError('Error interno al cargar slides');
      } finally {
        setLoading(false);
      }
    }

    fetchSlides();
  }, []);

  // Wait for images to be loaded before clearing splash screen
  // Only track on main /portal page, not on /portal/* subpages
  useEffect(() => {
    // Only report image loading state on main /portal page
    if (!isMainPortalPage) {
      return;
    }

    if (slides.length === 0) {
      setSliderImagesReady(false);
      return;
    }

    // Pequeño delay para permitir que React renderice las imágenes en el DOM
    const checkImagesReady = () => {
      const sliderContainer = sliderRef.current;
      if (!sliderContainer) {
        setSliderImagesReady(false);
        return;
      }

      // Buscar todas las imágenes en el slider
      const images = sliderContainer.querySelectorAll('img');
      
      if (images.length === 0) {
        // Si no hay imágenes (todos son videos o sin media), considerar listo
        setSliderImagesReady(true);
        return;
      }

      // Contar cuántas imágenes ya están cargadas
      let loadedCount = 0;
      let totalImages = images.length;

      // Función para verificar si todos han cargado
      const checkAllLoaded = () => {
        if (loadedCount === totalImages) {
          setSliderImagesReady(true);
        }
      };

      // Agregar listeners a cada imagen
      images.forEach((img) => {
        const imgElement = img as HTMLImageElement;
        
        // Si la imagen ya está cargada (cached)
        if (imgElement.complete) {
          loadedCount++;
        } else {
          // Esperar a que cargue
          imgElement.addEventListener('load', () => {
            loadedCount++;
            checkAllLoaded();
          });

          // En caso de error de carga, contar como cargada para no bloquear
          imgElement.addEventListener('error', () => {
            loadedCount++;
            checkAllLoaded();
          });
        }
      });

      // Verificar inmediatamente por si todas ya están cargadas
      checkAllLoaded();
    };

    // Esperar a que se rendericen las imágenes
    const timer = setTimeout(checkImagesReady, 100);

    return () => clearTimeout(timer);
  }, [slides, setSliderImagesReady, isMainPortalPage]);

  // Auto-advance effect
  useEffect(() => {
    // No auto-advance si hay 1 o menos slides
    if (slides.length <= 1) return;

    // Obtener slide actual y su duración
    const currentSlide = slides[current];
    if (!currentSlide) return;

  const duration = ((currentSlide.duration ?? 0) + 3) * 1000; // 3 segundos base + lo que viene del backend

    console.log(`Slide ${current + 1}: "${currentSlide.title}" - Duración: ${duration}ms`); // Debug

    // Configurar timeout para avanzar al siguiente slide
    const timeoutId = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, duration);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
    };
  }, [current, slides]); // Solo depende de current y slides

  // Effect para manejar autoplay de videos
  useEffect(() => {
    const currentSlide = slides[current];
    if (currentSlide && currentSlide.multimediaUrl && isVideo(currentSlide.multimediaUrl)) {
      const videoElement = videoRefs.current[currentSlide.id];
      if (videoElement) {
        // Pausar todos los otros videos primero
        Object.keys(videoRefs.current).forEach(slideId => {
          const video = videoRefs.current[slideId];
          if (video && slideId !== currentSlide.id) {
            video.pause();
          }
        });

        // Reproducir el video actual
        videoElement.currentTime = 0;
        const playPromise = videoElement.play();
        
        if (playPromise !== undefined) {
          playPromise.catch((error: any) => {
            console.warn('Autoplay bloqueado por el navegador:', error);
            // Intentar reproducir después de un pequeño delay
            setTimeout(() => {
              videoElement.play().catch(() => {
                console.warn('Segunda tentativa de autoplay fallida');
              });
            }, 100);
          });
        }
      }
    }
  }, [current, slides]);

  // Loading state
  // if (loading) {
  //   return (
  //     <div 
  //       ref={sliderRef}
  //       className="w-full relative overflow-hidden"
  //       style={{ height: sliderHeight ? `${sliderHeight}px` : '80vh' }}
  //     >
  //       {/* Fondo base */}
  //       <div 
  //         className="absolute inset-0"
  //         style={{ 
  //           background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 60%, rgba(4, 201, 231, 0.6) 100%)'
  //         }} 
  //       />
        
  //       {/* Efecto shimmer animado */}
  //       <div 
  //         className="absolute inset-0"
  //         style={{
  //           background: 'linear-gradient(135deg, transparent, rgba(4, 201, 231, 0.6), transparent)',
  //           backgroundSize: '200% 100%',
  //           animation: 'shimmerSlide 2.5s ease-in-out infinite',
  //         }}
  //       />
  //     </div>
  //   );
  // }

  // Error state
  // if (error) {
  //   return (
  //     <div 
  //       ref={sliderRef}
  //       className="w-full flex items-center justify-center"
  //       style={{ 
  //         height: sliderHeight ? `${sliderHeight}px` : '80vh',
  //         background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 60%, rgba(4, 201, 231, 0.6) 100%)'
  //       }}
  //     >
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold text-gray-700 mb-2">Error al cargar slides</h2>
  //         <p className="text-gray-500">{error}</p>
  //       </div>
  //     </div>
  //   );
  // }

  // No slides state
  // if (slides.length === 0) {
  //   return (
  //     <div 
  //       ref={sliderRef}
  //       className="w-full flex items-center justify-center"
  //       style={{ 
  //         height: sliderHeight ? `${sliderHeight}px` : '80vh',
  //         background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 60%, rgba(4, 201, 231, 0.6) 100%)'
  //       }}
  //     >
  //       <div className="text-center">
  //         <h2 className="text-xl font-semibold text-gray-700 mb-2">No hay slides disponibles</h2>
  //         <p className="text-gray-500">No se encontraron slides activos para mostrar</p>
  //       </div>
  //     </div>
  //   );
  // }

  const currentSlide = slides[current];

  // Si no hay slide actual, retornar contenedor vacío
  if (!currentSlide) {
    return (
      <div 
        ref={sliderRef}
        className="w-full relative overflow-hidden"
        style={{ height: sliderHeight ? `${sliderHeight}px` : '80vh' }}
      >
        {/* <div 
          className="absolute inset-0"
          style={{ 
            background: 'linear-gradient(135deg, rgb(255, 255, 255) 0%, rgb(255, 255, 255) 60%, rgba(4, 201, 231, 0.6) 100%)'
          }} 
        /> */}
      </div>
    );
  }

  return (
    <div 
      ref={sliderRef}
      className="w-full max-w-none overflow-hidden relative m-0"
      style={{ height: sliderHeight ? `${sliderHeight}px` : '80vh' }}
    >
      {/* Media container */}
      <div 
        className="absolute inset-0 w-full h-full bg-white"
      >
        {slides.map((slide, i) => {
          if (slide.multimediaUrl && isVideo(slide.multimediaUrl)) {
            return (
              <video
                key={slide.id}
                ref={(el) => {
                  if (el) {
                    videoRefs.current[slide.id] = el;
                  }
                }}
                src={slide.multimediaUrl}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                  i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{ transition: `opacity ${transitionTime}ms ease-in-out` }}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedData={(e) => {
                  // Cuando el video está cargado, intentar reproducir si es el slide actual
                  if (i === current) {
                    const video = e.currentTarget;
                    video.currentTime = 0;
                    video.play().catch((error: any) => {
                      console.warn('Autoplay bloqueado por el navegador:', error);
                    });
                  }
                }}
                onCanPlay={(e) => {
                  // Backup: intentar reproducir cuando el video puede empezar a reproducirse
                  if (i === current && e.currentTarget.paused) {
                    e.currentTarget.play().catch((error: any) => {
                      console.warn('Autoplay bloqueado por el navegador:', error);
                    });
                  }
                }}
              />
            );
          } else if (slide.multimediaUrl) {
            return (
              <img
                key={slide.id}
                src={slide.multimediaUrl}
                alt={slide.title}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity ${
                  i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{ transition: `opacity ${transitionTime}ms ease-in-out` }}
              />
            );
          } else {
            return (
              <div
                key={slide.id}
                className={`absolute inset-0 w-full h-full transition-opacity bg-white ${
                  i === current ? "opacity-100 z-10" : "opacity-0 z-0"
                }`}
                style={{ 
                  transition: `opacity ${transitionTime}ms ease-in-out`
                }}
              />
            );
          }
        })}
      </div>

      {/* Overlay content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between">
        {/* Navigation arrows */}
        {slides.length > 1 && (
          <>
            <button
              onClick={goToPrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2"
              aria-label="Slide anterior"
            >
              <ChevronLeft size={64} className="text-white drop-shadow-lg hover:text-gray-300 transition-colors" strokeWidth={3} />
            </button>
            
            <button
              onClick={goToNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2"
              aria-label="Slide siguiente"
            >
              <ChevronRight size={64} className="text-white drop-shadow-lg hover:text-gray-300 transition-colors" strokeWidth={3} />
            </button>
          </>
        )}

        {/* Dots indicator */}
        {slides.length > 1 && (
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                className={`w-3 h-3 rounded-full transition-all border border-solid border-white shadow-lg ${
                  i === current ? "bg-primary" : "bg-white/40"
                }`}
                aria-label={`Ir al slide ${i + 1}`}
              />
            ))}
          </div>
        )}

        {/* Content overlay */}
        <div
          className="absolute left-[10%] bottom-[10%] flex flex-col items-start text-left px-4 md:px-8 max-w-[80%] sm:max-w-[60%] md:max-w-[50%] z-20"
        >
          <h2
            className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2"
            style={{
              textShadow: "2px 2px 8px #000, 0 0 2px #000",
            }}
          >
            {currentSlide.title}
          </h2>
          
          {currentSlide.description && (
            <p
              className="md:text-lg lg:text-xl text-white mb-4"
              style={{
                textShadow: "2px 2px 8px #000, 0 0 2px #000",
              }}
            >
              {currentSlide.description}
            </p>
          )}
          
          {currentSlide.linkUrl && (
            <a
              href={currentSlide.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-primary text-white rounded shadow hover:bg-primary/80 transition"
            >
              Ver más
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
