const STORE_NAME = 'files';
const DB_VERSION = 1;

/** Returns a DB name scoped by admin user id (or 'global' for shared/researcher view). */
function getDbName(scope: string): string {
  return scope === 'global' ? 'medical-platform-admin-files' : `medical-platform-admin-files-${scope}`;
}

const openDatabase = (adminUserId: string): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(getDbName(adminUserId), DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Save a file blob. Uses adminUserId so each admin's files are stored separately.
 */
export const saveFileBlob = async (adminUserId: string, id: string, blob: Blob) => {
  const db = await openDatabase(adminUserId);
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(blob, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
};

/**
 * Get a file blob. Uses adminUserId to read from that admin's store only.
 */
export const getFileBlob = async (adminUserId: string, id: string): Promise<Blob | null> => {
  try {
    const db = await openDatabase(adminUserId);
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => resolve((request.result as Blob) || null);
      request.onerror = () => reject(request.error);
    });
    db.close();
    return blob;
  } catch {
    return null;
  }
};

/**
 * Delete a file blob. Uses adminUserId so only that admin's store is modified.
 */
export const deleteFileBlob = async (adminUserId: string, id: string) => {
  try {
    const db = await openDatabase(adminUserId);
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      tx.objectStore(STORE_NAME).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // Ignore delete errors (ex: storage not available)
  }
};
