/**
 * IndexedDB-based file storage for large blobs (posters, documents).
 * Supports files up to ~100 MB without localStorage quota issues.
 */

const DB_NAME = "iiitb_files";
const DB_VERSION = 1;
const STORE_NAME = "files";

interface FileRecord {
  id: string;
  name: string;
  type: string;
  data: ArrayBuffer;
  createdAt: number;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveFile(id: string, file: File): Promise<void> {
  const db = await openDB();
  const data = await file.arrayBuffer();
  const record: FileRecord = {
    id,
    name: file.name,
    type: file.type,
    data,
    createdAt: Date.now(),
  };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getFile(id: string): Promise<FileRecord | null> {
  if (!id) return null;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get(id);
    req.onsuccess = () => resolve((req.result as FileRecord) ?? null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteFile(id: string): Promise<void> {
  if (!id) return;
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function downloadFile(
  id: string,
  fallbackName: string,
): Promise<void> {
  const record = await getFile(id);
  if (!record) throw new Error("File not found");
  const blob = new Blob([record.data], {
    type: record.type || "application/octet-stream",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = record.name || fallbackName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function getFileObjectURL(id: string): Promise<string | null> {
  const record = await getFile(id);
  if (!record) return null;
  const blob = new Blob([record.data], {
    type: record.type || "application/octet-stream",
  });
  return URL.createObjectURL(blob);
}
