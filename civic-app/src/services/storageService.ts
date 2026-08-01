/**
 * Resizes and compresses an image File using HTML5 Canvas.
 * Converts heavy camera photos (5-10MB) into lightweight WebP images (~50-100KB).
 */
export const compressImage = (file: File, maxWidth: number = 800, quality: number = 0.70): Promise<string> => {
  return new Promise((resolve, reject) => {
    // If file is not an image, resolve empty
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
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

      // Calculate aspect ratio scaling (max 800px width for compact storage)
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

      // Convert Canvas to compact WebP Base64 Data URL
      const dataUrl = canvas.toDataURL('image/webp', quality);
      resolve(dataUrl);
    };

    image.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a local File object by converting it into a lightweight WebP Base64 Data URL.
 * Saved directly inside Firestore documents (100% free, 0 CORS configuration required).
 */
export const uploadFileToFirebase = async (file: File, _folder: string = 'complaints'): Promise<string> => {
  // Compress image to lightweight WebP Base64 Data URL (~50-100KB)
  const base64Url = await compressImage(file, 800, 0.70);
  return base64Url;
};
