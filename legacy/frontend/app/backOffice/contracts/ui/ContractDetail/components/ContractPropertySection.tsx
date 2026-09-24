interface ContractPropertySectionProps {
  property: any | null;
}

export default function ContractPropertySection({ property }: ContractPropertySectionProps) {
  if (!property) {
    return (
      <div className="text-center py-12 text-muted-foreground max-w-4xl">
        <span className="material-symbols-outlined text-4xl mb-2 block">home_work</span>
        <p>No hay propiedad asociada</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Propiedad Asociada
          </label>
          <h3 className="text-lg font-semibold text-foreground">{property.title}</h3>
          <p className="text-sm text-muted-foreground">{property.address}</p>
        </div>
        <span className="font-mono text-sm font-medium text-primary px-3 py-1 bg-primary/10 rounded">
          {property.code}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-border">
        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Precio de la Propiedad
          </label>
          <p className="text-lg font-semibold text-foreground">
            CLP {property.price?.toLocaleString('es-CL')}
          </p>
        </div>
      </div>
    </div>
  );
}
