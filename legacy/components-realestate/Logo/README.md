# Logo Component

Componente flexible y robusto para mostrar logos con soporte completo para diferentes formatos, aspectos, manejo de errores automático y estados de carga.

## 🚀 Características Principales

- ✅ **Múltiples Fuentes**: Soporte para logos personalizados o por defecto
- ✅ **Aspect Ratio Flexible**: Control total sobre proporciones
- ✅ **Manejo de Errores**: Fallback automático cuando falla la carga
- ✅ **Skeleton Loading**: Estados de carga elegantes
- ✅ **Responsive**: Diseño adaptativo con clases CSS
- ✅ **TypeScript**: Completamente tipado
- ✅ **Accesibilidad**: Alt text apropiado y soporte para lectores de pantalla
- ✅ **Data Test IDs**: Soporte completo para testing automatizado
- ✅ **Performance**: Optimizado con lazy loading y error boundaries

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import Logo from '@/components/Logo/Logo';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import Logo from '@/components/Logo/Logo';

export default function BasicLogo() {
  return (
    <div className="p-6">
      {/* Logo por defecto */}
      <Logo className="w-32 h-32" />

      {/* Logo personalizado */}
      <Logo
        src="/my-custom-logo.png"
        alt="Mi Logo Personalizado"
        className="w-24 h-24"
      />

      {/* Logo con aspecto específico */}
      <Logo
        aspect={{ w: 2, h: 1 }}
        className="w-48"
      />
    </div>
  );
}
```

## 🔧 API Reference

### Props del Logo

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `src` | `string` | `"/logo.svg"` | URL de la imagen del logo |
| `alt` | `string` | `"Logo"` | Texto alternativo para accesibilidad |
| `className` | `string` | `""` | Clases CSS adicionales |
| `width` | `number` | - | Ancho específico (afecta skeleton) |
| `height` | `number` | - | Alto específico (afecta skeleton) |
| `aspect` | `{ w: number; h: number }` | `{ w: 1, h: 1 }` | Proporción ancho:alto |
| `style` | `React.CSSProperties` | - | Estilos inline adicionales |

## 🎯 Casos de Uso Comunes

### Header de Aplicación

```tsx
import React from 'react';
import Logo from '@/components/Logo/Logo';

export default function AppHeader() {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo principal */}
          <div className="flex items-center">
            <Logo
              className="w-10 h-10"
              alt="DSPM-App Logo"
            />
            <span className="ml-3 text-xl font-bold text-gray-900">
              DSPM-App
            </span>
          </div>

          {/* Navegación */}
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-700 hover:text-gray-900">
              Dashboard
            </a>
            <a href="/reports" className="text-gray-700 hover:text-gray-900">
              Reportes
            </a>
            <a href="/settings" className="text-gray-700 hover:text-gray-900">
              Configuración
            </a>
          </nav>

          {/* Usuario */}
          <div className="flex items-center">
            <span className="text-sm text-gray-700">Usuario</span>
          </div>
        </div>
      </div>
    </header>
  );
}
```

### Página de Login con Logo

```tsx
import React from 'react';
import Logo from '@/components/Logo/Logo';
import LoginForm from '@/components/LoginForm/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="w-full max-w-md">
        {/* Logo prominente */}
        <div className="text-center mb-8">
          <Logo
            className="w-32 h-32 mx-auto mb-4"
            alt="DSPM-App"
          />
          <h1 className="text-2xl font-bold text-white">DSPM-App</h1>
          <p className="text-white text-opacity-80 mt-2">
            v1.0.0-alpha.1
          </p>
        </div>

        {/* Formulario de login */}
        <LoginForm />
      </div>
    </div>
  );
}
```

### Footer con Logo

```tsx
import React from 'react';
import Logo from '@/components/Logo/Logo';

