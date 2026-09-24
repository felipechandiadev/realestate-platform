# Showcase Component

Componente de demostración interactivo que muestra el uso de los componentes LocationPicker (CreateLocationPicker y UpdateLocationPicker) con ejemplos prácticos y código de integración.

## 🚀 Características Principales

- ✅ **Demostración Interactiva**: Showcase en vivo de componentes LocationPicker
- ✅ **Ejemplos Prácticos**: Casos de uso reales con Create y Update
- ✅ **Código de Integración**: Ejemplos de código para formularios personalizados
- ✅ **Feedback Visual**: Estados y resultados mostrados en tiempo real
- ✅ **Responsive**: Diseño adaptativo para diferentes pantallas
- ✅ **Documentación Viva**: Código ejecutable que sirve como documentación
- ✅ **Testing**: Incluye data-test-id para testing automatizado

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

export default function ShowcasePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <LocationPickerShowcase />
    </div>
  );
}
```

## 🔧 API Reference

### Props del LocationPickerShowcase

Este componente no recibe props externas - es un showcase autocontenido que demuestra los componentes LocationPicker.

## 🎯 Casos de Uso Comunes

### Página de Demostración de Componentes

```tsx
import React from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

export default function ComponentsDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            DSPM-App Component Showcase
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explora nuestros componentes interactivos con ejemplos prácticos
            y código de integración listo para usar.
          </p>
        </header>

        {/* Showcase de LocationPicker */}
        <section className="mb-16">
          <LocationPickerShowcase />
        </section>

        {/* Otros showcases podrían ir aquí */}
        <section className="text-center">
          <p className="text-gray-500">
            Más showcases próximamente...
          </p>
        </section>
      </div>
    </div>
  );
}
```

### Documentación Interactiva

```tsx
import React, { useState } from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

export default function InteractiveDocs() {
  const [activeTab, setActiveTab] = useState('demo');

  const tabs = [
    { id: 'demo', label: 'Demo Interactivo', component: LocationPickerShowcase },
    { id: 'code', label: 'Código', component: CodeExamples },
    { id: 'api', label: 'API Reference', component: APIReference },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </main>
    </div>
  );
}
```

### Testing y QA

```tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

// Test del showcase completo
describe('LocationPickerShowcase', () => {
  it('renders all showcase sections', () => {
    render(<LocationPickerShowcase />);

    expect(screen.getByText('LocationPicker Showcase')).toBeInTheDocument();
    expect(screen.getByText('CreateLocationPicker')).toBeInTheDocument();
    expect(screen.getByText('UpdateLocationPicker')).toBeInTheDocument();
    expect(screen.getByText('Integración con Formularios')).toBeInTheDocument();
  });

  it('shows location data when coordinates are selected', async () => {
    render(<LocationPickerShowcase />);

    // Simular selección de ubicación
    // (Esto requeriría mockear la geolocalización)

    await waitFor(() => {
      const locationData = screen.getByTestId('location-created-display');
      expect(locationData).toBeInTheDocument();
    });
  });

  it('displays integration code examples', () => {
    render(<LocationPickerShowcase />);

    const codeBlock = screen.getByText(/Ejemplo de uso en un formulario personalizado/);
    expect(codeBlock).toBeInTheDocument();
  });
});
```

## 🎨 Personalización

### Tema Personalizado

```tsx
// Showcase con tema personalizado
import React from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

const ThemedShowcase: React.FC = () => {
  return (
    <div className="custom-theme">
      <style jsx global>{`
        .custom-theme {
          --primary-color: #8b5cf6;
          --secondary-color: #06b6d4;
          --background-color: #f8fafc;
          --card-background: white;
          --text-primary: #1e293b;
          --text-secondary: #64748b;
        }

        .custom-theme .border {
          border-color: var(--primary-color);
        }

        .custom-theme h1, .custom-theme h2 {
          color: var(--primary-color);
        }

        .custom-theme .bg-white {
          background-color: var(--card-background);
        }

        .custom-theme .text-gray-600 {
          color: var(--text-secondary);
        }
      `}</style>

      <LocationPickerShowcase />
    </div>
  );
};

export default ThemedShowcase;
```

### Layout Personalizado

```tsx
// Showcase con layout de grid
import React from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

