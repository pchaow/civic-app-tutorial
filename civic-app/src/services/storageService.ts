import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a local File object to Cloud Storage for Firebase.
 * Falls back to FileReader base64 data URL if Firebase config is using demo/offline keys.
 */
export const uploadFileToFirebase = async (file: File, folder: string = 'complaints'): Promise<string> => {
  try {
    // Check if live Firebase storage bucket is available
    if (storage.app.options.storageBucket && !storage.app.options.storageBucket.includes('civicsolve-demo')) {
      const fileName = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
      const storageRef = ref(storage, `${folder}/${fileName}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    }
  } catch (err) {
    console.warn('Firebase Storage live upload fallback triggered:', err);
  }

  // Fallback: Convert File to base64 Data URL for instant local offline preview & testing
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};
