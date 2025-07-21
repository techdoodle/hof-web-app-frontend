// Utility to realign a face image so the eyes are level
// imageData: base64 image string
// landmarks: array of {x, y} (left eye, right eye)
// tiltThreshold: degrees, default 5
export async function realignFaceImage(imageData: string, landmarks: {x: number, y: number}[], tiltThreshold = 5): Promise<string> {
  if (!landmarks || landmarks.length < 2) return imageData;
  const leftEye = landmarks[0];
  const rightEye = landmarks[1];
  const dx = rightEye.x - leftEye.x;
  const dy = rightEye.y - leftEye.y;
  const angle = Math.atan2(dy, dx); // radians
  const degrees = angle * (180 / Math.PI);
  if (Math.abs(degrees) <= tiltThreshold) return imageData;

  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCanvas.width = img.width;
      tempCanvas.height = img.height;
      if (tempCtx) {
        tempCtx.save();
        tempCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
        tempCtx.rotate(-angle); // negative to upright
        tempCtx.drawImage(img, -img.width / 2, -img.height / 2);
        tempCtx.restore();
        resolve(tempCanvas.toDataURL('image/jpeg', 0.8));
      } else {
        resolve(imageData);
      }
    };
    img.onerror = () => resolve(imageData);
    img.src = imageData;
  });
}

// Utility to crop face and neck region from an image
// imageData: base64 image string
// boundingBox: {x, y, width, height} of the face region
// expandFactor: how much to expand the crop around the face (default 1.5)
export async function cropFaceAndNeck(imageData: string, boundingBox: {x: number, y: number, width: number, height: number}, expandFactor = 1.5): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        resolve(imageData);
        return;
      }

      // Calculate expanded crop area
      const expandedWidth = boundingBox.width * expandFactor;
      const expandedHeight = boundingBox.height * expandFactor;
      const cropX = Math.max(0, boundingBox.x - (expandedWidth - boundingBox.width) / 2);
      const cropY = Math.max(0, boundingBox.y - (expandedHeight - boundingBox.height) / 2);
      const cropWidth = Math.min(expandedWidth, img.width - cropX);
      const cropHeight = Math.min(expandedHeight, img.height - cropY);

      // Set canvas size to crop dimensions
      canvas.width = cropWidth;
      canvas.height = cropHeight;

      // Draw the cropped region
      ctx.drawImage(
        img,
        cropX, cropY, cropWidth, cropHeight, // source rectangle
        0, 0, cropWidth, cropHeight // destination rectangle
      );

      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => resolve(imageData);
    img.src = imageData;
  });
} 