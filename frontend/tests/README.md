# Estructura de Tests Unitarios (Jest)

Esta estructura refleja **exactamente** la organización de `app/` para mantener coherencia.

## Estructura

```
tests/
├── actions/              # Tests de server actions
├── api/                  # Tests de API routes
│   └── auth/            # NextAuth endpoints
├── contexts/             # Tests de React contexts
├── hooks/                # Tests de custom hooks
├── backOffice/           # Tests del panel administrativo
│   ├── contracts/       # Gestión de contratos
│   │   ├── sales/       # Contratos de venta
│   │   ├── rent/        # Contratos de arriendo
│   │   ├── documentTypes/ # Tipos de documento
│   │   ├── persons/     # Personas en contratos
│   │   └── documents/   # Documentos legales
│   ├── cms/             # Content Management System
│   │   ├── aboutUs/     # Información empresa
│   │   ├── testimonials/ # Testimonios
│   │   ├── identity/    # Identidad corporativa
│   │   ├── articles/    # Blog/Artículos
│   │   ├── slider/      # Carrusel principal
│   │   └── ourTeam/     # Equipo
│   ├── properties/       # Gestión de propiedades
│   │   ├── propertyTypes/ # Tipos de propiedad
│   │   ├── sales/       # Propiedades en venta
│   │   └── rent/        # Propiedades en arriendo
│   ├── users/           # Gestión de usuarios
│   │   ├── agents/      # Agentes
│   │   ├── community/   # Usuarios comunidad
│   │   └── administrators/ # Administradores
│   └── notifications/   # Notificaciones backoffice
└── portal/              # Tests del portal público
    ├── blog/            # Blog público
    │   └── article/     # Artículos
    ├── properties/      # Propiedades públicas
    │   ├── sale/        # Propiedades en venta
    │   ├── rent/        # Propiedades en arriendo
    │   └── property/    # Detalle de propiedad
    ├── myContracts/     # Contratos del usuario
    ├── favorites/       # Propiedades favoritas
    ├── myProperties/    # Propiedades del usuario
    ├── notifications/   # Notificaciones del usuario
    ├── aboutUs/         # Sobre nosotros
    ├── personalInfo/    # Información personal
    ├── testimonials/    # Testimonios público
    ├── ourTeam/         # Nuestro equipo
    ├── services/        # Servicios
    │   └── management/  # Gestión de propiedades
    ├── verify-email/    # Verificación de email
    ├── forgot-password/ # Recuperar contraseña
    ├── reset-password/  # Resetear contraseña
    ├── sell-property/   # Vender propiedad
    ├── rent-property/   # Arrendar propiedad
    ├── valuation/       # Tasación
    └── publish/         # Publicar propiedad
```

## Convenciones de Nombres

### Archivos de Test
```
[nombre].test.ts        # Tests unitarios
[nombre].test.tsx       # Tests de componentes React
```

### Estructura de un Test
```typescript
// tests/actions/properties.test.ts
import { describe, it, expect, beforeEach } from '@jest/globals';
import { getProperties } from '@/app/actions/properties';

describe('getProperties', () => {
  beforeEach(() => {
    // Setup
  });

  it('fetches properties with filters', async () => {
    // Arrange
    const filters = { propertyType: 'casa' };
    
    // Act
    const result = await getProperties(filters);
    
    // Assert
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  it('handles empty results', async () => {
    // Test
  });

  it('handles errors gracefully', async () => {
    // Test
  });
});
```

## Ejecutar Tests

```bash
# Todos los tests
npm run test

# Modo watch
npm run test:watch

# Test específico
npm run test -- tests/actions/properties.test.ts

# Con cobertura
npm run test -- --coverage

# Tests de un módulo
npm run test -- tests/backOffice/contracts/
```

## Testing de Componentes React

```typescript
// tests/backOffice/properties/sales/PropertyCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyCard from '@/app/backOffice/properties/sales/PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Casa Test',
    price: 100000000
  };

  it('renders property information', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Casa Test')).toBeInTheDocument();
    expect(screen.getByText('$100,000,000')).toBeInTheDocument();
  });

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<PropertyCard property={mockProperty} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByRole('button', { name: /edit/i }));
    expect(onEdit).toHaveBeenCalledWith('1');
  });
});
```

## Testing de Server Actions

```typescript
// tests/actions/contracts.test.ts
import { getContracts } from '@/app/actions/contracts';

// Mock fetch
global.fetch = jest.fn();

describe('getContracts', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls backend API with correct params', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ({ data: [] })
    });

    await getContracts({ status: 'ACTIVE' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/contracts?status=ACTIVE'),
      expect.any(Object)
    );
  });
});
```

## Testing de Contexts

```typescript
// tests/contexts/AlertContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { AlertProvider, useAlert } from '@/app/contexts/AlertContext';

describe('AlertContext', () => {
  it('shows alert when showAlert is called', () => {
    const { result } = renderHook(() => useAlert(), {
      wrapper: AlertProvider
    });

    act(() => {
      result.current.showAlert({
        message: 'Test alert',
        type: 'success'
      });
    });

    // Assert alert is shown
  });
});
```

## Mocking

### Mock de módulos
```typescript
jest.mock('@/app/actions/properties', () => ({
  getProperties: jest.fn()
}));
```

### Mock de fetch
```typescript
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ data: [] })
  })
) as jest.Mock;
```

### Mock de NextAuth
```typescript
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: { user: { id: '1', email: 'test@test.com' } },
    status: 'authenticated'
  })
}));
```

## Cobertura Mínima

- **Actions:** 80%
- **Contexts:** 90%
- **Hooks:** 90%
- **Componentes críticos:** 70%
- **Páginas:** 50%

## Notas

- Los tests E2E (Playwright) están en `/e2e/`
- Esta carpeta solo contiene tests unitarios (Jest)
- Mantener la estructura sincronizada con `app/`
