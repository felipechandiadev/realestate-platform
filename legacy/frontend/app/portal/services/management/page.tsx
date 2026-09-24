/**
 * Property Management Services Page (Portal)
 * 
 * Propósito:
 * - Landing page de servicios de gestión inmobiliaria
 * - Presentar oferta de servicios: administración de propiedades
 * - Lead generation para servicios de administración
 * - Contacto directo con empresa para contratar servicios
 * 
 * Funcionalidad:
 * - Client component: renderizado dinámico de contenido
 * - Carga nombre de empresa desde getIdentity
 * - Showcase de beneficios con iconos (30 años exp, gestión total, comisión justa)
 * - ContactDialog integrado para consultas
 * - Marketing de servicios B2C/B2B
 * - Responsive layout con Cards
 * 
 * Audiencia: Propietarios buscando administración de propiedades, inversionistas
 */



'use client'



import { ShieldCheck, ClipboardList, HeartHandshake } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { getIdentity } from '@/features/backoffice/cms/actions/identity.action';

const ContactDialog = dynamic(() => import('@/shared/components/ui/ContactDialog/ContactDialog'), { ssr: false });

export default function PropertyManagementServicePage() {
  const [companyName, setCompanyName] = useState<string>('Plataforma Inmobiliaria');

  useEffect(() => {
    let ignore = false;
    (async function load() {
      try {
        const id = await getIdentity();
        if (!ignore && id?.name) setCompanyName(id.name);
      } catch (err) {
        console.error('PropertyManagementServicePage: failed to load identity', err);
      }
    })();
    return () => { ignore = true; };
  }, []);

  const servicePoints = [ 
    {
      icon: ShieldCheck,
      title: "30 Años de Experiencia",
      description: "Durante tres décadas hemos administrado propiedades de forma eficiente y transparente. Más de 3.000 propietarios han confiado en nosotros para proteger y potenciar su inversión.",
      keyStat: "Más de 3.000 propietarios confían en nosotros.",
    },
    {
      icon: ClipboardList,
      title: "Nos Hacemos Cargo de Todo",
      description: "Gestionamos tu propiedad como si fuera nuestra: cobranza, mantenciones, coordinación de servicios, inspecciones, contratos y seguimiento continuo. Tú solo recibes resultados claros y actualizados.",
      keyStat: "Gestión integral, cero preocupaciones.",
    },
    {
      icon: HeartHandshake,
      title: "Pasión por el Crecimiento Comunitario",
      description: "Conocemos el mercado local, su comportamiento y oportunidades. Creemos en el desarrollo de nuestra ciudad y trabajamos para que cada propiedad que administramos aporte valor y estabilidad.",
      keyStat: "Aportamos valor y estabilidad a la comunidad.",
    },
  ];

  const [openContact, setOpenContact] = useState(false);
  useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = 'linear-gradient(180deg, #A3CED8 0%, #fff 100%)';
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <div className="min-h-screen font-sans antialiased text-foreground flex flex-col items-center py-0 mb-16">
      {/* Hero Section */}
      <header className="relative py-20 sm:py-28 overflow-hidden mb-12 w-full bg-transparent">
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-transparent">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-primary mb-4 bg-transparent" style={{background: 'transparent'}}>
            SERVICIOS DE ADMINISTRACIÓN
          </h1>
          <p className="mt-2 text-lg sm:text-2xl font-light text-muted-foreground bg-transparent" style={{background: 'transparent'}}>
            Protege, Potencia y Despreocúpate de tu Inversión Inmobiliaria con
            <br />
            {companyName}
          </p>
        </div>
      </header>

      {/* Feature Cards */}
      <section className="py-12 sm:py-20 w-full">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {servicePoints.map((point, index) => (
              <div
                key={index}
                className="bg-white p-8 sm:p-10 rounded-2xl shadow-lg border border-border flex flex-col h-full hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center justify-center h-16 w-16 rounded-full mb-6 shadow" style={{ background: '#D4ECF4' }}>
                  <point.icon size={32} strokeWidth={2} color="#2563eb" />
                </div>
                <h2 className="text-2xl font-bold mb-3 text-primary text-center">{point.title}</h2>
                <p className="text-muted-foreground leading-relaxed mb-4 text-center">{point.description}</p>
                <div className="mt-4 pt-4 border-t-2" style={{ borderColor: '#2563eb' }}>
                  <p className="text-primary font-semibold italic text-sm">{point.keyStat}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* CTA Final */}
      <section className="py-12 w-full">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-4">¿Listo para despreocuparte de tu propiedad?</h2>
          <p className="text-muted-foreground mb-6">Solicita información y recibe una asesoría personalizada para la administración de tu inmueble.</p>
          <button
            type="button"
            onClick={() => setOpenContact(true)}
            className="inline-block bg-primary text-white font-semibold px-8 py-3 rounded-lg shadow hover:bg-primary/90 transition"
          >
            Solicita información de administración
          </button>
          <ContactDialog open={openContact} onClose={() => setOpenContact(false)} />
        </div>
      </section>
    </div>
  );
}
