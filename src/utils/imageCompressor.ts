/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utility untuk kompresi berkas foto kegiatan secara client-side sebelum disimpan ke LocalStorage
 * Mengubah resolusi maksimal ke 1024x1024px dan kualitas JPEG 0.75-0.8
 * Menghasilkan data URL ~50KB - 120KB per foto sehingga aman dan tidak memicu LocalStorage Quota Exceeded
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1024,
  maxHeight = 1024,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Berkas bukan merupakan format gambar yang valid.'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (event) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        try {
          let { width, height } = img;

          // Hitung rasio resolusi proporsional
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(event.target?.result as string);
            return;
          }

          // Bersihkan canvas dan gambar ulang dengan smoothing optimal
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, width, height);

          // Hasilkan Base64 JPEG dengan kompresi terarah
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } catch (e) {
          // Fallback ke string asli jika canvas gagal
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
