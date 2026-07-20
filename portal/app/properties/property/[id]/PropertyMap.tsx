'use client';

import React, { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
  city?: string;
  state?: string;
}

export default function PropertyMap({
  latitude,
  longitude,
  title,
  address,
  city,
  state,
}: PropertyMapProps) {
  useEffect(() => {
    // Fix leaflet icon issue
    const defaultIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    L.Marker.prototype.options.icon = defaultIcon;

    // Initialize map without controls
    const map = L.map('property-map', {
      attributionControl: false,
    }).setView([latitude, longitude], 15);

    const container = map.getContainer();
    container.style.position = 'relative';
    container.style.zIndex = '0';

    const controlsContainer = container.querySelector('.leaflet-control-container') as
      | HTMLElement
      | null;
    if (controlsContainer) {
      controlsContainer.style.zIndex = '10';
      controlsContainer.style.position = 'relative';
    }

    // Add tile layer without attribution
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: false,
      maxZoom: 19,
      minZoom: 5,
    }).addTo(map);

    // Add marker
    const markerText = address || `${city}, ${state}`;
    const marker = L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(
        `<div class="font-semibold text-sm">${title}</div><div class="text-xs text-muted-foreground">${markerText}</div>`,
        { maxWidth: 250 }
      )
      .openPopup();

    // Cleanup
    return () => {
      map.remove();
    };
  }, [latitude, longitude, title, address, city, state]);

  return (
    <div
      id="property-map"
      className="w-full rounded-lg overflow-hidden border border-border"
      style={{ height: '400px', position: 'relative', zIndex: 0 }}
    />
  );
}