export default function AppFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo y descripción */}
          <div className="col-span-1 md:col-span-2">
            <Logo
              className="w-16 h-16 mb-4"
              alt="DSPM-App Logo"
            />
            <p className="text-gray-300 mb-4">
              Sistema de gestión y monitoreo de procesos DSPM.
              Tecnología avanzada para optimizar operaciones.
            </p>
            <p className="text-sm text-gray-400">
              © 2024 DSPM-App. Todos los derechos reservados.
            </p>
          </div>

          {/* Enlaces */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Producto</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/features" className="hover:text-white">Características</a></li>
              <li><a href="/pricing" className="hover:text-white">Precios</a></li>
              <li><a href="/docs" className="hover:text-white">Documentación</a></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Soporte</h3>
            <ul className="space-y-2 text-gray-300">
              <li><a href="/help" className="hover:text-white">Ayuda</a></li>
              <li><a href="/contact" className="hover:text-white">Contacto</a></li>
              <li><a href="/status" className="hover:text-white">Estado del Sistema</a></li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
```

### Logo en Loading States

```tsx
import React, { useState, useEffect } from 'react';
import Logo from '@/components/Logo/Logo';

export default function LoadingScreen() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-white flex items-center justify-center z-50">
        <div className="text-center">
          <Logo
            className="w-24 h-24 mx-auto mb-4 animate-pulse"
            alt="DSPM-App"
          />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-gray-600 mt-4">Cargando DSPM-App...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Contenido de la aplicación */}
      <h1>Aplicación cargada</h1>
    </div>
  );
}
```

### Logo en Sidebar/Navigation

```tsx
import React, { useState } from 'react';
import Logo from '@/components/Logo/Logo';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className={`bg-gray-900 text-white transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Header del sidebar */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center">
              <Logo
                className="w-8 h-8 mr-3"
                alt="DSPM-App"
              />
              <span className="font-bold text-lg">DSPM-App</span>
            </div>
          )}
          {isCollapsed && (
            <Logo
              className="w-8 h-8 mx-auto"
              alt="DSPM-App"
            />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 hover:bg-gray-700 rounded"
          >
            ☰
          </button>
        </div>
      </div>

      {/* Navegación */}
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <a href="/dashboard" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <span className="mr-3">📊</span>
              {!isCollapsed && <span>Dashboard</span>}
            </a>
          </li>
          <li>
            <a href="/reports" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <span className="mr-3">📋</span>
              {!isCollapsed && <span>Reportes</span>}
            </a>
          </li>
          <li>
            <a href="/settings" className="flex items-center p-2 hover:bg-gray-700 rounded">
              <span className="mr-3">⚙️</span>
              {!isCollapsed && <span>Configuración</span>}
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
```

### Logo en Cards/Product Cards

```tsx
import React from 'react';
import Logo from '@/components/Logo/Logo';
import { Card } from '@/components/Card';

interface Product {
  id: string;
  name: string;
  logo: string;
  description: string;
}

export default function ProductShowcase() {
  const products: Product[] = [
    {
      id: '1',
      name: 'DSPM-Core',
      logo: '/logos/dspm-core.svg',
      description: 'Núcleo del sistema de procesamiento DSPM'
    },
    {
      id: '2',
      name: 'DSPM-Analytics',
      logo: '/logos/dspm-analytics.svg',
      description: 'Módulo de análisis y reportes avanzados'
    },
    {
      id: '3',
      name: 'DSPM-Mobile',
      logo: '/logos/dspm-mobile.svg',
      description: 'Aplicación móvil complementaria'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
      {products.map((product) => (
        <Card
          key={product.id}
          top={
            <div className="text-center py-4">
              <Logo
                src={product.logo}
                alt={`${product.name} Logo`}
                className="w-16 h-16 mx-auto"
                aspect={{ w: 1, h: 1 }}
              />
            </div>
          }
          content={
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm">{product.description}</p>
            </div>
          }
          actions={
            <div className="flex gap-2">
              <button className="flex-1 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
                Ver Más
              </button>
              <button className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                Demo
              </button>
            </div>
          }
        />
      ))}
    </div>
  );
}
```

## 🎨 Personalización

### Diferentes Aspectos y Tamaños

```tsx
// Logos cuadrados (default)
<Logo className="w-32 h-32" aspect={{ w: 1, h: 1 }} />

// Logos rectangulares
<Logo className="w-48 h-24" aspect={{ w: 2, h: 1 }} />
<Logo className="w-24 h-48" aspect={{ w: 1, h: 2 }} />

// Logos panorámicos
<Logo className="w-64 h-16" aspect={{ w: 4, h: 1 }} />

// Tamaños responsivos
<Logo className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32" />
```

### Estilos Personalizados

```tsx
// Logo con borde y sombra
<Logo
  className="w-32 h-32 border-2 border-gray-300 rounded-lg shadow-lg"
  style={{
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
  }}
/>

// Logo con fondo gradiente
<div className="p-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
  <Logo
    className="w-24 h-24"
    style={{ filter: 'brightness(0) invert(1)' }} // Logo blanco
  />
</div>

// Logo con animación
<Logo
  className="w-32 h-32 hover:scale-110 transition-transform duration-300 cursor-pointer"
/>
```

### Tema Oscuro

```tsx
// Logo que se adapta al tema
<div className="dark">
  <Logo
    className="w-24 h-24"
    style={{
      filter: 'brightness(0) invert(1)', // Convierte a blanco en tema oscuro
    }}
  />
</div>

// O usar diferentes logos para cada tema
const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

<Logo
  src={isDark ? '/logo-dark.svg' : '/logo-light.svg'}
  className="w-32 h-32"
/>
```

### Logos con Fallback Personalizado

```tsx
// El componente maneja errores automáticamente
// Pero puedes crear un wrapper personalizado

import Logo from '@/components/Logo/Logo';

interface CustomLogoProps extends React.ComponentProps<typeof Logo> {
  fallbackText?: string;
  showFallbackText?: boolean;
}

const CustomLogo: React.FC<CustomLogoProps> = ({
  fallbackText = "Logo",
  showFallbackText = true,
  ...props
}) => {
  return (
    <div className="relative">
      <Logo {...props} />
      {showFallbackText && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded">
          <span className="text-gray-500 font-bold text-lg">{fallbackText}</span>
        </div>
      )}
    </div>
  );
};

// Uso
<CustomLogo
  src="/missing-logo.svg"
  fallbackText="DSPM"
  className="w-32 h-32"
/>
```

## 📱 Responsive Design

El Logo es completamente responsive:

```tsx
// Diseño responsive automático
<Logo className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32" />

// En diferentes breakpoints
<div className="flex items-center gap-4">
  {/* Logo pequeño en móvil */}
  <Logo className="w-8 h-8 sm:hidden" />

  {/* Logo mediano en tablet */}
  <Logo className="hidden sm:block md:hidden w-16 h-16" />

  {/* Logo grande en desktop */}
  <Logo className="hidden md:block w-24 h-24" />
</div>

// Grid responsivo de logos
<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
  {logos.map((logo, index) => (
    <Logo
      key={index}
      src={logo.src}
      alt={logo.alt}
      className="w-full aspect-square"
    />
  ))}
</div>
```

## 🎯 Mejores Prácticas

### 1. Elegir el Tamaño Apropiado

```tsx
// ✅ Bien - tamaños según contexto
// Headers principales: 32px - 64px
<Logo className="w-8 h-8 md:w-16 md:h-16" />

// Sidebars: 24px - 32px
<Logo className="w-6 h-6 md:w-8 md:h-8" />

// Login pages: 128px - 256px
<Logo className="w-32 h-32 md:w-48 md:h-48" />

// Favicons/cards: 16px - 24px
<Logo className="w-4 h-4 md:w-6 md:h-6" />

// ❌ Mal - tamaños inconsistentes
<Logo className="w-64 h-4" /> // Proporciones extrañas
```

### 2. Optimizar Imágenes

```tsx
// ✅ Bien - usar formatos modernos
// WebP para navegadores modernos
// SVG para logos vectoriales
// PNG con transparencia cuando sea necesario

// ✅ Bien - diferentes tamaños para diferentes contextos
const logoSizes = {
  small: '/logo-32x32.png',
  medium: '/logo-128x128.png',
  large: '/logo-512x512.png',
};

// Elegir según el contexto
<Logo src={logoSizes[getLogoSize(context)]} />
```

### 3. Accesibilidad

```tsx
// ✅ Bien - alt text descriptivo
<Logo
  src="/company-logo.svg"
  alt="DSPM-App - Sistema de Gestión y Monitoreo"
  className="w-32 h-32"
/>

// ✅ Bien - alt text en diferentes idiomas
<Logo
  alt={t('logo.alt', 'DSPM-App Logo')}
  className="w-24 h-24"
/>

// ✅ Bien - logos decorativos sin alt (solo si no agregan información)
<Logo
  src="/decorative-pattern.svg"
  alt="" // Alt vacío para imágenes decorativas
  className="w-16 h-16"
/>
```

### 4. Performance

```tsx
// ✅ Bien - lazy loading para logos no críticos
import { useState, useRef, useEffect } from 'react';

const LazyLogo: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref}>
      {isVisible ? (
        <Logo className="w-32 h-32" />
      ) : (
        <div className="w-32 h-32 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  );
};
```

## 🐛 Solución de Problemas

### Problema: El logo no se muestra

```tsx
// Verifica que el archivo existe en public/
ls public/logo.svg

// Si no existe, el componente muestra un fallback automático
// Para usar un logo personalizado:
<Logo src="/mi-logo.svg" />

// Asegúrate de que la ruta sea correcta
// ✅ Correcto: src="/logo.svg"
// ❌ Incorrecto: src="logo.svg"
// ❌ Incorrecto: src="./logo.svg"
```

### Problema: Proporciones incorrectas

```tsx
// Usa el prop aspect para controlar proporciones
<Logo
  aspect={{ w: 2, h: 1 }} // Rectangular horizontal
  className="w-48" // Solo ancho, alto se calcula automáticamente
/>

// O especifica ambos
<Logo
  className="w-48 h-24" // Ancho y alto fijos
  aspect={{ w: 2, h: 1 }}
/>

// Para logos cuadrados (default)
<Logo aspect={{ w: 1, h: 1 }} />
```

### Problema: Logo pixelado en pantallas retina

```tsx
// Proporciona diferentes resoluciones
// El navegador elige automáticamente la mejor

// Estructura recomendada:
// public/logo.svg (vectorial, ideal)
// public/logo.png (raster, alta resolución)
// public/logo@2x.png (pantallas retina)

<Logo
  src="/logo.svg"
  className="w-32 h-32"
/>

// O usa picture para múltiples formatos
<picture>
  <source srcSet="/logo.webp" type="image/webp">
  <source srcSet="/logo.svg" type="image/svg+xml">
  <img src="/logo.png" alt="Logo" className="w-32 h-32">
</picture>
```

### Problema: Fallback no funciona

```tsx
// El componente maneja errores automáticamente
// Para debugging, verifica la consola
<Logo
  src="/non-existent-logo.svg"
  alt="Logo"
  className="w-32 h-32"
  onError={() => console.log('Logo failed to load')}
/>

// El fallback muestra:
// - Un div gris con "Logo" centrado
// - Mantiene las mismas dimensiones
// - Tiene data-test-id="logo-skeleton-root"
```

### Problema: Logo se ve borroso

```tsx
// Asegúrate de usar tamaños apropiados
// ✅ Bien - múltiplos de 4px o 8px
<Logo className="w-32 h-32" /> // 128px = 32 * 4

// ✅ Bien - usa SVG cuando sea posible
<Logo src="/logo.svg" /> // Vectores escalan perfectamente

// ❌ Mal - tamaños arbitrarios
<Logo className="w-33 h-33" /> // 33px no es múltiplo estándar
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/Logo/page.tsx` - Showcase completo con diferentes configuraciones
- `app/components/LoginForm/LoginForm.tsx` - Uso en formularios de login
- `app/layout.tsx` - Uso en layouts principales

## 🤝 Contribución

Para contribuir al componente Logo:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevas opciones de personalización manteniendo la simplicidad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente con diferentes formatos y tamaños de imagen