import { FaceMesh } from '@mediapipe/face_mesh';

export interface MediaPipeFaceResult {
  success: boolean;
  faceImageUrl?: string;
  confidence: number;
  landmarks?: Array<{x: number, y: number, z?: number}>;
  error?: string;
}

export class MediaPipeFaceExtractor {
  private static instance: MediaPipeFaceExtractor;
  private faceMesh: FaceMesh | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): MediaPipeFaceExtractor {
    if (!MediaPipeFaceExtractor.instance) {
      MediaPipeFaceExtractor.instance = new MediaPipeFaceExtractor();
    }
    return MediaPipeFaceExtractor.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.faceMesh = new FaceMesh({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.8,
        minTrackingConfidence: 0.8,
      });

      this.isInitialized = true;
      console.log('MediaPipe Face Mesh initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Face Mesh:', error);
      throw error;
    }
  }

  async extractFace(imageData: string): Promise<MediaPipeFaceResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        try {
          if (!this.faceMesh) {
            resolve({
              success: false,
              confidence: 0,
              error: 'Face mesh not initialized'
            });
            return;
          }

          // Process the image with MediaPipe
          this.faceMesh.onResults((results: any) => {
            if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
              const landmarks = results.multiFaceLandmarks[0];
              const extractedFace = this.cropFaceFromLandmarks(img, landmarks);
              
              resolve({
                success: true,
                faceImageUrl: extractedFace,
                confidence: 0.9, // MediaPipe doesn't provide confidence, so we use a high value
                landmarks: landmarks.map((point: any) => ({
                  x: point.x * img.width,
                  y: point.y * img.height,
                  z: point.z
                }))
              });
            } else {
              resolve({
                success: false,
                confidence: 0,
                error: 'No face detected'
              });
            }
          });

          // Send image to MediaPipe
          await this.faceMesh.send({ image: img });
        } catch (error) {
          resolve({
            success: false,
            confidence: 0,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      };

      img.onerror = () => {
        resolve({
          success: false,
          confidence: 0,
          error: 'Failed to load image'
        });
      };

      img.src = imageData;
    });
  }

  private cropFaceFromLandmarks(img: HTMLImageElement, landmarks: any[]): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Convert normalized coordinates to pixel coordinates
    const points = landmarks.map(point => ({
      x: point.x * img.width,
      y: point.y * img.height
    }));

    // Define key facial landmarks for cropping including forehead/hair area
    // Use outer face contour to include more head area
    const faceContourIndices = [
      // Outer face contour including forehead and jaw
      10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288,
      397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136,
      172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
      // Additional points for forehead/hairline
      9, 10, 151, 337, 299, 333, 298, 301, 368, 264, 447, 366, 401, 435,
      410, 454, 323, 361, 340, 346, 347, 348, 349, 350, 451, 452, 453, 464,
      435, 410, 454, 323, 361, 340, 117, 118, 119, 120, 121, 126, 142, 36, 205, 206, 207, 213, 192, 147
    ];

    // Get face boundary points
    const facePoints = faceContourIndices.map(index => points[index]).filter(Boolean);
    
    if (facePoints.length === 0) {
      // Fallback: use key landmarks including forehead for better head coverage
      const keyLandmarks = [
        // Eyes
        33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246,
        // Nose
        1, 2, 5, 4, 6, 19, 20, 94, 125, 141, 235, 236,
        // Mouth
        61, 84, 17, 314, 405, 320, 307, 375,
        // Face contour with forehead
        10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377, 152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109,
        // Forehead points
        9, 10, 151, 337, 299, 333, 298, 301
      ];
      
      const keyPoints = keyLandmarks.map(index => points[index]).filter(Boolean);
      
      if (keyPoints.length > 0) {
        const minX = Math.min(...keyPoints.map(p => p.x));
        const maxX = Math.max(...keyPoints.map(p => p.x));
        const minY = Math.min(...keyPoints.map(p => p.y));
        const maxY = Math.max(...keyPoints.map(p => p.y));
        return this.cropRectangularFace(img, minX, minY, maxX - minX, maxY - minY);
      }
      
      // Last resort: use all points
      const minX = Math.min(...points.map(p => p.x));
      const maxX = Math.max(...points.map(p => p.x));
      const minY = Math.min(...points.map(p => p.y));
      const maxY = Math.max(...points.map(p => p.y));
      return this.cropRectangularFace(img, minX, minY, maxX - minX, maxY - minY);
    }

    // Calculate bounding box from face contour
    const minX = Math.min(...facePoints.map(p => p.x));
    const maxX = Math.max(...facePoints.map(p => p.x));
    const minY = Math.min(...facePoints.map(p => p.y));
    const maxY = Math.max(...facePoints.map(p => p.y));

    // Add generous padding to include head, hair, and slight background
    const paddingX = (maxX - minX) * 0.25; // 25% horizontal padding
    const paddingY = (maxY - minY) * 0.35; // 35% vertical padding for forehead/hair
    
    const cropX = Math.max(0, minX - paddingX);
    const cropY = Math.max(0, minY - paddingY);
    const cropWidth = Math.min(img.width - cropX, (maxX - minX) + (paddingX * 2));
    const cropHeight = Math.min(img.height - cropY, (maxY - minY) + (paddingY * 2));

    // Make it square for better profile picture
    const size = Math.min(cropWidth, cropHeight);
    canvas.width = size;
    canvas.height = size;

    // Center the crop
    const offsetX = (cropWidth - size) / 2;
    const offsetY = (cropHeight - size) / 2;

    // Draw the cropped face
    ctx.drawImage(
      img,
      cropX + offsetX, cropY + offsetY, size, size,
      0, 0, size, size
    );

    // Apply circular mask
    this.applyCircularMask(ctx, size);

    return canvas.toDataURL('image/jpeg', 0.95);
  }

  private cropRectangularFace(img: HTMLImageElement, x: number, y: number, width: number, height: number): string {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;

    // Add generous padding to include head and hair
    const paddingX = width * 0.25; // 25% horizontal padding
    const paddingY = height * 0.35; // 35% vertical padding for forehead/hair
    
    const cropX = Math.max(0, x - paddingX);
    const cropY = Math.max(0, y - paddingY);
    const cropWidth = Math.min(img.width - cropX, width + (paddingX * 2));
    const cropHeight = Math.min(img.height - cropY, height + (paddingY * 2));

    // Make it square
    const size = Math.min(cropWidth, cropHeight);
    canvas.width = size;
    canvas.height = size;

    // Center the crop
    const offsetX = (cropWidth - size) / 2;
    const offsetY = (cropHeight - size) / 2;

    ctx.drawImage(
      img,
      cropX + offsetX, cropY + offsetY, size, size,
      0, 0, size, size
    );

    // Apply circular mask
    this.applyCircularMask(ctx, size);

    return canvas.toDataURL('image/jpeg', 0.95);
  }

  private applyCircularMask(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.globalCompositeOperation = 'destination-in';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalCompositeOperation = 'source-over';
  }
}

export const mediapipeFaceExtractor = MediaPipeFaceExtractor.getInstance(); 