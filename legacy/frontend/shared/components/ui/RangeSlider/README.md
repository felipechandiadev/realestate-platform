# RangeSlider Component

Componente de rango doble interactivo con thumbs arrastrables, valores mínimo/máximo configurables y soporte completo para accesibilidad y testing.

## 🚀 Características Principales

- ✅ **Rango Doble**: Selección de valores mínimo y máximo simultáneamente
- ✅ **Interfaz Intuitiva**: Thumbs arrastrables con feedback visual
- ✅ **Personalizable**: Rangos, colores y estilos completamente configurables
- ✅ **Accesibilidad**: Labels ARIA, navegación por teclado y lectores de pantalla
- ✅ **TypeScript**: Completamente tipado con interfaces claras
- ✅ **Data Test IDs**: Soporte completo para testing automatizado
- ✅ **Responsive**: Diseño adaptativo que funciona en todos los dispositivos
- ✅ **Performance**: Optimizado con event listeners eficientes

## 📦 Instalación

```bash
# El componente ya está incluido en el proyecto
import RangeSlider from '@/components/RangeSlider/RangeSlider';
```

## 🎯 Uso Básico

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function BasicRangeSlider() {
  const [range, setRange] = useState<[number, number]>([20, 80]);

  return (
    <div className="p-6 max-w-md">
      <h3 className="text-lg font-semibold mb-4">Seleccionar Rango de Precios</h3>

      <RangeSlider
        min={0}
        max={100}
        value={range}
        onChange={setRange}
      />

      <div className="mt-4 text-sm text-gray-600">
        Rango seleccionado: ${range[0]} - ${range[1]}
      </div>
    </div>
  );
}
```

## 🔧 API Reference

### Props del RangeSlider

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `min` | `number` | `0` | Valor mínimo del rango |
| `max` | `number` | `100` | Valor máximo del rango |
| `value` | `[number, number]` | `[min, max]` | Valores actuales [min, max] |
| `onChange` | `(values: [number, number]) => void` | - | Callback cuando cambian los valores |

## 🎯 Casos de Uso Comunes

### Filtro de Precios

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

interface PriceFilterProps {
  onPriceChange: (min: number, max: number) => void;
}

export default function PriceFilter({ onPriceChange }: PriceFilterProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  const handlePriceChange = (values: [number, number]) => {
    setPriceRange(values);
    onPriceChange(values[0], values[1]);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold mb-4">Filtrar por Precio</h3>

      <div className="space-y-4">
        <RangeSlider
          min={0}
          max={1000}
          value={priceRange}
          onChange={handlePriceChange}
        />

        <div className="flex justify-between text-sm text-gray-600">
          <span>Rango: ${priceRange[0]} - ${priceRange[1]}</span>
          <button
            onClick={() => handlePriceChange([0, 1000])}
            className="text-blue-500 hover:text-blue-700"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Control de Volumen y Audio

```tsx
import React, { useState, useEffect } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function AudioControls() {
  const [volume, setVolume] = useState<[number, number]>([20, 80]);
  const [bass, setBass] = useState<[number, number]>([-10, 10]);

  useEffect(() => {
    // Aplicar configuración de audio
    console.log('Volumen:', volume);
    console.log('Bass:', bass);
  }, [volume, bass]);

  return (
    <div className="bg-gray-900 text-white p-6 rounded-lg">
      <h3 className="text-xl font-bold mb-6">Controles de Audio</h3>

      <div className="space-y-6">
        {/* Volumen Principal */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Volumen Principal: {volume[0]}% - {volume[1]}%
          </label>
          <RangeSlider
            min={0}
            max={100}
            value={volume}
            onChange={setVolume}
          />
        </div>

        {/* Ecualizador de Graves */}
        <div>
          <label className="block text-sm font-medium mb-2">
            Ecualizador de Graves: {bass[0]}dB - {bass[1]}dB
          </label>
          <RangeSlider
            min={-20}
            max={20}
            value={bass}
            onChange={setBass}
          />
        </div>

        {/* Preset buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => {
              setVolume([30, 70]);
              setBass([-5, 5]);
            }}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm"
          >
            Preset: Balanceado
          </button>
          <button
            onClick={() => {
              setVolume([50, 90]);
              setBass([0, 15]);
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
          >
            Preset: Rock
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Filtro de Fechas

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function DateRangeFilter() {
  const currentYear = new Date().getFullYear();
  const [yearRange, setYearRange] = useState<[number, number]>([currentYear - 10, currentYear]);

  const formatYear = (year: number) => year.toString();

  return (
    <div className="bg-white p-6 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4">Filtrar por Año</h3>

      <RangeSlider
        min={2000}
        max={currentYear}
        value={yearRange}
        onChange={setYearRange}
      />

      <div className="mt-4 text-sm text-gray-600">
        Mostrando datos desde {formatYear(yearRange[0])} hasta {formatYear(yearRange[1])}
      </div>

      {/* Quick filters */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setYearRange([currentYear - 1, currentYear])}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Último año
        </button>
        <button
          onClick={() => setYearRange([currentYear - 5, currentYear])}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Últimos 5 años
        </button>
        <button
          onClick={() => setYearRange([2000, currentYear])}
          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
        >
          Todo
        </button>
      </div>
    </div>
  );
}
```

### Configuración de Temperatura

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function TemperatureControl() {
  const [comfortRange, setComfortRange] = useState<[number, number]>([18, 24]);

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
      <h3 className="text-xl font-bold text-gray-800 mb-6">Control de Temperatura</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rango de Confort: {comfortRange[0]}°C - {comfortRange[1]}°C
          </label>
          <RangeSlider
            min={15}
            max={30}
            value={comfortRange}
            onChange={setComfortRange}
          />
        </div>

        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Estado Actual</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Temperatura Mínima:</span>
              <span className="ml-2 font-medium">{comfortRange[0]}°C</span>
            </div>
            <div>
              <span className="text-gray-600">Temperatura Máxima:</span>
              <span className="ml-2 font-medium">{comfortRange[1]}°C</span>
            </div>
          </div>
        </div>

        {/* Indicador visual de rango */}
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-gradient-to-r from-blue-400 to-red-400 rounded-full"
            style={{
              left: `${((comfortRange[0] - 15) / (30 - 15)) * 100}%`,
              width: `${((comfortRange[1] - comfortRange[0]) / (30 - 15)) * 100}%`
            }}
          />
        </div>
      </div>
    </div>
  );
}
```

### Filtro de Calificaciones

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function RatingFilter() {
  const [ratingRange, setRatingRange] = useState<[number, number]>([3, 5]);

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5) return 'Excelente';
    if (rating >= 4.0) return 'Muy Bueno';
    if (rating >= 3.5) return 'Bueno';
    if (rating >= 3.0) return 'Regular';
    return 'Deficiente';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border">
      <h3 className="text-lg font-semibold mb-4">Filtrar por Calificación</h3>

      <RangeSlider
        min={1}
        max={5}
        value={ratingRange}
        onChange={setRatingRange}
      />

      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Mínimo:</span>
          <span className="font-medium">
            {ratingRange[0]} ⭐ ({getRatingLabel(ratingRange[0])})
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Máximo:</span>
          <span className="font-medium">
            {ratingRange[1]} ⭐ ({getRatingLabel(ratingRange[1])})
          </span>
        </div>
      </div>

      {/* Visual rating indicator */}
      <div className="mt-4 flex justify-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={`text-2xl ${
              star >= ratingRange[0] && star <= ratingRange[1]
                ? 'text-yellow-400'
                : 'text-gray-300'
            }`}
          >
            ⭐
          </span>
        ))}
      </div>
    </div>
  );
}
```

