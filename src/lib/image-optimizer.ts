/**
 * Convierte y optimiza cualquier archivo de imagen (JPG, PNG, HEIC, etc.) a formato .webp
 * directamente en el navegador del usuario utilizando HTML5 Canvas.
 */
export async function convertToWebP(
  file: File,
  maxWidth = 1200,
  maxHeight = 1200,
  quality = 0.82
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Mantener proporción de aspecto ajustando límites máximos
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("No se pudo inicializar el contexto 2D del Canvas"));
          return;
        }

        // Fondo blanco para imágenes transparentes que se convierten a WebP
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, width, height);

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Error al convertir la imagen a WebP"));
              return;
            }

            const cleanFileName = file.name
              .replace(/\.[^/.]+$/, "")
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "-") + ".webp";

            const webpFile = new File([blob], cleanFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });

            resolve(webpFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        reject(new Error("Error al cargar el archivo de imagen"));
      };

      img.src = event.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Error al leer el archivo fuente"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Convierte un File a Data URL base64 para previsualización inmediata.
 */
export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
