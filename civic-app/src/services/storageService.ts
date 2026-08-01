import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Resizes and compresses an image File using HTML5 Canvas.
 * Converts heavy camera photos (5-10MB) into lightweight WebP/JPEG images (~50-150KB).
 */
export const compressImage = (file: File, maxWidth: number = 1024, quality: number = 0.75): Promise<File> => {
  return new Promise((resolve) => {
    // If file is not an image, return original
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const image = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      image.src = e.target?.result as string;
    };

    image.onload = () => {
      const canvas = document.createElement('canvas');
      let width = image.width;
      let height = image.height;

      // Calculate aspect ratio scaling
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, width, height);
      }

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            return resolve(file);
          }
          const compressedFile = new File([blob], `${file.name.replace(/\.[^/.]+$/, '')}.webp`, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        },
        'image/webp',
        quality
      );
    };

    image.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a local File object to Cloud Storage for Firebase with automatic compression.
 */
export const uploadFileToFirebase = async (file: File, folder: string = 'complaints'): Promise<string> => {
  // Compress image before uploading to save up to 90% cloud storage space
  const compressedFile = await compressImage(file, 1024, 0.75);

  try {
    if (storage.app.options.storageBucket && !storage.app.options.storageBucket.includes('civicsolve-demo')) {
      const fileName = `${Date.now()}_${compressedFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, compressedFile);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }
  } catch (err) {
    console.warn('Firebase Storage live upload fallback triggered:', err);
  }

  // Fallback: Convert File to base64 Data URL for offline preview & testing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(compressedFile);
  });
};
