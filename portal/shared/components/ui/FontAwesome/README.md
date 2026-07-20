# FontAwesome Component

Wrapper elegante y completamente tipado para FontAwesome icons, que proporciona una API simple y consistente para usar íconos con diferentes estilos, tamaños, animaciones y personalizaciones.

## 🚀 Características Principales

- ✅ **Múltiples Estilos**: Solid, Regular, Light, Duotone, Brands
- ✅ **Tamaños Escalables**: Desde xs hasta 10xl
- ✅ **Animaciones**: Spin, pulse y otras animaciones de FA
- ✅ **Colores Personalizables**: Cualquier color CSS
- ✅ **Interactividad**: Soporte para onClick y navegación por teclado
- ✅ **Accesibilidad**: ARIA roles y navegación por teclado
- ✅ **TypeScript**: Completamente tipado
- ✅ **Performance**: Optimizado con clases CSS eficientes

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import FontAwesome from '@/components/FontAwesome/FontAwesome';

# Asegúrate de que FontAwesome CSS esté cargado en tu aplicación
# Normalmente en _app.tsx o layout.tsx:
import '@fortawesome/fontawesome-free/css/all.min.css';
```

## 🎯 Uso Básico

```tsx
import React from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';

export default function BasicIcons() {
  return (
    <div className="flex items-center gap-4 p-4">
      {/* Ícono básico */}
      <FontAwesome icon="user" />

      {/* Ícono con estilo específico */}
      <FontAwesome icon="heart" style="regular" />

      {/* Ícono de marca */}
      <FontAwesome icon="react" style="brands" />

      {/* Ícono con tamaño personalizado */}
      <FontAwesome icon="star" size="lg" />

      {/* Ícono con color personalizado */}
      <FontAwesome icon="check" color="#10b981" />
    </div>
  );
}
```

## 🔧 API Reference

### Props del FontAwesome

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `icon` | `string` | - | Nombre del ícono de FontAwesome (sin prefijo fa-) |
| `style` | `'solid' \| 'regular' \| 'light' \| 'duotone' \| 'brands'` | `'solid'` | Estilo del ícono |
| `size` | `'xs' \| 'sm' \| 'lg' \| 'xl' \| '2xl' \| ... \| '10xl'` | - | Tamaño del ícono |
| `color` | `string` | - | Color del ícono (cualquier valor CSS) |
| `className` | `string` | `''` | Clases CSS adicionales |
| `onClick` | `() => void` | - | Función a ejecutar al hacer click |
| `spin` | `boolean` | `false` | Animación de rotación continua |
| `pulse` | `boolean` | `false` | Animación de rotación con pausas |
| `fixedWidth` | `boolean` | `false` | Ancho fijo para alineación |
| `border` | `boolean` | `false` | Borde alrededor del ícono |
| `pull` | `'left' \| 'right'` | - | Flotado a izquierda o derecha |
| `transform` | `string` | - | Transformaciones CSS personalizadas |
| `mask` | `string` | - | Máscara para efectos avanzados |
| `symbol` | `string \| boolean` | - | Para usar como símbolo SVG |
| `title` | `string` | - | Tooltip/title del ícono |

## 🎯 Casos de Uso Comunes

### Botones con Íconos

```tsx
import React from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';
import { Button } from '@/components/Button';

export default function IconButtons() {
  const handleSave = () => console.log('Guardando...');
  const handleDelete = () => console.log('Eliminando...');
  const handleEdit = () => console.log('Editando...');

  return (
    <div className="flex gap-2">
      <Button variant="primary" onClick={handleSave}>
        <FontAwesome icon="save" className="mr-2" />
        Guardar
      </Button>

      <Button variant="secondary" onClick={handleEdit}>
        <FontAwesome icon="edit" className="mr-2" />
        Editar
      </Button>

      <Button variant="danger" onClick={handleDelete}>
        <FontAwesome icon="trash" className="mr-2" />
        Eliminar
      </Button>
    </div>
  );
}
```

### Estados y Feedback Visual

```tsx
import React, { useState } from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';

