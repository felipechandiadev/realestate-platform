'use client';
import { useState, useEffect, useRef } from "react";
import IconButton from '@/shared/components/ui/IconButton/IconButton';
import { TextField } from '@/shared/components/ui/TextField/TextField';
import { useRouter, useSearchParams } from "next/navigation";
import PropertyTypeCard from "./PropertyTypeCard";
import type { PropertyType } from "./PropertyTypeCard";
import { updatePropertyTypeFeatures } from '@/features/shared/propertyTypes/actions/propertyTypes.action';
import { useAlert } from '@/providers/AlertContext';
import CreatePropertyTypeForm from './CreatePropertyTypeForm';
import Dialog from '@/shared/components/ui/Dialog/Dialog';

export interface PropertyTypeListProps {
    propertyTypes: PropertyType[];
}

const PropertyTypeList: React.FC<PropertyTypeListProps> = ({
    propertyTypes: initialPropertyTypes,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [search, setSearch] = useState(searchParams.get("search") || "");
    const [propertyTypes, setPropertyTypes] = useState<PropertyType[]>(initialPropertyTypes);
    const alert = useAlert();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    const getFeatureDisplayName = (feature: keyof PropertyType): string => {
        const featureNames: Record<string, string> = {
            hasBedrooms: 'Dormitorios',
            hasBathrooms: 'Baños',
            hasBuiltSquareMeters: 'M² Construidos',
            hasLandSquareMeters: 'M² Terreno',
            hasParkingSpaces: 'Estacionamientos',
            hasFloors: 'Pisos',
            hasConstructionYear: 'Año Construcción',
        };
        return featureNames[feature as string] || feature as string;
    };

    // Initialize search from URL only once on mount
    useEffect(() => {
        setSearch(searchParams.get("search") || "");
    }, []); // Empty dependency array - only run on mount

    useEffect(() => {
        setPropertyTypes(initialPropertyTypes);
    }, [initialPropertyTypes]);

    // Debounce search input changes to update URL
    useEffect(() => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }

        debounceTimerRef.current = setTimeout(() => {
            const params = new URLSearchParams(Array.from(searchParams.entries()));
            if (search.trim()) {
                params.set("search", search);
            } else {
                params.delete("search");
            }
            router.replace(`?${params.toString()}`);
        }, 500); // 500ms debounce delay

        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [search, searchParams, router]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const value = e.target.value;
        setSearch(value);
        // Debounced URL update is handled by the effect above
    };

    const handleAddPropertyType = () => {
        setShowCreateForm(true);
    };

    const handleCreateSuccess = () => {
        setShowCreateForm(false);
        // Refresh the page to get updated data
        router.refresh();
    };

    const handleCreateCancel = () => {
        setShowCreateForm(false);
    };

    const handlePropertyTypeClick = (propertyType: PropertyType) => {
        // TODO: Implement property type click functionality
        console.log("Property type clicked:", propertyType);
    };

    const handleToggleFeature = async (propertyTypeId: string, feature: keyof PropertyType, value: boolean) => {
        try {
            // Create the update object with only the feature being changed
            const updateData = { [feature]: value };
            await updatePropertyTypeFeatures(propertyTypeId, updateData);
            
            // Update local state optimistically
            setPropertyTypes(prevTypes => 
                prevTypes.map(type => 
                    type.id === propertyTypeId 
                        ? { ...type, [feature]: value }
                        : type
                )
            );

            // Show success alert
            const featureNames: Record<string, string> = {
                hasBedrooms: 'Dormitorios',
                hasBathrooms: 'Baños',
                hasBuiltSquareMeters: 'M² Construidos',
                hasLandSquareMeters: 'M² Terreno',
                hasParkingSpaces: 'Estacionamientos',
                hasFloors: 'Pisos',
                hasConstructionYear: 'Año Construcción',
            };
            const featureName = featureNames[feature as string] || feature;
            alert.success(`Característica "${featureName}" ${value ? 'activada' : 'desactivada'} exitosamente`);
        } catch (err) {
            console.error('Error updating property type feature:', err);
            // Show error alert
            alert.error('Error al actualizar la característica. Por favor, inténtalo de nuevo.');
        }
    };

    return (
        <div className="space-y-6 w-full">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Tipos de Propiedad</h1>
                    <p className="text-muted-foreground mt-1">Gestiona los tipos de propiedades disponibles en tu plataforma</p>
                </div>
                <IconButton
                    aria-label="Agregar tipo de propiedad"
                    variant="text"
                    onClick={handleAddPropertyType}
                    icon="add"
                    size="lg"
                />
            </div>

            {/* Search */}
            <div className="flex-1 min-w-0 max-w-xs sm:max-w-sm">
                <TextField
                    label="Buscar tipos de propiedad"
                    value={search}
                    onChange={handleSearchChange}
                    startIcon="search"
                    placeholder="Buscar por nombre..."
                />
            </div>

            {/* Formulario de creación en dialog */}
            <Dialog
                open={showCreateForm}
                onClose={handleCreateCancel}
                size="lg"
            >
                <CreatePropertyTypeForm
                    onSuccess={handleCreateSuccess}
                    onCancel={handleCreateCancel}
                />
            </Dialog>

            {/* Grid de tarjetas */}
            {propertyTypes.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <span className="material-symbols-outlined text-6xl block mb-4" style={{ fontSize: '64px' }}>
                        home_work
                    </span>
                    <p className="text-lg font-medium">
                        {search ? `No se encontraron resultados para "${search}"` : 'No hay tipos de propiedad disponibles'}
                    </p>
                    {!search && (
                        <p className="text-sm">Crea tu primer tipo de propiedad para empezar</p>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {propertyTypes.map(propertyType => (
                        <PropertyTypeCard
                            key={propertyType.id}
                            propertyType={propertyType}
                            onClick={() => handlePropertyTypeClick(propertyType)}
                            onToggleFeature={(feature, value) => handleToggleFeature(propertyType.id, feature, value)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PropertyTypeList;
