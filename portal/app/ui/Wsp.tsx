'use client'

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { getIdentity } from "@/features/cms/actions/identity.action";

interface Identity {
  phone?: string;
  // Add other identity properties as needed
}

const Wsp: React.FC = () => {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadIdentity() {
      try {
        const data = await getIdentity();
        if (data) {
          setIdentity(data);
        }
      } catch (error) {
        console.error('Error loading identity:', error);
      } finally {
        setLoading(false);
      }
    }
    loadIdentity();
  }, []);

  if (loading || !identity?.phone) {
    return null;
  }

  // Format phone number for WhatsApp (remove spaces, dashes, etc.)
  const formatPhoneForWhatsApp = (phone: string) => {
    return phone.replace(/\D/g, ''); // Remove all non-digit characters
  };

  const whatsappPhone = formatPhoneForWhatsApp(identity.phone);

  return (
    <div
      className="z-40 fixed bottom-6 right-6 w-14 h-14 rounded-full bg-green-500 hover:bg-green-600 shadow-lg flex items-center justify-center text-white text-3xl transition-colors cursor-pointer"
      aria-label="Contactar por WhatsApp"
      data-test-id="wsp-button"
      onClick={() => window.open(`https://wa.me/${whatsappPhone}`, '_blank')}
    >
      <FontAwesomeIcon icon={faWhatsapp} />
    </div>
  );
};

export default Wsp;