const GridShowcase: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* Panel izquierdo - Showcase */}
      <div className="space-y-6">
        <LocationPickerShowcase />
      </div>

      {/* Panel derecho - Información adicional */}
      <div className="space-y-6">
        <div className="bg-blue-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            💡 Consejos de Uso
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Los componentes obtienen automáticamente la geolocalización</li>
            <li>• CreateLocationPicker es para nuevas ubicaciones</li>
            <li>• UpdateLocationPicker requiere coordenadas iniciales</li>
            <li>• Ambos componentes son independientes de BaseForm</li>
          </ul>
        </div>

        <div className="bg-green-50 p-6 rounded-lg">
          <h3 className="text-lg font-semibold text-green-900 mb-4">
            🚀 Casos de Uso
          </h3>
          <ul className="space-y-2 text-green-800">
            <li>• Formularios de registro de usuarios</li>
            <li>• Creación de puntos de interés</li>
            <li>• Actualización de direcciones</li>
            <li>• Aplicaciones de delivery</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
```

### Showcase con Navegación

```tsx
// Showcase con navegación por secciones
import React, { useState } from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

const NavigableShowcase: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);

  const sections = [
    { title: 'Create Location', component: CreateSection },
    { title: 'Update Location', component: UpdateSection },
    { title: 'Integration', component: IntegrationSection },
  ];

  const CurrentComponent = sections[currentSection].component;

  return (
    <div className="flex h-screen">
      {/* Sidebar de navegación */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h2 className="text-xl font-bold mb-6">LocationPicker</h2>
        <nav className="space-y-2">
          {sections.map((section, index) => (
            <button
              key={index}
              onClick={() => setCurrentSection(index)}
              className={`w-full text-left px-4 py-2 rounded ${
                currentSection === index
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700'
              }`}
            >
              {section.title}
            </button>
          ))}
        </nav>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 p-6 overflow-auto">
        <CurrentComponent />
      </div>
    </div>
  );
};
```

## 📱 Responsive Design

El Showcase es completamente responsive:

```tsx
// Diseño responsive automático
<LocationPickerShowcase />

// En contenedores específicos
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <LocationPickerShowcase />
</div>

// En diferentes breakpoints
<div className="w-full max-w-2xl mx-auto lg:max-w-4xl">
  <LocationPickerShowcase />
</div>

// Mobile-first approach
<div className="p-4 sm:p-6 md:p-8">
  <LocationPickerShowcase />
</div>
```

## 🎯 Mejores Prácticas

### 1. Contexto Apropiado

```tsx
// ✅ Bien - usar showcase en páginas de documentación
export default function DocsPage() {
  return (
    <div>
      <h1>Componentes LocationPicker</h1>
      <p>Explora los ejemplos interactivos a continuación:</p>

      <LocationPickerShowcase />
    </div>
  );
}

// ✅ Bien - usar showcase en storybook o design systems
export default function StorybookPage() {
  return (
    <div>
      <h1>LocationPicker Components</h1>
      <LocationPickerShowcase />
    </div>
  );
}

// ❌ Mal - no usar showcase en producción sin contexto
export default function App() {
  return (
    <div>
      {/* No mostrar showcase en app de producción */}
      <LocationPickerShowcase /> {/* ❌ */}
      <MainAppContent />
    </div>
  );
}
```

### 2. Integración con Documentación

```tsx
// ✅ Bien - combinar showcase con documentación
import React from 'react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

export default function ComponentDocs() {
  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Documentación */}
        <div className="space-y-6">
          <section>
            <h2 className="text-2xl font-bold mb-4">CreateLocationPicker</h2>
            <p className="text-gray-600 mb-4">
              Componente para crear nuevas ubicaciones con geolocalización automática.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm">
{`<CreateLocationPicker
  onChange={(coords) => {
    console.log('Nueva ubicación:', coords);
  }}
/>`}
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4">UpdateLocationPicker</h2>
            <p className="text-gray-600 mb-4">
              Componente para actualizar ubicaciones existentes.
            </p>
            <div className="bg-gray-100 p-4 rounded-lg">
              <pre className="text-sm">
{`<UpdateLocationPicker
  initialCoordinates={{ lat: -33.45, lng: -70.67 }}
  onChange={(coords) => {
    if (coords) {
      console.log('Ubicación actualizada:', coords);
    }
  }}
/>`}
              </pre>
            </div>
          </section>
        </div>

        {/* Showcase Interactivo */}
        <div className="lg:sticky lg:top-6">
          <LocationPickerShowcase />
        </div>
      </div>
    </div>
  );
}
```

### 3. Testing del Showcase

```tsx
// ✅ Bien - tests del showcase
import { render, screen } from '@testing-library/react';
import LocationPickerShowcase from '@/components/Showcase/LocationPickerShowcase';

