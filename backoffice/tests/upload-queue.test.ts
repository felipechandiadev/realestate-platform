import { describe, it, expect, jest } from '@jest/globals';
import {
  createQueueItems,
  runUploadQueue,
  summarizeQueue,
  type UploadQueueItem,
  type UploadOne,
} from '../src/features/properties/upload/upload-queue';
import { uploadFileWithProgress } from '../src/features/properties/upload/upload-file-xhr';

const file = (name: string, type = 'image/jpeg') => new File(['x'], name, { type });

describe('runUploadQueue', () => {
  it('sube de a uno, en orden, y reporta progreso y estado de cada archivo', async () => {
    const order: string[] = [];
    let concurrent = 0;
    let maxConcurrent = 0;
    const uploadOne: UploadOne = async (f, onProgress) => {
      concurrent += 1;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      order.push(f.name);
      onProgress(50);
      onProgress(100);
      await Promise.resolve();
      concurrent -= 1;
    };
    const updates: UploadQueueItem[] = [];

    const items = createQueueItems([file('a.jpg'), file('b.mp4', 'video/mp4')]);
    const result = await runUploadQueue(items, uploadOne, (item) => updates.push(item));

    expect(order).toEqual(['a.jpg', 'b.mp4']);
    expect(maxConcurrent).toBe(1);
    expect(result.map((i) => i.status)).toEqual(['done', 'done']);
    expect(result.every((i) => i.progress === 100)).toBe(true);

    const first = updates.filter((u) => u.id === items[0].id).map((u) => [u.status, u.progress]);
    // El 100 % solo llega cuando el servidor responde.
    expect(first).toEqual([
      ['uploading', 0],
      ['uploading', 50],
      ['uploading', 99],
      ['done', 100],
    ]);
  });

  it('un archivo con error no detiene la cola', async () => {
    const uploadOne: UploadOne = async (f) => {
      if (f.name === 'malo.mov') throw new Error('Formato de video no compatible');
    };

    const result = await runUploadQueue(
      createQueueItems([file('malo.mov', 'video/quicktime'), file('bueno.jpg')]),
      uploadOne,
      () => {},
    );

    expect(result[0]).toMatchObject({ status: 'error', error: 'Formato de video no compatible' });
    expect(result[1].status).toBe('done');
  });

  it('al reintentar sube solo los que fallaron', async () => {
    const uploadOne = jest.fn<UploadOne>(async () => {});
    const items: UploadQueueItem[] = createQueueItems([file('ok.jpg'), file('fallo.jpg')]);
    items[0] = { ...items[0], status: 'done', progress: 100 };
    items[1] = { ...items[1], status: 'error', error: 'x' };

    const result = await runUploadQueue(items, uploadOne, () => {});

    expect(uploadOne).toHaveBeenCalledTimes(1);
    expect(uploadOne.mock.calls[0][0].name).toBe('fallo.jpg');
    expect(result[1]).toMatchObject({ status: 'done', error: undefined });
  });
});

describe('summarizeQueue', () => {
  it('cuenta subidos, fallidos y si sigue activa', () => {
    const items = createQueueItems([file('a.jpg'), file('b.jpg'), file('c.jpg')]);
    expect(summarizeQueue(items)).toMatchObject({ total: 3, active: true, finished: false });

    items[0].status = 'done';
    items[1].status = 'error';
    items[2].status = 'done';
    expect(summarizeQueue(items)).toEqual({ total: 3, done: 2, failed: 1, active: false, finished: true });
    expect(summarizeQueue([]).finished).toBe(false);
  });
});

describe('uploadFileWithProgress', () => {
  type FakeXhr = {
    status: number;
    responseText: string;
    upload: { onprogress?: (e: { lengthComputable: boolean; loaded: number; total: number }) => void };
    onload?: () => void;
    onerror?: () => void;
    headers: Record<string, string>;
    body?: FormData;
    open: jest.Mock;
    setRequestHeader: (k: string, v: string) => void;
    send: (body: FormData) => void;
  };

  const installXhr = (respond: (xhr: FakeXhr) => void) => {
    const created: FakeXhr[] = [];
    (globalThis as unknown as { XMLHttpRequest: unknown }).XMLHttpRequest = jest.fn(() => {
      const xhr: FakeXhr = {
        status: 0,
        responseText: '',
        upload: {},
        headers: {},
        open: jest.fn(),
        setRequestHeader(k, v) {
          this.headers[k] = v;
        },
        send(body) {
          this.body = body;
          respond(this);
        },
      };
      created.push(xhr);
      return xhr;
    });
    return created;
  };

  it('envía el archivo con el token e informa el progreso', async () => {
    const created = installXhr((xhr) => {
      xhr.upload.onprogress?.({ lengthComputable: true, loaded: 25, total: 100 });
      xhr.status = 201;
      xhr.onload?.();
    });
    const onProgress = jest.fn();

    await uploadFileWithProgress({ url: 'http://api/p/1/multimedia', token: 'tok', file: file('a.jpg'), onProgress });

    expect(created[0].open).toHaveBeenCalledWith('POST', 'http://api/p/1/multimedia');
    expect(created[0].headers.Authorization).toBe('Bearer tok');
    expect((created[0].body?.get('files') as File).name).toBe('a.jpg');
    expect(onProgress).toHaveBeenCalledWith(25);
  });

  it('rechaza con el mensaje del servidor o uno claro para 413', async () => {
    installXhr((xhr) => {
      xhr.status = 400;
      xhr.responseText = JSON.stringify({ message: 'Formato de video no compatible' });
      xhr.onload?.();
    });
    await expect(
      uploadFileWithProgress({ url: 'u', token: 't', file: file('a.mov'), onProgress: () => {} }),
    ).rejects.toThrow('Formato de video no compatible');

    installXhr((xhr) => {
      xhr.status = 413;
      xhr.responseText = '<html>';
      xhr.onload?.();
    });
    await expect(
      uploadFileWithProgress({ url: 'u', token: 't', file: file('a.mp4'), onProgress: () => {} }),
    ).rejects.toThrow('El archivo supera el tamaño permitido por el servidor');
  });
});
