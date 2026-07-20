"use client";

export default function TestColors() {
  const colors = [
    { name: 'primary', classes: 'bg-primary text-white' },
    { name: 'secondary', classes: 'bg-secondary text-white' },
    { name: 'accent', classes: 'bg-accent text-white' },
    { name: 'neutral', classes: 'bg-neutral text-white' },
    { name: 'base-100', classes: 'bg-base-100 text-base-content' },
    { name: 'base-200', classes: 'bg-base-200 text-base-content' },
    { name: 'base-300', classes: 'bg-base-300 text-base-content' },
    { name: 'info', classes: 'bg-info text-info-content' },
    { name: 'success', classes: 'bg-success text-success-content' },
    { name: 'warning', classes: 'bg-warning text-warning-content' },
    { name: 'error', classes: 'bg-error text-error-content' },
  ];

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Color Palette Test</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {colors.map((color) => (
          <div key={color.name} className={`p-4 rounded-lg ${color.classes}`}>
            <h2 className="text-lg font-semibold">{color.name}</h2>
            <p className="text-sm opacity-80">This is {color.name} color</p>
          </div>
        ))}
      </div>
    </div>
  );
}