### Configuración de Zoom y Escala

```tsx
import React, { useState } from 'react';
import RangeSlider from '@/components/RangeSlider/RangeSlider';

export default function ZoomControls() {
  const [zoomRange, setZoomRange] = useState<[number, number]>([50, 200]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Controles de Zoom</h3>

      <div className="space-y-4">
        <RangeSlider
          min={25}
          max={400}
          value={zoomRange}
          onChange={setZoomRange}
        />

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-white p-3 rounded border">
            <div className="text-gray-600">Zoom Mínimo</div>
            <div className="text-2xl font-bold text-blue-600">{zoomRange[0]}%</div>
          </div>
          <div className="bg-white p-3 rounded border">
            <div className="text-gray-600">Zoom Máximo</div>
            <div className="text-2xl font-bold text-green-600">{zoomRange[1]}%</div>
          </div>
        </div>

        {/* Preview del zoom */}
        <div className="bg-white border rounded p-4">
          <div className="text-center">
            <div
              className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded transition-all duration-300"
              style={{
                transform: `scale(${Math.min(zoomRange[0], zoomRange[1]) / 100})`,
              }}
            >
              Vista Previa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

## 🎨 Personalización

### Estilos Personalizados

```tsx
// RangeSlider con colores personalizados
const CustomRangeSlider = () => {
  const [value, setValue] = useState<[number, number]>([30, 70]);

  return (
    <div className="custom-range-slider">
      <style jsx>{`
        .custom-range-slider :global([data-test-id="range-slider-bg"]) {
          background: linear-gradient(90deg, #ff6b6b, #4ecdc4);
        }
        .custom-range-slider :global([data-test-id="range-slider-fill"]) {
          background: linear-gradient(90deg, #ff9ff3, #54a0ff);
        }
        .custom-range-slider :global([data-test-id="range-slider-thumb-min"]),
        .custom-range-slider :global([data-test-id="range-slider-thumb-max"]) {
          background: #ff9ff3;
          border-color: white;
          box-shadow: 0 2px 8px rgba(255, 159, 243, 0.3);
        }
      `}</style>

      <RangeSlider
        min={0}
        max={100}
        value={value}
        onChange={setValue}
      />
    </div>
  );
};
```

### Tema Oscuro

```tsx
// RangeSlider para tema oscuro
const DarkRangeSlider = () => {
  const [value, setValue] = useState<[number, number]>([20, 80]);

  return (
    <div className="dark bg-gray-900 p-6 rounded-lg">
      <RangeSlider
        min={0}
        max={100}
        value={value}
        onChange={setValue}
      />

      <style jsx global>{`
        .dark [data-test-id="range-slider-bg"] {
          background: #374151 !important;
        }
        .dark [data-test-id="range-slider-fill"] {
          background: #3b82f6 !important;
        }
        .dark [data-test-id="range-slider-thumb-min"],
        .dark [data-test-id="range-slider-thumb-max"] {
          background: #3b82f6 !important;
          border-color: #1f2937 !important;
        }
        .dark [data-test-id="range-slider-label"],
        .dark [data-test-id="range-slider-value-min"],
        .dark [data-test-id="range-slider-value-max"] {
          color: #e5e7eb !important;
        }
      `}</style>
    </div>
  );
};
```

### Rangos con Unidades

```tsx
// RangeSlider con diferentes unidades
const UnitRangeSlider = ({
  unit = 'px',
  label = 'Tamaño'
}: {
  unit?: string;
  label?: string;
}) => {
  const [value, setValue] = useState<[number, number]>([100, 500]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}: {value[0]}{unit} - {value[1]}{unit}
      </label>

      <RangeSlider
        min={50}
        max={1000}
        value={value}
        onChange={setValue}
      />

      {/* Indicador visual */}
      <div className="flex justify-between text-xs text-gray-500">
        <span>Mín: {value[0]}{unit}</span>
        <span>Máx: {value[1]}{unit}</span>
      </div>
    </div>
  );
};

