/**
 * Serializa datos estructurados (JSON-LD) para incrustarlos en un <script>.
 *
 * JSON.stringify no escapa `<`: un texto con `</script>` (p. ej. el título de
 * una propiedad enviada desde el formulario público) cerraría la etiqueta y
 * permitiría ejecutar código en el portal. Se escapan `<`, `>`, `&` y los
 * separadores de línea U+2028/U+2029; el JSON resultante es equivalente.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
