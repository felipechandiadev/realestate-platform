/**
 * Sube un archivo directo a la API con XMLHttpRequest para conocer el progreso
 * (fetch y las server actions no lo informan).
 */
export function uploadFileWithProgress({
  url,
  token,
  file,
  fieldName = 'files',
  onProgress,
}: {
  url: string;
  token: string;
  file: File;
  fieldName?: string;
  onProgress: (percent: number) => void;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const body = new FormData();
    body.append(fieldName, file);

    xhr.open('POST', url);
    xhr.setRequestHeader('Authorization', `Bearer ${token}`);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress((event.loaded / event.total) * 100);
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }
      reject(new Error(readErrorMessage(xhr)));
    };
    xhr.onerror = () => reject(new Error('Sin conexión con el servidor'));
    xhr.ontimeout = () => reject(new Error('La subida tardó demasiado'));

    xhr.send(body);
  });
}

function readErrorMessage(xhr: XMLHttpRequest): string {
  if (xhr.status === 413) return 'El archivo supera el tamaño permitido por el servidor';
  try {
    const parsed = JSON.parse(xhr.responseText) as { message?: string | string[] };
    const message = Array.isArray(parsed.message) ? parsed.message.join('. ') : parsed.message;
    if (message) return message;
  } catch {
    // respuesta no JSON
  }
  return `Error ${xhr.status} al subir el archivo`;
}
