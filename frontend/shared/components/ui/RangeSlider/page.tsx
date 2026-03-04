'use client'
import React, { useState } from 'react';
import RangeSlider from './RangeSlider';
import Link from 'next/link';

export default function RangeSliderShowcase() {
  const [priceRange, setPriceRange] = useState<[number, number]>([20000, 80000]);
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);
  const [ratingRange, setRatingRange] = useState<[number, number]>([3, 5]);
  const [distanceRange, setDistanceRange] = useState<[number, number]>([1, 25]);
  const [customRange, setCustomRange] = useState<[number, number]>([25, 75]);

  const [selectedExample, setSelectedExample] = useState<string>('price');

  const examples = [
    {
      id: 'price',
      title: 'Rango de Precios',
      description: 'Filtrar productos por rango de precio',
      min: 0,
      max: 100000,
      value: priceRange,
      onChange: setPriceRange,
      unit: '$',
      step: 1000,
    },
    {
      id: 'age',
      title: 'Rango de Edad',
      description: 'Seleccionar rango etario para encuestas',
      min: 0,
      max: 100,
      value: ageRange,
      onChange: setAgeRange,
      unit: 'años',
      step: 1,
    },
    {
      id: 'rating',
      title: 'Rango de Calificación',
      description: 'Filtrar reseñas por estrellas',
      min: 1,
      max: 5,
      value: ratingRange,
      onChange: setRatingRange,
      unit: '★',
      step: 0.5,
    },
    {
      id: 'distance',
      title: 'Rango de Distancia',
      description: 'Buscar lugares dentro de un radio',
      min: 0,
      max: 50,
      value: distanceRange,
      onChange: setDistanceRange,
      unit: 'km',
      step: 1,
    },
  ];

  const currentExample = examples.find(ex => ex.id === selectedExample) || examples[0];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/components" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a Componentes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">RangeSlider Component</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Componente de slider de rango doble que permite seleccionar un intervalo
            de valores con dos controles deslizantes. Ideal para filtros de búsqueda,
            configuraciones de rango y selección de intervalos.
          </p>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Demo Interactivo</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ejemplo:</label>
            <select
              value={selectedExample}
              onChange={(e) => setSelectedExample(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {examples.map((example) => (
                <option key={example.id} value={example.id}>
                  {example.title}
                </option>
              ))}
            </select>
          </div>

          <div className="max-w-2xl">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{currentExample.title}</h3>
              <p className="text-gray-600 mb-6">{currentExample.description}</p>

              <div className="space-y-4">
                <RangeSlider
                  min={currentExample.min}
                  max={currentExample.max}
                  value={currentExample.value}
                  onChange={currentExample.onChange}
                />

                <div className="flex justify-between items-center p-4 bg-white rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {currentExample.unit}{currentExample.value[0]}
                    </div>
                    <div className="text-sm text-gray-500">Valor Mínimo</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {currentExample.unit}{currentExample.value[1]}
                    </div>
                    <div className="text-sm text-gray-500">Valor Máximo</div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-lg font-medium text-gray-700">
                    Rango Seleccionado: {currentExample.unit}{currentExample.value[0]} - {currentExample.unit}{currentExample.value[1]}
                  </div>
                  <div className="text-sm text-gray-500">
                    Diferencia: {currentExample.unit}{currentExample.value[1] - currentExample.value[0]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* All Examples Grid */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ejemplos de Casos de Uso</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {examples.map((example) => (
              <div key={example.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <h3 className="font-semibold text-gray-800 mb-2">{example.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{example.description}</p>

                <RangeSlider
                  min={example.min}
                  max={example.max}
                  value={example.value}
                  onChange={example.onChange}
                />

                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>{example.unit}{example.value[0]}</span>
                  <span>{example.unit}{example.value[1]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Range Demo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Rango Personalizado</h2>
          <div className="max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rango: 0 - 100
                </label>
                <RangeSlider
                  min={0}
                  max={100}
                  value={customRange}
                  onChange={setCustomRange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{customRange[0]}</div>
                  <div className="text-sm text-blue-700">Valor Mínimo</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">{customRange[1]}</div>
                  <div className="text-sm text-purple-700">Valor Máximo</div>
                </div>
              </div>

              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-lg font-medium text-green-800">
                  Rango Seleccionado: {customRange[0]} - {customRange[1]}
                </div>
                <div className="text-sm text-green-700">
                  Ancho del rango: {customRange[1] - customRange[0]} unidades
                </div>
                <div className="text-sm text-green-700">
                  Porcentaje del rango total: {Math.round(((customRange[1] - customRange[0]) / 100) * 100)}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Feedback Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Retroalimentación Visual</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Rango Estrecho</h3>
              <RangeSlider min={0} max={100} value={[40, 60]} />
              <p className="text-sm text-gray-600 mt-2">
                Rango pequeño: 40-60 (20 unidades de diferencia)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Rango Amplio</h3>
              <RangeSlider min={0} max={100} value={[10, 90]} />
              <p className="text-sm text-gray-600 mt-2">
                Rango grande: 10-90 (80 unidades de diferencia)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Rango en Extremos</h3>
              <RangeSlider min={0} max={100} value={[0, 100]} />
              <p className="text-sm text-gray-600 mt-2">
                Rango completo: 0-100 (rango total seleccionado)
              </p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">Rango Mínimo</h3>
              <RangeSlider min={0} max={100} value={[50, 50]} />
              <p className="text-sm text-gray-600 mt-2">
                Rango mínimo: 50-50 (ambos valores iguales)
              </p>
            </div>
          </div>
        </div>

        {/* Features Overview Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Características del Componente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Funcionalidades Principales</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Slider de rango doble con dos thumbs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Interacción por mouse (drag & drop)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Validación automática de límites</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Prevención de cruce entre thumbs</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Visualización de valores en tiempo real</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>Accesibilidad con ARIA labels</span>
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Casos de Uso</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">💰</span>
                  <span>Filtros de precio en e-commerce</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">📅</span>
                  <span>Selección de rangos de fechas</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">📍</span>
                  <span>Filtros de distancia y ubicación</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">⭐</span>
                  <span>Rangos de calificaciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">📊</span>
                  <span>Configuración de parámetros</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">🎚️</span>
                  <span>Controles de audio y video</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Usage Examples Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ejemplos de Uso</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Uso Básico</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`import RangeSlider from './components/RangeSlider/RangeSlider';

function PriceFilter() {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);

  return (
    <RangeSlider
      min={0}
      max={1000}
      value={priceRange}
      onChange={setPriceRange}
    />
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Filtro de Productos</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`function ProductFilters({ onFilterChange }) {
  const [filters, setFilters] = useState({
    price: [0, 1000],
    rating: [1, 5],
    distance: [0, 50]
  });

  const updateFilter = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Precio: $\{filters.price[0]} - $\{filters.price[1]}</label>
        <RangeSlider
          min={0}
          max={1000}
          value={filters.price}
          onChange={(value) => updateFilter('price', value)}
        />
      </div>

      <div>
        <label>Calificación: \{filters.rating[0]} - \{filters.rating[1]} estrellas</label>
        <RangeSlider
          min={1}
          max={5}
          value={filters.rating}
          onChange={(value) => updateFilter('rating', value)}
        />
      </div>
    </div>
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Control de Audio</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`function AudioControls() {
  const [volume, setVolume] = useState<[number, number]>([20, 80]);
  const [frequency, setFrequency] = useState<[number, number]>([200, 8000]);

  return (
    <div className="space-y-4">
      <div>
        <label>Rango de Volumen: {volume[0]}% - {volume[1]}%</label>
        <RangeSlider
          min={0}
          max={100}
          value={volume}
          onChange={setVolume}
        />
      </div>

      <div>
        <label>Frecuencia: {frequency[0]}Hz - {frequency[1]}Hz</label>
        <RangeSlider
          min={20}
          max={20000}
          value={frequency}
          onChange={setFrequency}
        />
      </div>
    </div>
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Selector de Edad</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`function AgeSelector({ onAgeRangeChange }) {
  const [ageRange, setAgeRange] = useState<[number, number]>([18, 65]);

  const handleChange = (range) => {
    setAgeRange(range);
    onAgeRangeChange(range);
  };

  return (
    <div>
      <h3>Rango de Edad: {ageRange[0]} - {ageRange[1]} años</h3>
      <RangeSlider
        min={0}
        max={100}
        value={ageRange}
        onChange={handleChange}
      />
      <p className="text-sm text-gray-600 mt-2">
        Selecciona el rango de edad para tu público objetivo
      </p>
    </div>
  );
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Props Reference Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Referencia de Props</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Prop</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Tipo</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Por defecto</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold text-gray-700">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">min</td>
                  <td className="px-4 py-2 text-sm text-gray-600">number</td>
                  <td className="px-4 py-2 text-sm text-gray-600">0</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Valor mínimo del rango</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">max</td>
                  <td className="px-4 py-2 text-sm text-gray-600">number</td>
                  <td className="px-4 py-2 text-sm text-gray-600">100</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Valor máximo del rango</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">value</td>
                  <td className="px-4 py-2 text-sm text-gray-600">[number, number]</td>
                  <td className="px-4 py-2 text-sm text-gray-600">[min, max]</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Valor actual del rango [minValue, maxValue]</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">onChange</td>
                  <td className="px-4 py-2 text-sm text-gray-600">(values: [number, number]) =&gt; void</td>
                  <td className="px-4 py-2 text-sm text-gray-600">undefined</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Callback llamado cuando cambian los valores</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Características Técnicas</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Event handling:</strong> Mouse events para drag & drop</li>
                <li><strong>Boundary validation:</strong> Los thumbs no pueden cruzarse</li>
                <li><strong>Percentage calculation:</strong> Conversión automática a porcentajes</li>
                <li><strong>CSS variables:</strong> Usa variables CSS para colores (--color-neutral, --color-primary)</li>
                <li><strong>Accessibility:</strong> ARIA labels en thumbs</li>
                <li><strong>Focus management:</strong> Soporte para navegación por teclado</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">✨ Estados y Comportamiento</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li><strong>Idle:</strong> Estado normal, thumbs posicionados según valor</li>
                <li><strong>Dragging min:</strong> Usuario arrastrando el thumb izquierdo</li>
                <li><strong>Dragging max:</strong> Usuario arrastrando el thumb derecho</li>
                <li><strong>Constrained:</strong> Los thumbs se mantienen dentro de límites</li>
                <li><strong>Real-time updates:</strong> Los valores se actualizan durante el drag</li>
                <li><strong>Callback on release:</strong> onChange se llama al soltar el mouse</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-800 mb-2">🎯 Mejores Prácticas</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li><strong>Valores iniciales:</strong> Proporcionar valores por defecto significativos</li>
                <li><strong>Límites lógicos:</strong> Definir min/max según el contexto de uso</li>
                <li><strong>Feedback visual:</strong> Mostrar los valores seleccionados claramente</li>
                <li><strong>Performance:</strong> Evitar re-renders excesivos en onChange</li>
                <li><strong>Accesibilidad:</strong> Asegurar que los thumbs sean focusables</li>
                <li><strong>Validación:</strong> Validar rangos en el componente padre si es necesario</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}