// Uso con diferentes unidades
<UnitRangeSlider unit="px" label="Ancho" />
<UnitRangeSlider unit="%" label="Opacidad" />
<UnitRangeSlider unit="°C" label="Temperatura" />
```

## 📱 Responsive Design

El RangeSlider es completamente responsive:

```tsx
// Diseño responsive automático
<RangeSlider
  min={0}
  max={100}
  value={range}
  onChange={setRange}
/>

// En diferentes tamaños de pantalla
<div className="w-full max-w-sm sm:max-w-md md:max-w-lg">
  <RangeSlider
    min={0}
    max={100}
    value={range}
    onChange={setRange}
  />
</div>

// RangeSlider en sidebar móvil
<div className="fixed inset-0 z-50 lg:relative lg:inset-auto">
  <div className="absolute inset-0 bg-black bg-opacity-50 lg:hidden" />
  <div className="absolute right-0 top-0 h-full w-80 max-w-full bg-white lg:relative lg:w-full">
    <div className="p-6">
      <h3 className="text-lg font-semibold mb-4">Filtros</h3>
      <RangeSlider
        min={0}
        max={1000}
        value={priceRange}
        onChange={setPriceRange}
      />
    </div>
  </div>
</div>
```

## 🎯 Mejores Prácticas

### 1. Valores Iniciales Sensatos

```tsx
// ✅ Bien - valores iniciales que representen el rango completo
<RangeSlider
  min={0}
  max={100}
  value={[25, 75]} // 25% - 75% del rango
  onChange={setRange}
