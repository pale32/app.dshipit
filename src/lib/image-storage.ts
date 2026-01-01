/**
 * IndexedDB-based image storage for edited product images
 * Used for temporary storage before pushing to selling channels
 */

const DB_NAME = 'dshipit_images';
const DB_VERSION = 1;
const STORE_NAME = 'edited_images';

interface StoredImage {
  id: string;           // Format: productId_imageIndex
  productId: string;
  imageIndex: number;
  blob: Blob;
  mimeType: string;
  updatedAt: number;
}

/**
 * Open IndexedDB connection
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('productId', 'productId', { unique: false });
        store.createIndex('updatedAt', 'updatedAt', { unique: false });
      }
    };
  });
}

/**
 * Save an edited image to IndexedDB
 * @param productId - The product ID
 * @param imageIndex - The index of the image in the product's image array
 * @param dataUrl - The base64 data URL of the edited image
 */
export async function saveEditedImage(
  productId: string,
  imageIndex: number,
  dataUrl: string
): Promise<void> {
  try {
    const db = await openDB();

    // Convert data URL to blob for efficient storage
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const id = `${productId}_${imageIndex}`;
    const storedImage: StoredImage = {
      id,
      productId,
      imageIndex,
      blob,
      mimeType: blob.type || 'image/png',
      updatedAt: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(storedImage);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error saving edited image:', error);
    throw error;
  }
}

/**
 * Get an edited image from IndexedDB
 * @param productId - The product ID
 * @param imageIndex - The index of the image
 * @returns The image as a data URL, or null if not found
 */
export async function getEditedImage(
  productId: string,
  imageIndex: number
): Promise<string | null> {
  try {
    const db = await openDB();
    const id = `${productId}_${imageIndex}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result as StoredImage | undefined;
        if (result) {
          // Convert blob back to data URL
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => reject(reader.error);
          reader.readAsDataURL(result.blob);
        } else {
          resolve(null);
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error getting edited image:', error);
    return null;
  }
}

/**
 * Get all edited images for a product
 * @param productId - The product ID
 * @returns Map of imageIndex to data URL
 */
export async function getAllEditedImagesForProduct(
  productId: string
): Promise<Map<number, string>> {
  try {
    const db = await openDB();
    const result = new Map<number, string>();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('productId');
      const request = index.openCursor(IDBKeyRange.only(productId));

      const blobPromises: Promise<void>[] = [];

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          const storedImage = cursor.value as StoredImage;
          const promise = new Promise<void>((res) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              result.set(storedImage.imageIndex, reader.result as string);
              res();
            };
            reader.onerror = () => res(); // Skip on error
            reader.readAsDataURL(storedImage.blob);
          });
          blobPromises.push(promise);
          cursor.continue();
        } else {
          // All cursors processed, wait for blob conversions
          Promise.all(blobPromises).then(() => resolve(result));
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error getting all edited images:', error);
    return new Map();
  }
}

/**
 * Delete an edited image from IndexedDB
 * @param productId - The product ID
 * @param imageIndex - The index of the image
 */
export async function deleteEditedImage(
  productId: string,
  imageIndex: number
): Promise<void> {
  try {
    const db = await openDB();
    const id = `${productId}_${imageIndex}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error deleting edited image:', error);
    throw error;
  }
}

/**
 * Delete all edited images for a product (call after pushing to store)
 * @param productId - The product ID
 */
export async function deleteAllEditedImagesForProduct(
  productId: string
): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('productId');
      const request = index.openCursor(IDBKeyRange.only(productId));

      request.onerror = () => reject(request.error);
      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error deleting all edited images for product:', error);
    throw error;
  }
}

/**
 * Check if an edited image exists for a product
 * @param productId - The product ID
 * @param imageIndex - The index of the image
 */
export async function hasEditedImage(
  productId: string,
  imageIndex: number
): Promise<boolean> {
  try {
    const db = await openDB();
    const id = `${productId}_${imageIndex}`;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count(IDBKeyRange.only(id));

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result > 0);

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error checking edited image:', error);
    return false;
  }
}

/**
 * Clear all edited images (for cleanup/logout)
 */
export async function clearAllEditedImages(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();

      transaction.oncomplete = () => db.close();
    });
  } catch (error) {
    console.error('Error clearing all edited images:', error);
    throw error;
  }
}
