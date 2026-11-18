/** Textos que se le entregan al agente: cómo trabajar con la plataforma y cómo subir imágenes. */

export function resolveApiBaseUrl(req: { protocol?: string; get?: (h: string) => string | undefined }): string {
  const fromEnv = process.env.API_PUBLIC_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, '');
  const host = req.get?.('host') ?? 'TU_API';
  // En producción todo va por https, aunque el proxy no reenvíe el protocolo original.
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : (req.protocol ?? 'https');
  return `${protocol}://${host}`;
}

/** Instrucciones exactas para subir imágenes por HTTP directo (multipart). */
export function imageUploadInstructions(baseUrl: string, propertyId: string): string {
  const url = `${baseUrl}/properties/${propertyId}/multimedia`;
  return [
    `Las imágenes NO se envían por esta conexión MCP. Se suben con una petición HTTP directa desde donde tengas los archivos (terminal, intérprete de código o cliente HTTP).`,
    ``,
    `Petición:`,
    `  POST ${url}`,
    `  Header: Authorization: Bearer <la MISMA key rek_... con la que te conectaste a este MCP>`,
    `  Cuerpo: multipart/form-data, un campo "files" por cada archivo (repite el campo para varios).`,
    ``,
    `Ejemplo con curl (reemplaza la key y las rutas):`,
    `  curl -X POST "${url}" \\`,
    `    -H "Authorization: Bearer rek_TU_KEY" \\`,
    `    -F "files=@/ruta/foto1.jpg" -F "files=@/ruta/foto2.jpg"`,
    ``,
    `Ejemplo con Python:`,
    `  import requests`,
    `  requests.post("${url}", headers={"Authorization": "Bearer rek_TU_KEY"},`,
    `      files=[("files", open("/ruta/foto1.jpg", "rb")), ("files", open("/ruta/foto2.jpg", "rb"))])`,
    ``,
    `Reglas: máximo 10 imágenes por petición (puedes hacer varias), 10 MB por imagen (jpeg, png, webp, gif);`,
    `videos solo mp4 o webm hasta 70 MB. Respuesta 201 con los archivos subidos y sus URL.`,
    `La primera imagen queda como principal si la propiedad aún no tenía; para cambiarla usa set_main_image.`,
    `Si no tienes forma de ejecutar HTTP ni acceso a los archivos, dile al usuario que suba las fotos desde el backoffice y continúa con el resto.`,
    `Nunca pegues el contenido de una imagen (base64) en esta conversación.`,
  ].join('\n');
}

export const MCP_INSTRUCTIONS = [
  'Plataforma inmobiliaria: crea y edita propiedades en venta o arriendo.',
  'Flujo recomendado: get_catalogs (valores válidos) -> create_property -> subir imágenes por HTTP directo -> update_property / set_main_image -> get_property para revisar.',
  'Los valores inválidos se rechazan con un mensaje por campo; nada se corrige en silencio: lee el error y corrige. state y city deben ser nombres exactos del catálogo.',
  'Las imágenes se suben con una petición HTTP multipart directa, no por MCP: llama a get_image_upload_instructions con el id de la propiedad y sigue el comando que devuelve.',
  'PRE-APPROVED, PUBLISHED, CONTRACT-IN-PROGRESS, SOLD y RENTED exigen assignedAgentId (elige uno de get_catalogs > agents). Publicar (status PUBLISHED) solo funciona si tu key tiene el permiso properties:publish; si no, deja la propiedad en REQUEST o PRE-APPROVED. No puedes eliminar propiedades.',
].join('\n');