/>

// ✅ Bien - valores que representen casos de uso comunes
<RangeSlider
  min={18}
  max={65}
  value={[25, 55]} // Edad típica de trabajadores
  onChange={setAgeRange}
/>

// ❌ Mal - valores iniciales que no representan nada útil
<RangeSlider
  min={0}
  max={100}
  value={[0, 100]} // Todo el rango - no agrega valor
  onChange={setRange}
/>
```

### 2. Rangos Apropiados

```tsx
// ✅ Bien - rangos que tengan sentido para el contexto
<RangeSlider min={0} max={100} />     // Porcentajes
<RangeSlider min={1} max={5} />       // Calificaciones
<RangeSlider min={0} max={23} />      // Horas del día
<RangeSlider min={-20} max={20} />    // Valores simétricos

// ✅ Bien - rangos basados en datos reales
const data = [15, 23, 45, 67, 89, 95];
<RangeSlider
  min={Math.min(...data)}
  max={Math.max(...data)}
/>

// ❌ Mal - rangos demasiado amplios
<RangeSlider min={0} max={1000000} /> // Difícil de usar

// ❌ Mal - rangos sin sentido
<RangeSlider min={100} max={50} />   // Mín > Máx
```

### 3. Feedback Visual

```tsx
// ✅ Bien - mostrar siempre los valores actuales
<RangeSlider
  min={0}
  max={100}
  value={range}
  onChange={setRange}
/>
<div className="mt-2 text-sm text-gray-600">
  Valores: {range[0]} - {range[1]}
</div>

// ✅ Bien - feedback contextual
<RangeSlider
  min={0}
  max={100}
  value={opacity}
  onChange={setOpacity}
/>
<div
  className="mt-4 w-20 h-20 border rounded"
  style={{ backgroundColor: `rgba(255, 0, 0, ${opacity[0] / 100})` }}
/>

// ✅ Bien - indicadores de rango
<div className="relative">
  <RangeSlider
    min={0}
    max={100}
    value={range}
    onChange={setRange}
  />
  {/* Indicador visual del rango */}
  <div className="mt-2 h-2 bg-gray-200 rounded-full relative">
    <div
      className="absolute h-full bg-blue-500 rounded-full"
      style={{
        left: `${range[0]}%`,
        width: `${range[1] - range[0]}%`
      }}
    />
  </div>