export default function StatusIndicators() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="space-y-4">
      {/* Loading spinner */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsLoading(!isLoading)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isLoading ? (
            <>
              <FontAwesome icon="spinner" spin />
              Cargando...
            </>
          ) : (
            <>
              <FontAwesome icon="play" />
              Iniciar
            </>
          )}
        </button>
      </div>

      {/* Favorite toggle */}
      <div className="flex items-center gap-2">
        <span>¿Te gusta?</span>
        <FontAwesome
          icon={isFavorite ? 'heart' : 'heart'}
          style={isFavorite ? 'solid' : 'regular'}
          color={isFavorite ? '#ef4444' : '#6b7280'}
          onClick={() => setIsFavorite(!isFavorite)}
          className="cursor-pointer hover:scale-110 transition-transform"
        />
      </div>

      {/* Success/Error states */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-green-600">
          <FontAwesome icon="check-circle" />
          <span>Operación exitosa</span>
        </div>

        <div className="flex items-center gap-2 text-red-600">
          <FontAwesome icon="exclamation-triangle" />
          <span>Error en la operación</span>
        </div>
      </div>
    </div>
  );
}
```

### Navegación y Menús

```tsx
import React from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';

interface MenuItem {
  icon: string;
  label: string;
  action: () => void;
}

export default function NavigationMenu() {
  const menuItems: MenuItem[] = [
    { icon: 'home', label: 'Inicio', action: () => console.log('Ir a inicio') },
    { icon: 'user', label: 'Perfil', action: () => console.log('Ir a perfil') },
    { icon: 'cog', label: 'Configuración', action: () => console.log('Ir a configuración') },
    { icon: 'sign-out-alt', label: 'Salir', action: () => console.log('Cerrar sesión') },
  ];

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="space-y-2">
        {menuItems.map((item, index) => (
          <li key={index}>
            <button
              onClick={item.action}
              className="flex items-center gap-3 w-full text-left px-3 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              <FontAwesome icon={item.icon} fixedWidth />
              <span>{item.label}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
```

### Dashboard con Métricas

```tsx
import React from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';

interface MetricCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'neutral';
}

export default function DashboardMetrics() {
  const metrics: MetricCard[] = [
    {
      title: 'Usuarios Activos',
      value: '1,234',
      icon: 'users',
      color: '#3b82f6',
      trend: 'up'
    },
    {
      title: 'Ventas Totales',
      value: '$45,678',
      icon: 'dollar-sign',
      color: '#10b981',
      trend: 'up'
    },
    {
      title: 'Pedidos Pendientes',
      value: '23',
      icon: 'shopping-cart',
      color: '#f59e0b',
      trend: 'neutral'
    },
    {
      title: 'Reportes de Error',
      value: '5',
      icon: 'exclamation-circle',
      color: '#ef4444',
      trend: 'down'
    }
  ];

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return { icon: 'arrow-up', color: '#10b981' };
      case 'down': return { icon: 'arrow-down', color: '#ef4444' };
      default: return { icon: 'minus', color: '#6b7280' };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
      {metrics.map((metric, index) => {
        const trend = getTrendIcon(metric.trend || 'neutral');
        return (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <FontAwesome
                  icon={metric.icon}
                  size="2xl"
                  color={metric.color}
                />
                <FontAwesome
                  icon={trend.icon}
                  size="sm"
                  color={trend.color}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

### Formularios con Validación

```tsx
import React, { useState } from 'react';
import FontAwesome from '@/components/FontAwesome/FontAwesome';
import { TextField } from '@/components/TextField';

export default function FormWithValidation() {
  const [email, setEmail] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setIsValid(value ? validateEmail(value) : null);
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <div className="relative">
        <TextField
          label="Correo Electrónico"
          type="email"
          value={email}
          onChange={handleEmailChange}
          placeholder="usuario@ejemplo.com"
        />

        {/* Ícono de validación */}
        {isValid !== null && (
          <div className="absolute right-3 top-9">
            <FontAwesome
              icon={isValid ? 'check-circle' : 'times-circle'}
              color={isValid ? '#10b981' : '#ef4444'}
              size="lg"
            />
          </div>
        )}
      </div>

      {/* Mensaje de validación */}
      {isValid === false && (
        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
          <FontAwesome icon="exclamation-circle" />
          Por favor ingresa un correo electrónico válido
        </p>
      )}

      {isValid === true && (
        <p className="text-green-600 text-sm mt-1 flex items-center gap-1">
          <FontAwesome icon="check-circle" />
          Correo electrónico válido
        </p>
      )}
    </div>
  );
}
```

## 🎨 Personalización

### Colores y Temas

```tsx
// Colores personalizados
<FontAwesome icon="star" color="#ffd700" /> {/* Oro */}
<FontAwesome icon="heart" color="#ff6b6b" /> {/* Rojo coral */}
<FontAwesome icon="thumbs-up" color="#51cf66" /> {/* Verde */}

// Usando variables CSS
<FontAwesome icon="user" color="var(--color-primary)" />

// Tema oscuro
<div className="dark">
  <FontAwesome icon="moon" color="#fbbf24" />
  <FontAwesome icon="sun" color="#f59e0b" />
</div>
```

### Animaciones Avanzadas

```tsx
// Diferentes tipos de animación
<div className="space-y-4">
  <FontAwesome icon="spinner" spin size="2xl" />
  <FontAwesome icon="circle-notch" spin size="2xl" />
  <FontAwesome icon="cog" spin size="2xl" />
  <FontAwesome icon="atom" spin size="2xl" />

  <FontAwesome icon="heartbeat" pulse size="2xl" color="#ef4444" />
  <FontAwesome icon="sync" pulse size="2xl" />
</div>

// Animaciones personalizadas con CSS
<FontAwesome
  icon="bell"
  className="animate-bounce"
  size="2xl"
  color="#f59e0b"
/>
```

### Transformaciones y Efectos

```tsx
// Rotaciones y escalas
<FontAwesome icon="arrow-right" transform="rotate-90" />
<FontAwesome icon="arrow-right" transform="rotate-180" />
<FontAwesome icon="star" transform="grow-6" />

// Combinaciones
<FontAwesome
  icon="camera"
  transform="shrink-4 rotate-15"
  border
  pull="left"
/>

// Máscaras para efectos avanzados
<FontAwesome
  icon="circle"
  mask="square"
  transform="grow-8"
  color="#3b82f6"
/>
```

### Íconos en Listas y Tablas

```tsx
// Alineación perfecta con fixedWidth
<ul className="space-y-2">
  <li className="flex items-center gap-3">
    <FontAwesome icon="user" fixedWidth />
    <span>Perfil de Usuario</span>
  </li>
  <li className="flex items-center gap-3">
    <FontAwesome icon="cog" fixedWidth />
    <span>Configuración</span>
  </li>
  <li className="flex items-center gap-3">
    <FontAwesome icon="sign-out-alt" fixedWidth />
    <span>Cerrar Sesión</span>
  </li>
</ul>
```

## 📱 Responsive Design

Los íconos se adaptan automáticamente, pero puedes usar tamaños responsivos:

```tsx
// Tamaños responsivos con clases de Tailwind
<div className="flex items-center gap-2">
  <FontAwesome icon="menu" className="md:hidden" /> {/* Solo móvil */}
  <FontAwesome icon="bars" className="hidden md:block" /> {/* Desktop */}
</div>

// Tamaños dinámicos
<FontAwesome
  icon="star"
  size={window.innerWidth < 640 ? 'lg' : '2xl'}
/>
```

## 🎯 Mejores Prácticas

### 1. Elegir el Estilo Apropiado

```tsx
// ✅ Bien - usar estilos consistentes
<FontAwesome icon="user" style="solid" /> {/* Principal */}
<FontAwesome icon="user" style="regular" /> {/* Secundario */}
<FontAwesome icon="react" style="brands" /> {/* Marcas */}

// ❌ Mal - mezclar estilos inconsistentes
<FontAwesome icon="user" style="solid" />
<FontAwesome icon="cog" style="light" /> {/* Inconsistente */}
```

### 2. Usar Tamaños Consistentes

```tsx
// ✅ Bien - tamaños escalares
<FontAwesome icon="home" size="lg" /> {/* Navegación */}
<FontAwesome icon="star" size="sm" /> {/* Ratings */}
<FontAwesome icon="check" size="xs" /> {/* Estados */}

// ❌ Mal - tamaños arbitrarios
<FontAwesome icon="user" style={{ fontSize: '17px' }} />
```

### 3. Accesibilidad

```tsx
// ✅ Bien - incluir títulos descriptivos
<FontAwesome
  icon="question-circle"
  title="Ayuda"
  onClick={() => showHelp()}
/>

// ✅ Bien - botones con labels apropiados
<button aria-label="Cerrar modal">
  <FontAwesome icon="times" />
</button>

// ✅ Bien - íconos decorativos sin título
<FontAwesome
  icon="spinner"
  spin
  aria-hidden="true" // No relevante para lectores de pantalla
/>
```

### 4. Performance

```tsx
// ✅ Bien - usar CSS puro en lugar de inline styles cuando sea posible
<FontAwesome icon="star" className="text-yellow-400" />

// ✅ Bien - lazy loading para íconos grandes
const [showIcon, setShowIcon] = useState(false);

useEffect(() => {
  const timer = setTimeout(() => setShowIcon(true), 100);
  return () => clearTimeout(timer);
}, []);

{showIcon && <FontAwesome icon="rocket" size="3xl" />}
```

## 🐛 Solución de Problemas

### Problema: Los íconos no se muestran

```tsx
// Asegúrate de que FontAwesome CSS esté cargado
// En tu _app.tsx o layout.tsx:
import '@fortawesome/fontawesome-free/css/all.min.css';

// O usando CDN en index.html:
<link
  rel="stylesheet"
  href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
/>
```

### Problema: Ícono específico no funciona

```tsx
// Verifica el nombre del ícono en la documentación de FontAwesome
// https://fontawesome.com/icons

// ✅ Correcto
<FontAwesome icon="user" />
<FontAwesome icon="chevron-down" />
<FontAwesome icon="sign-out-alt" />

// ❌ Incorrecto - nombres incorrectos
<FontAwesome icon="fa-user" /> {/* No incluir prefijo */}
<FontAwesome icon="user-icon" /> {/* Sufijo incorrecto */}
```

### Problema: Colores no se aplican

```tsx
// ✅ Bien - usar prop color
<FontAwesome icon="heart" color="#ff6b6b" />

// ✅ Bien - usar clases de Tailwind
<FontAwesome icon="star" className="text-yellow-400" />

// ❌ Mal - inline styles pueden ser sobreescritos
<FontAwesome icon="user" style={{ color: 'red' }} />
```

### Problema: Íconos no están alineados

```tsx
// ✅ Solución - usar fixedWidth para listas
<ul>
  <li className="flex items-center gap-2">
    <FontAwesome icon="user" fixedWidth />
    <span>Usuario</span>
  </li>
  <li className="flex items-center gap-2">
    <FontAwesome icon="cog" fixedWidth />
    <span>Configuración</span>
  </li>
</ul>

// Para alineación vertical
<div className="flex items-center">
  <FontAwesome icon="check" className="mr-2" />
  <span>Texto alineado</span>
</div>
```

### Problema: Animaciones no funcionan

```tsx
// Asegúrate de usar las props correctas
<FontAwesome icon="spinner" spin /> {/* ✅ Correcto */}
<FontAwesome icon="circle-notch" spin /> {/* ✅ Correcto */}

// ❌ Incorrecto - no todos los íconos funcionan con spin
<FontAwesome icon="user" spin /> {/* No tiene sentido */}
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/FontAwesome/page.tsx` - Showcase completo con todos los estilos y opciones
- `app/components/IconButton/` - Ejemplos de uso en botones
- `app/components/Button/` - Íconos en botones de acción

## 🤝 Contribución

Para contribuir al componente FontAwesome:

1. Mantén la compatibilidad con la API existente
2. Agrega nuevos props solo si son necesarios y están bien tipados
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que la accesibilidad se mantenga en todas las adiciones
6. Prueba el componente con diferentes combinaciones de props