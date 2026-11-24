/**
 * Utilitário de Compressão de Imagens no Cliente via Canvas HTML5
 * Otimizado para tablets, smartphones e captura direta de câmera em auditorias.
 */

export const compressImage = (file, maxWidth = 1200, maxHeight = 1200, quality = 0.75) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof Blob)) {
      return reject(new Error('Arquivo inválido para compressão.'));
    }

    const reader = new FileReader();
    reader.onerror = (err) => reject(err);
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = (err) => reject(err);
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calcula proporções mantendo aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: e.target.result,
            sizeBytes: file.size,
            width: img.width,
            height: img.height
          });
        }

        // Desenha imagem redimensionada
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Exporta como JPEG otimizado
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        const approxSizeBytes = Math.round((dataUrl.length * 3) / 4);

        resolve({
          dataUrl,
          sizeBytes: approxSizeBytes,
          width,
          height
        });
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
};

