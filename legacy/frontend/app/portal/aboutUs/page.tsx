/**
 * About Us Page (Portal)
 * 
 * Propósito:
 * - Página institucional "Quiénes Somos"
 * - Mostrar información corporativa: bio, misión, visión
 * - Generar confianza y credibilidad con visitantes
 * - Multimedia hero (imagen/video) de la empresa
 * 
 * Funcionalidad:
 * - Server component que fetcha datos desde getPublicAboutUs
 * - Fallback a mock data si falla la carga
 * - Renderiza hero multimedia (imagen o video)
 * - Secciones estructuradas: bio, misión, visión
 * - Responsive design con Cards
 * 
 * Audiencia: Visitantes públicos, clientes potenciales, stakeholders
 */

import React from 'react'
import { getPublicAboutUs as getAboutUs } from '@/features/backoffice/cms/actions/aboutUs.action'

// Mock data mientras se implementa la API
const mockAboutUs = {
  bio: `Somos una empresa inmobiliaria líder en el mercado chileno, especializada en la comercialización de propiedades residenciales y comerciales. Con más de 15 años de experiencia, nos hemos consolidado como referentes en el sector, ofreciendo servicios integrales que van desde la asesoría personalizada hasta la gestión completa de transacciones inmobiliarias.

Nuestro compromiso es brindar una experiencia excepcional a nuestros clientes, combinando conocimientos especializados del mercado con un servicio personalizado y ético. Creemos que cada propiedad cuenta una historia única y cada cliente tiene necesidades específicas que merecen atención dedicada.`,
  mision: `Nuestra misión es facilitar el acceso a propiedades de calidad, conectando a compradores, vendedores e inversionistas con oportunidades inmobiliarias excepcionales. Nos esforzamos por ser el puente confiable entre sueños y realidades, ofreciendo asesoramiento experto y soluciones innovadoras que simplifiquen el proceso de compra, venta y arriendo de propiedades.`,
  vision: `Ser la empresa inmobiliaria más confiable y innovadora de Chile, reconocida por nuestra excelencia en servicio, integridad profesional y capacidad para anticipar las tendencias del mercado. Aspiramos a transformar la experiencia inmobiliaria en Chile, haciendo que cada transacción sea transparente, eficiente y satisfactoria para todas las partes involucradas.`,
  multimediaUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
}

interface AboutUsData {
  bio: string;
  mision: string;
  vision: string;
  multimediaUrl?: string;
}

export default async function AboutUsPage() {
  // Intentar obtener datos reales, si falla usar mock
  let aboutUsData: AboutUsData = mockAboutUs;
  try {
    const result = await getAboutUs();
    if (result.success && result.data) {
      aboutUsData = result.data;
    }
  } catch (error) {
    console.log('Using mock data for about us');
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      {/* Header Section */}
      <div className="mb-12 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Sobre nosotros</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Conoce nuestra historia, valores y compromiso con la excelencia inmobiliaria
        </p>
      </div>

      {/* Hero Multimedia */}
      {aboutUsData.multimediaUrl && (
        <div className="mb-12">
          <div className="relative h-64 md:h-96 rounded-lg overflow-hidden shadow-lg">
            {aboutUsData.multimediaUrl.includes('.mp4') || aboutUsData.multimediaUrl.includes('.webm') || aboutUsData.multimediaUrl.includes('.ogg') ? (
              <video
                src={aboutUsData.multimediaUrl}
                className="w-full h-full object-cover"
                autoPlay
                muted
                loop
                playsInline
              />
            ) : (
              <img
                src={aboutUsData.multimediaUrl}
                alt="Sobre nosotros"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/20"></div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      <div className="mb-12">
        <div className="bg-card rounded-lg p-6 md:p-8 shadow-sm">
          <h2 className="text-2xl md:text-3xl font-bold text-primary mb-6 text-center">Quiénes somos</h2>
          <div className="prose prose-lg max-w-none text-foreground">
            <p className="text-base md:text-lg leading-relaxed whitespace-pre-line">
              {aboutUsData.bio}
            </p>
          </div>
        </div>
      </div>

      {/* Mission and Vision Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Mission */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <span className="material-symbols-outlined text-primary text-2xl">target</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-primary">Nuestra Misión</h3>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {aboutUsData.mision}
          </p>
        </div>

        {/* Vision */}
        <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-primary">Nuestra Visión</h3>
          </div>
          <p className="text-foreground leading-relaxed whitespace-pre-line">
            {aboutUsData.vision}
          </p>
        </div>
      </div>


    </div>
  )
}
