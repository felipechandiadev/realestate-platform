'use client'
import React, { useState } from 'react';
import Logo from './Logo';
import Link from 'next/link';

export default function LogoShowcase() {
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [selectedAspect, setSelectedAspect] = useState<'square' | 'wide' | 'tall'>('square');
  const [showError, setShowError] = useState(false);

  const sizeOptions = {
    small: { width: 64, height: 64 },
    medium: { width: 128, height: 128 },
    large: { width: 256, height: 256 },
  };

  const aspectOptions = {
    square: { w: 1, h: 1 },
    wide: { w: 2, h: 1 },
    tall: { w: 1, h: 2 },
  };

  const logoVariants = [
    { name: 'Default Logo', src: '/logo.svg', description: 'Logo principal de la aplicación' },
    { name: 'Secondary Logo', src: '/logo-secondary.svg', description: 'Logo secundario alternativo' },
    { name: 'Security Logo', src: '/SECURITY-LOGO.svg', description: 'Logo de seguridad' },
    { name: 'Error Logo', src: '/non-existent-logo.svg', description: 'Logo que no existe (fallback)' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/components" className="text-blue-600 hover:text-blue-800 mb-4 inline-block">
            ← Volver a Componentes
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Logo Component</h1>
          <p className="text-lg text-gray-600 max-w-3xl">
            Componente flexible para mostrar logos con soporte para diferentes
            aspectos, tamaños, manejo de errores y estados de carga.
            Incluye fallback automático cuando la imagen no se puede cargar.
          </p>
        </div>

        {/* Interactive Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Controles Interactivos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tamaño:</label>
              <select
                value={selectedSize}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSize(e.target.value as 'small' | 'medium' | 'large')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">Pequeño (64x64)</option>
                <option value="medium">Mediano (128x128)</option>
                <option value="large">Grande (256x256)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Aspecto:</label>
              <select
                value={selectedAspect}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedAspect(e.target.value as 'square' | 'wide' | 'tall')}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="square">Cuadrado (1:1)</option>
                <option value="wide">Ancho (2:1)</option>
                <option value="tall">Alto (1:2)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Estado:</label>
              <button
                onClick={() => setShowError(!showError)}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  showError
                    ? 'bg-red-600 text-white'
                    : 'bg-green-600 text-white'
                }`}
              >
                {showError ? 'Mostrar Error' : 'Mostrar Logo'}
              </button>
            </div>
          </div>
        </div>

        {/* Logo Variants Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Variantes de Logo</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {logoVariants.map((logo) => (
              <div key={logo.name} className="text-center p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex justify-center mb-4">
                  <Logo
                    src={showError && logo.src.includes('non-existent') ? logo.src : logo.src}
                    alt={logo.name}
                    width={sizeOptions[selectedSize].width}
                    height={sizeOptions[selectedSize].height}
                    aspect={aspectOptions[selectedAspect]}
                  />
                </div>
                <h3 className="font-medium text-gray-900 mb-2">{logo.name}</h3>
                <p className="text-sm text-gray-600">{logo.description}</p>
                <div className="text-xs text-gray-400 font-mono mt-2">{logo.src}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Size Examples Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ejemplos de Tamaños</h2>
          <div className="flex items-end justify-center gap-8 mb-6">
            <div className="text-center">
              <Logo
                width={64}
                height={64}
                aspect={{ w: 1, h: 1 }}
                className="mb-2"
              />
              <div className="text-sm text-gray-600">64x64</div>
              <div className="text-xs text-gray-400">Pequeño</div>
            </div>
            <div className="text-center">
              <Logo
                width={128}
                height={128}
                aspect={{ w: 1, h: 1 }}
                className="mb-2"
              />
              <div className="text-sm text-gray-600">128x128</div>
              <div className="text-xs text-gray-400">Mediano</div>
            </div>
            <div className="text-center">
              <Logo
                width={192}
                height={192}
                aspect={{ w: 1, h: 1 }}
                className="mb-2"
              />
              <div className="text-sm text-gray-600">192x192</div>
              <div className="text-xs text-gray-400">Grande</div>
            </div>
            <div className="text-center">
              <Logo
                width={256}
                height={256}
                aspect={{ w: 1, h: 1 }}
                className="mb-2"
              />
              <div className="text-sm text-gray-600">256x256</div>
              <div className="text-xs text-gray-400">Extra Grande</div>
            </div>
          </div>
        </div>

        {/* Aspect Ratio Examples Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Ejemplos de Aspectos</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">Cuadrado (1:1)</h3>
              <Logo
                width={150}
                height={150}
                aspect={{ w: 1, h: 1 }}
                className="border rounded"
              />
              <div className="text-sm text-gray-600 mt-2">aspect=&#123;w:1,h:1&#125;</div>
            </div>

            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">Ancho (2:1)</h3>
              <Logo
                width={200}
                height={100}
                aspect={{ w: 2, h: 1 }}
                className="border rounded"
              />
              <div className="text-sm text-gray-600 mt-2">aspect=&#123;w:2,h:1&#125;</div>
            </div>

            <div className="text-center">
              <h3 className="font-medium text-gray-700 mb-4">Alto (1:2)</h3>
              <Logo
                width={100}
                height={200}
                aspect={{ w: 1, h: 2 }}
                className="border rounded"
              />
              <div className="text-sm text-gray-600 mt-2">aspect=&#123;w:1,h:2&#125;</div>
            </div>
          </div>
        </div>

        {/* Error Handling Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Manejo de Errores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-700 mb-4">Logo con Error de Carga</h3>
              <div className="flex justify-center mb-4">
                <Logo
                  src="/non-existent-logo.svg"
                  alt="Logo con error"
                  width={150}
                  height={150}
                  aspect={{ w: 1, h: 1 }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Cuando la imagen no se puede cargar, el componente muestra
                automáticamente un placeholder con el texto &quot;Logo&quot;.
              </p>
            </div>

            <div>
              <h3 className="font-medium text-gray-700 mb-4">Logo Cargado Correctamente</h3>
              <div className="flex justify-center mb-4">
                <Logo
                  src="/logo.svg"
                  alt="Logo correcto"
                  width={150}
                  height={150}
                  aspect={{ w: 1, h: 1 }}
                />
              </div>
              <p className="text-sm text-gray-600">
                Cuando la imagen se carga correctamente, se muestra el logo
                original con object-contain para mantener las proporciones.
              </p>
            </div>
          </div>
        </div>

        {/* Common Use Cases Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Casos de Uso Comunes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Navegación y Headers</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Logo width={32} height={32} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo pequeño en navbar</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Logo width={48} height={48} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo mediano en header</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded">
                  <Logo width={64} height={64} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo grande en hero section</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Login y Autenticación</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <Logo width={120} height={120} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo grande en login form</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <Logo width={80} height={80} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo mediano en splash screen</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-blue-50 rounded">
                  <Logo width={180} height={180} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo extra grande en landing</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Footer y Branding</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <Logo width={40} height={40} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo pequeño en footer</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <Logo width={60} height={30} aspect={{ w: 2, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo ancho en branding</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded">
                  <Logo width={100} height={50} aspect={{ w: 2, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo horizontal en banner</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Mobile y Responsive</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                  <Logo width={36} height={36} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo compacto mobile</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                  <Logo width={72} height={72} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo tablet</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-purple-50 rounded">
                  <Logo width={96} height={96} aspect={{ w: 1, h: 1 }} />
                  <span className="text-sm text-gray-600">Logo desktop</span>
                </div>
              </div>
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
{`import Logo from './components/Logo/Logo';

function Header() {
  return (
    <header className="flex items-center gap-4">
      <Logo width={40} height={40} />
      <h1>Mi Aplicación</h1>
    </header>
  );
}`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Logo con Aspecto Personalizado</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<Logo
  src="/custom-logo.svg"
  alt="Logo personalizado"
  width={200}
  height={100}
  aspect={{ w: 2, h: 1 }}
  className="border rounded shadow"
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Logo Responsive</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`<Logo
  className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20"
  aspect={{ w: 1, h: 1 }}
/>`}
              </pre>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-3">Logo en Login Form</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
{`function LoginForm() {
  return (
    <div className="text-center">
      <Logo
        width={120}
        height={120}
        className="mb-6"
        alt="Logo de la aplicación"
      />
      <h2 className="text-2xl font-bold">Iniciar Sesión</h2>
      {/* Form fields */}
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
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">src</td>
                  <td className="px-4 py-2 text-sm text-gray-600">string</td>
                  <td className="px-4 py-2 text-sm text-gray-600">'/logo.svg'</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Ruta de la imagen del logo</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">alt</td>
                  <td className="px-4 py-2 text-sm text-gray-600">string</td>
                  <td className="px-4 py-2 text-sm text-gray-600">'Logo'</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Texto alternativo para accesibilidad</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">className</td>
                  <td className="px-4 py-2 text-sm text-gray-600">string</td>
                  <td className="px-4 py-2 text-sm text-gray-600">''</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Clases CSS adicionales</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">width</td>
                  <td className="px-4 py-2 text-sm text-gray-600">number</td>
                  <td className="px-4 py-2 text-sm text-gray-600">50</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Ancho del logo en píxeles</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">height</td>
                  <td className="px-4 py-2 text-sm text-gray-600">number</td>
                  <td className="px-4 py-2 text-sm text-gray-600">50</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Alto del logo en píxeles</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">aspect</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{'{w: number, h: number}'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{'{w: 1, h: 1}'}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Relación de aspecto del contenedor</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 text-sm font-mono text-blue-600">style</td>
                  <td className="px-4 py-2 text-sm text-gray-600">React.CSSProperties</td>
                  <td className="px-4 py-2 text-sm text-gray-600">undefined</td>
                  <td className="px-4 py-2 text-sm text-gray-600">Estilos CSS inline adicionales</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">🔧 Características Técnicas</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li><strong>Object-contain:</strong> Mantiene proporciones sin recortar</li>
                <li><strong>Overflow hidden:</strong> Contenedor con overflow controlado</li>
                <li><strong>Error handling:</strong> Fallback automático a placeholder</li>
                <li><strong>Aspect ratio:</strong> Soporte CSS para relaciones de aspecto</li>
                <li><strong>Responsive:</strong> Funciona con clases Tailwind responsive</li>
              </ul>
            </div>

            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="text-sm font-semibold text-green-800 mb-2">✨ Estados del Componente</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li><strong>Loading:</strong> No tiene estado de carga específico</li>
                <li><strong>Loaded:</strong> Imagen se muestra correctamente</li>
                <li><strong>Error:</strong> Placeholder con texto &quot;Logo&quot; cuando falla</li>
                <li><strong>Custom:</strong> Acepta cualquier src personalizado</li>
                <li><strong>Default:</strong> Usa /logo.svg si no se especifica src</li>
              </ul>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg">
              <h3 className="text-sm font-semibold text-purple-800 mb-2">🎯 Mejores Prácticas</h3>
              <ul className="text-sm text-purple-700 space-y-1">
                <li><strong>Alt text:</strong> Siempre proporcionar texto alternativo descriptivo</li>
                <li><strong>Aspect ratio:</strong> Definir aspecto correcto para evitar layout shift</li>
                <li><strong>Performance:</strong> Optimizar imágenes antes de usar</li>
                <li><strong>Fallback:</strong> El componente maneja errores automáticamente</li>
                <li><strong>Responsive:</strong> Usar clases CSS para diferentes tamaños de pantalla</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}