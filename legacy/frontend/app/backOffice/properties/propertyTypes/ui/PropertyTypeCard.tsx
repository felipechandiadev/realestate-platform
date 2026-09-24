'use client';

import React, { useState } from 'react';
import Switch from '@/shared/components/ui/Switch/Switch';
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import Dialog from '@/shared/components/ui/Dialog/Dialog';
import UpdatePropertyTypeForm from './updatePropertyTypeForm';
import DeletePropertyTypeForm from './DeletePropertyTypeForm';
import { useRouter } from 'next/navigation';

export interface PropertyType {
  id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  hasBedrooms?: boolean;
  hasBathrooms?: boolean;
  hasBuiltSquareMeters?: boolean;
  hasLandSquareMeters?: boolean;
  hasParkingSpaces?: boolean;
  hasFloors?: boolean;
  hasConstructionYear?: boolean;
}

const defaultPropertyType: PropertyType = {
  id: '',
  name: 'Unknown Type',
  description: 'No description available',
  isActive: true,
};

interface PropertyTypeCardProps {
  propertyType: PropertyType;
  onClick?: () => void;
  onToggleFeature?: (feature: keyof PropertyType, value: boolean) => void;
}

export default function PropertyTypeCard({
  propertyType = defaultPropertyType,
  onClick,
  onToggleFeature,
}: PropertyTypeCardProps) {
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const router = useRouter();
  const {
    name,
    description,
    isActive,
    hasBedrooms,
    hasBathrooms,
    hasBuiltSquareMeters,
    hasLandSquareMeters,
    hasParkingSpaces,
    hasFloors,
    hasConstructionYear,
  } = { ...defaultPropertyType, ...propertyType };

  const features = [
    { label: 'Dormitorios', key: 'hasBedrooms' as keyof PropertyType, value: hasBedrooms },
    { label: 'Baños', key: 'hasBathrooms' as keyof PropertyType, value: hasBathrooms },
    { label: 'M² Construidos', key: 'hasBuiltSquareMeters' as keyof PropertyType, value: hasBuiltSquareMeters },
    { label: 'M² Terreno', key: 'hasLandSquareMeters' as keyof PropertyType, value: hasLandSquareMeters },
    { label: 'Estacionamientos', key: 'hasParkingSpaces' as keyof PropertyType, value: hasParkingSpaces },
    { label: 'Pisos', key: 'hasFloors' as keyof PropertyType, value: hasFloors },
    { label: 'Año Construcción', key: 'hasConstructionYear' as keyof PropertyType, value: hasConstructionYear },
  ];

  const handleFeatureToggle = (featureKey: keyof PropertyType, value: boolean) => {
    onToggleFeature?.(featureKey, value);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowUpdateDialog(true);
  };

  const handleUpdateSuccess = () => {
    setShowUpdateDialog(false);
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleUpdateCancel = () => {
    setShowUpdateDialog(false);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setShowDeleteDialog(true);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteDialog(false);
    // Refresh the page to get updated data
    router.refresh();
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
  };

  return (
    <div
      className="bg-card rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow flex flex-col h-full cursor-pointer"
      onClick={onClick}
    >
      {/* Header area with title and status */}
      <div className="py-2 px-4 flex-1">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-lg font-semibold text-foreground truncate flex-1">{name}</h3>
          {!isActive && (
            <span className="text-xs bg-red-100 text-red-600 font-medium px-2 py-1 rounded ml-2">
              Inactivo
            </span>
          )}
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{description}</p>
        )}

        {/* Features list */}
        <div className="space-y-2">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center justify-start">
              <Switch
                label={feature.label}
                labelPosition="right"
                checked={feature.value || false}
                onChange={(checked) => handleFeatureToggle(feature.key, checked)}
                data-test-id={`switch-${feature.key}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Actions footer - Dual zone pattern */}
      <div className="flex justify-between items-center gap-2 mt-2 px-4 pb-2">
        {/* Left zone: Empty or status info */}
        <div />

        {/* Right zone: Action buttons */}
        <div className="flex gap-2">
          <IconButton
            aria-label="Editar tipo de propiedad"
            variant="text"
            onClick={handleEditClick}
            icon="edit"
          />
          <IconButton
            aria-label="Eliminar tipo de propiedad"
            variant="text"
            onClick={handleDeleteClick}
            icon="delete"
            className="text-red-500"
          />
        </div>
      </div>

      {/* Dialog para actualizar */}
      <Dialog
        open={showUpdateDialog}
        onClose={handleUpdateCancel}
    
        size="lg"
      >
        <UpdatePropertyTypeForm
          propertyType={propertyType}
          onSuccess={handleUpdateSuccess}
          onCancel={handleUpdateCancel}
        />
      </Dialog>

      {/* Dialog para eliminar */}
      <Dialog
        open={showDeleteDialog}
        onClose={handleDeleteCancel}

        size="md"
      >
        <DeletePropertyTypeForm
          propertyType={propertyType}
          onSuccess={handleDeleteSuccess}
          onCancel={handleDeleteCancel}
        />
      </Dialog>
    </div>
  );
}
