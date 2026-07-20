# NumberStepper Component

Un componente de stepper numérico con botones de incremento/decremento y validaciones HTML.

## Características

- ✅ Input numérico con botones de + y -
- ✅ Soporte para enteros y decimales
- ✅ Validaciones HTML (min, max, required)
- ✅ Valores negativos opcionales
- ✅ Estilos consistentes con TextField
- ✅ Accesibilidad completa

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `label` | `string` | - | Etiqueta del campo (requerido) |
| `value` | `number` | - | Valor actual (requerido) |
| `onChange` | `(value: number) => void` | - | Función llamada cuando cambia el valor (requerido) |
| `step` | `number` | `1` | Incremento/decremento |
| `min` | `number` | - | Valor mínimo permitido |
| `max` | `number` | - | Valor máximo permitido |
| `required` | `boolean` | `false` | Campo obligatorio |
| `allowNegative` | `boolean` | `true` | Permitir valores negativos |
| `allowFloat` | `boolean` | `false` | Permitir números decimales |
| `placeholder` | `string` | - | Placeholder del input |
| `className` | `string` | `""` | Clases CSS adicionales |
| `disabled` | `boolean` | `false` | Deshabilitar el componente |
| `data-test-id` | `string` | - | ID para testing |

## Ejemplos de uso

### Enteros básicos
```tsx
<NumberStepper
  label="Cantidad"
  value={quantity}
  onChange={setQuantity}
  step={1}
  min={0}
  max={100}
/>
```

### Decimales
```tsx
<NumberStepper
  label="Precio"
  value={price}
  onChange={setPrice}
  step={0.5}
  min={0}
  max={1000}
  allowFloat={true}
/>
```

### Con negativos
```tsx
<NumberStepper
  label="Temperatura"
  value={temperature}
  onChange={setTemperature}
  step={1}
  min={-50}
  max={50}
  allowNegative={true}
/>
```

### Campo requerido
```tsx
<NumberStepper
  label="Edad"
  value={age}
  onChange={setAge}
  step={1}
  min={0}
  max={120}
  required={true}
/>
```

## Validaciones

- **HTML5**: Utiliza validaciones nativas del navegador (min, max, required)
- **Límites**: Respeta automáticamente los valores min/max
- **Tipo**: Redondea automáticamente si `allowFloat={false}`
- **Negativos**: Bloquea valores negativos si `allowNegative={false}`

## Estilos

El componente utiliza los mismos estilos base que `TextField` para mantener consistencia visual:

- Bordes redondeados
- Estados de foco con anillos azules
- Estados deshabilitados
- Transiciones suaves
- Etiquetas con indicador de requerido (*)