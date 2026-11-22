/**
 * Client-Side Image Compression & Sanitization Utility
 * Resizes large images and exports to lightweight, sanitized WebP / JPEG.
 * Reduces 5MB+ camera/screenshot images down to ~50KB-120KB.
 */
export async function compressAndSanitizeImage(
  fileOrBlob: File | Blob,
  maxDimension = 1280,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image for compression"));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }

        // Clean white background for transparent PNGs converted to JPEG/WebP
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Try WebP first for optimal compression, fallback to JPEG
        try {
          const webpData = canvas.toDataURL("image/webp", quality);
          if (webpData.startsWith("data:image/webp")) {
            resolve(webpData);
            return;
          }
        } catch {
          // fallback
        }

        const jpegData = canvas.toDataURL("image/jpeg", quality);
        resolve(jpegData);
      };

      img.src = reader.result as string;
    };

    reader.readAsDataURL(fileOrBlob);
  });
}
