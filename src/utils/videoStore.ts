// Videos are too large for localStorage, so they are kept as blobs in IndexedDB.
const DB_NAME = 'spinners_videos';
const STORE = 'videos';

const open = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = async <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> => {
  const db = await open();
  return new Promise<T>((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const req = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(req.result); };
    tx.onerror = tx.onabort = () => { db.close(); reject(tx.error); };
  });
};

export const MAX_VIDEO_MB = 50;

export const saveVideo = (id: string, blob: Blob) => run('readwrite', s => s.put(blob, id));
export const getVideo = (id: string) => run<Blob | undefined>('readonly', s => s.get(id));
export const deleteVideo = (id: string) => run('readwrite', s => s.delete(id)).catch(() => undefined);
