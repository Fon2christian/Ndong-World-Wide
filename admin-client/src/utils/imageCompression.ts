// Compress image to reduce file size while maintaining good quality
export async function compressImage(
  file: File,
  maxWidth: number = 1200,
  maxHeight: number = 1200,
  quality: number = 0.8
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let { width, height } = img;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Use better image smoothing for quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Preserve PNG transparency by checking file type
        const isPNG = file.type === 'image/png';
        const mimeType = isPNG ? 'image/png' : 'image/jpeg';
        const outputQuality = isPNG ? 1.0 : quality; // PNG doesn't use quality parameter

        // Convert to base64 with compression
        const compressedBase64 = canvas.toDataURL(mimeType, outputQuality);
        resolve(compressedBase64);
      };
      img.onerror = () => reject(new Error("Failed to load image"));
      img.src = event.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

// Compress multiple images with graceful failure handling
export async function compressImages(files: File[]): Promise<string[]> {
  const results = await Promise.allSettled(files.map((file) => compressImage(file)));

  // Extract successful compressions and log failures
  const compressed: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      compressed.push(result.value);
    } else {
      console.error(`Failed to compress file ${files[index].name}:`, result.reason);
    }
  });

  // If all failed, throw an error
  if (compressed.length === 0 && files.length > 0) {
    throw new Error('Failed to compress any images');
  }

  return compressed;
}