describe('LocationPickerShowcase', () => {
  it('renders showcase title', () => {
    render(<LocationPickerShowcase />);
    expect(screen.getByText('LocationPicker Showcase')).toBeInTheDocument();
  });

  it('shows both picker types', () => {
    render(<LocationPickerShowcase />);
    expect(screen.getByText('CreateLocationPicker')).toBeInTheDocument();
    expect(screen.getByText('UpdateLocationPicker')).toBeInTheDocument();
  });

  it('displays integration examples', () => {
    render(<LocationPickerShowcase />);
    expect(screen.getByText('Integración con Formularios')).toBeInTheDocument();
  });

  it('has proper data-test-ids', () => {
    render(<LocationPickerShowcase />);
    // Verificar que los componentes internos tengan data-test-id
    expect(document.querySelector('[data-test-id]')).toBeInTheDocument();
  });
});
```

## 🐛 Solución de Problemas

### Problema: El showcase no carga los componentes

```tsx
// Verifica que los imports sean correctos
import CreateLocationPicker from '../LocationPicker/CreateLocationPickerWrapper';
import UpdateLocationPicker from '../LocationPicker/UpdateLocationPickerWrapper';

// Asegúrate de que los archivos existan
// ✅ Correcto - rutas relativas desde Showcase/
import CreateLocationPicker from '../LocationPicker/CreateLocationPickerWrapper';

// ❌ Incorrecto - rutas absolutas incorrectas
import CreateLocationPicker from '@/components/LocationPicker/CreateLocationPicker';
```

### Problema: Los componentes no muestran datos

```tsx
// Verifica que los componentes LocationPicker estén funcionando
// El showcase depende de que CreateLocationPicker y UpdateLocationPicker funcionen

// Test individual de componentes
import CreateLocationPicker from '../LocationPicker/CreateLocationPickerWrapper';

const TestComponent = () => {
  return (
    <CreateLocationPicker
      onChange={(coords) => console.log(coords)}
    />
  );
};
```

### Problema: Errores de geolocalización

```tsx
// El showcase usa geolocalización del navegador
// Para testing, mockear la geolocalización

const mockGeolocation = {
  getCurrentPosition: jest.fn().mockImplementation((success) =>
    success({
      coords: {
        latitude: -33.45,
        longitude: -70.6667,
        accuracy: 100,
      },
    })
  ),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});
```

### Problema: Layout se ve mal en diferentes pantallas

```tsx
// Asegúrate de usar clases responsive
<div className="p-6 space-y-8 max-w-4xl mx-auto">
  {/* ✅ Bien - responsive y centrado */}
</div>

// Evita anchos fijos que no funcionen en móvil
<div className="w-1000px"> {/* ❌ Mal */}
  <LocationPickerShowcase />
</div>

// Usa max-width en lugar de width fijo
<div className="max-w-4xl mx-auto"> {/* ✅ Bien */}
  <LocationPickerShowcase />
</div>
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/Showcase/LocationPickerShowcase.tsx` - El showcase completo
- `app/components/LocationPicker/` - Los componentes que demuestra
- `app/components/BaseForm/BaseForm.tsx` - Integración con formularios

## 🤝 Contribución

Para contribuir al componente Showcase:

1. Mantén el showcase actualizado con los últimos cambios en LocationPicker
2. Agrega nuevos ejemplos cuando se agreguen funcionalidades
3. Incluye casos de uso reales y prácticos
4. Asegura que el showcase funcione en todos los dispositivos
5. Actualiza esta documentación cuando cambie la funcionalidad
6. Incluye data-test-id para testing automatizado
7. Mantén el código de ejemplo limpio y fácil de entender