</div>
```

### 4. Validación

```tsx
// ✅ Bien - validar rangos antes de aplicar
const handleRangeChange = (newRange: [number, number]) => {
  // Validar que el rango tenga sentido
  if (newRange[0] >= newRange[1]) return;

  // Validar límites
  const clampedRange: [number, number] = [
    Math.max(min, Math.min(max, newRange[0])),
    Math.max(min, Math.min(max, newRange[1]))
  ];

  setRange(clampedRange);
};

// ✅ Bien - prevenir rangos inválidos
<RangeSlider
  min={0}
  max={100}
  value={range}
  onChange={(newRange) => {
    if (newRange[0] < newRange[1]) {
      setRange(newRange);
    }
  }}
/>
```

## 🐛 Solución de Problemas

### Problema: Los thumbs no se mueven correctamente

```tsx
// Verifica que los valores estén en el rango correcto
const [range, setRange] = useState<[number, number]>([min, max]);

// Asegúrate de que min < max
<RangeSlider
  min={0}    // ✅ Correcto
  max={100}  // ✅ Correcto
  value={range}
  onChange={setRange}
/>

// ❌ Incorrecto - min > max causa problemas
<RangeSlider
  min={100}
  max={0}
  value={range}
  onChange={setRange}
/>
```

### Problema: Los valores no se actualizan

```tsx
// ✅ Bien - usar callback para manejar cambios
const [range, setRange] = useState<[number, number]>([20, 80]);

<RangeSlider
  value={range}
  onChange={setRange}
/>

// ✅ Bien - usar useEffect para efectos secundarios
useEffect(() => {
  console.log('Range changed:', range);
  // Aplicar filtros, etc.
}, [range]);

// ❌ Mal - modificar value directamente
<RangeSlider
  value={[20, 80]} // No cambiará
  onChange={(newRange) => {
    // No actualiza el componente
  }}
/>
```

### Problema: El componente no responde a cambios externos

```tsx
// ✅ Bien - el componente responde a cambios en value
const [externalRange, setExternalRange] = useState<[number, number]>([30, 70]);

// Cambiar externalRange actualizará el slider
<RangeSlider
  value={externalRange}
  onChange={setExternalRange}
/>

// ✅ Bien - reset button
<button
  onClick={() => setExternalRange([0, 100])}
>
  Reset
</button>
```

### Problema: Problemas de rendimiento con muchos cambios

```tsx
// ✅ Bien - debounce para cambios frecuentes
import { useCallback, useRef } from 'react';

const debouncedOnChange = useCallback(
  debounce((newRange: [number, number]) => {
    setRange(newRange);
    // Aplicar cambios costosos aquí
  }, 100),
  []
);

<RangeSlider
  value={range}
  onChange={debouncedOnChange}
/>

// ✅ Bien - usar useMemo para cálculos costosos
const processedData = useMemo(() => {
  return expensiveCalculation(range);
}, [range]);
```

### Problema: El slider se ve diferente en diferentes navegadores

```tsx
// El componente usa CSS personalizado para consistencia
// Si hay problemas de apariencia, verifica:

// 1. CSS custom properties están definidas
:root {
  --color-primary: #3b82f6;
  --color-neutral: #e5e7eb;
  --color-background: white;
}

// 2. No hay CSS global que interfiera
// 3. El componente está en un contenedor con box-sizing: border-box
```

## 📚 Ejemplos Completos

Para ver ejemplos completos de uso, revisa:

- `app/components/RangeSlider/page.tsx` - Showcase completo con diferentes configuraciones
- `app/components/FilterPanel/FilterPanel.tsx` - Uso en paneles de filtros
- `app/components/AudioControls/AudioControls.tsx` - Controles de audio avanzados

## 🤝 Contribución

Para contribuir al componente RangeSlider:

1. Mantén la API simple y consistente
2. Agrega nuevas funcionalidades manteniendo la accesibilidad
3. Incluye ejemplos de uso para nuevas características
4. Actualiza esta documentación cuando agregues nuevas funcionalidades
5. Asegura que el componente funcione en todos los navegadores modernos
6. Prueba el componente con diferentes rangos y valores edge case