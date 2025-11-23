/**
 * FaceValidator - Simple client-side face detection for CAMERA GUIDANCE ONLY
 * 
 * IMPORTANT: This is NOT reliable enough for actual validation!
 * - Used only for real-time guidance during camera capture
 * - Helps users position themselves correctly
 * - Provides visual feedback (green frame when ready)
 * 
 * ACTUAL VALIDATION happens on the backend using proper CV libraries.
 * DO NOT use this for uploaded image validation - it cannot distinguish
 * between objects (cakes, paintings, etc.) and real faces.
 */

export interface FaceValidationResult {
  hasFace: boolean;
  hasEars: boolean;
  hasShoulders: boolean;
  confidence: number;
  message: string;
}

export class FaceValidator {
  private isInitialized = false;

  /**
   * Performs basic pixel-based face detection for real-time camera guidance.
   * NOT suitable for validating uploaded images against non-face objects.
   */
  async validateFace(imageData: string): Promise<FaceValidationResult> {
    try {
      // Simple validation based on image analysis
      const result = await this.performBasicValidation(imageData);
      return result;
    } catch (error) {
      console.error('Face validation error:', error);
      return {
        hasFace: false,
        hasEars: false,
        hasShoulders: false,
        confidence: 0,
        message: 'Validation failed. Please try again.'
      };
    }
  }

  private async performBasicValidation(imageData: string): Promise<FaceValidationResult> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve({
            hasFace: false,
            hasEars: false,
            hasShoulders: false,
            confidence: 0,
            message: 'Canvas not available'
          });
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Basic validation based on image characteristics
        const validation = this.analyzeImageCharacteristics(canvas, ctx);
        resolve(validation);
      };

      img.onerror = () => {
        resolve({
          hasFace: false,
          hasEars: false,
          hasShoulders: false,
          confidence: 0,
          message: 'Failed to load image'
        });
      };

      img.src = imageData;
    });
  }

  private analyzeImageCharacteristics(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): FaceValidationResult {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // Convert to grayscale for analysis
    const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayscale[i / 4] = gray;
    }

    // Basic face region detection (simplified)
    const faceRegion = this.detectFaceRegion(grayscale, canvas.width, canvas.height);

    if (!faceRegion) {
      return {
        hasFace: false,
        hasEars: false,
        hasShoulders: false,
        confidence: 0,
        message: 'No face detected. Please position your face in the frame.'
      };
    }

    // Check for ears (side regions of face)
    const hasEars = this.checkForEars(grayscale, canvas.width, canvas.height, faceRegion);

    // Check for shoulders (lower part of image)
    const hasShoulders = this.checkForShoulders(grayscale, canvas.width, canvas.height, faceRegion);

    const confidence = this.calculateConfidence(faceRegion, hasEars, hasShoulders);

    let message = 'Position your face in the frame.';
    if (hasEars && hasShoulders) {
      message = 'Perfect! All required elements detected.';
    } else if (!hasEars) {
      message = 'Ears not visible. Please show both ears.';
    } else if (!hasShoulders) {
      message = 'Shoulders not visible. Please include upper body.';
    }

    return {
      hasFace: true,
      hasEars,
      hasShoulders,
      confidence,
      message
    };
  }

  private detectFaceRegion(grayscale: Uint8ClampedArray, width: number, height: number): { x: number, y: number, width: number, height: number } | null {
    // More robust face detection - scan multiple regions
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const faceSize = Math.min(width, height) * 0.4; // Larger face region

    // Check center region
    const centerRegion = this.analyzeRegion(grayscale, width, height, centerX - faceSize / 2, centerY - faceSize / 2, faceSize, faceSize);

    // More lenient thresholds for face detection
    if (centerRegion.variance > 500 && centerRegion.average < 180) {
      return {
        x: centerX - faceSize / 2,
        y: centerY - faceSize / 2,
        width: faceSize,
        height: faceSize
      };
    }

    // Also check upper center region (common face position)
    const upperCenterY = centerY - faceSize * 0.2;
    const upperRegion = this.analyzeRegion(grayscale, width, height, centerX - faceSize / 2, upperCenterY - faceSize / 2, faceSize, faceSize);

    if (upperRegion.variance > 500 && upperRegion.average < 180) {
      return {
        x: centerX - faceSize / 2,
        y: upperCenterY - faceSize / 2,
        width: faceSize,
        height: faceSize
      };
    }

    return null;
  }



  private checkForEars(grayscale: Uint8ClampedArray, width: number, height: number, faceRegion: { x: number, y: number, width: number, height: number }): boolean {
    // Check left and right sides of face region
    const earWidth = faceRegion.width * 0.2; // Wider ear detection area

    // Left ear
    const leftEarRegion = this.analyzeRegion(grayscale, width, height, faceRegion.x - earWidth, faceRegion.y, earWidth, faceRegion.height);

    // Right ear
    const rightEarRegion = this.analyzeRegion(grayscale, width, height, faceRegion.x + faceRegion.width, faceRegion.y, earWidth, faceRegion.height);

    // More lenient ear detection - check for moderate variance
    return leftEarRegion.variance > 300 || rightEarRegion.variance > 300;
  }

  private checkForShoulders(grayscale: Uint8ClampedArray, width: number, height: number, faceRegion: { x: number, y: number, width: number, height: number }): boolean {
    // Check lower part of image for shoulder-like features
    const shoulderY = faceRegion.y + faceRegion.height * 1.1; // Closer to face
    const shoulderHeight = faceRegion.height * 0.5; // Larger shoulder area
    const shoulderRegion = this.analyzeRegion(grayscale, width, height, faceRegion.x, shoulderY, faceRegion.width, shoulderHeight);

    // More lenient shoulder detection
    return shoulderRegion.variance > 200; // Lower threshold for shoulder detection
  }

  private analyzeRegion(grayscale: Uint8ClampedArray, width: number, height: number, x: number, y: number, regionWidth: number, regionHeight: number): { average: number, variance: number } {
    let sum = 0;
    let count = 0;

    for (let i = Math.max(0, y); i < Math.min(height, y + regionHeight); i++) {
      for (let j = Math.max(0, x); j < Math.min(width, x + regionWidth); j++) {
        const index = i * width + j;
        if (index < grayscale.length) {
          sum += grayscale[index];
          count++;
        }
      }
    }

    if (count === 0) return { average: 0, variance: 0 };

    const average = sum / count;

    // Calculate variance
    let varianceSum = 0;
    for (let i = Math.max(0, y); i < Math.min(height, y + regionHeight); i++) {
      for (let j = Math.max(0, x); j < Math.min(width, x + regionWidth); j++) {
        const index = i * width + j;
        if (index < grayscale.length) {
          varianceSum += Math.pow(grayscale[index] - average, 2);
        }
      }
    }

    const variance = varianceSum / count;

    return { average, variance };
  }

  private calculateConfidence(faceRegion: { x: number, y: number, width: number, height: number }, hasEars: boolean, hasShoulders: boolean): number {
    let confidence = 0.5; // Base confidence

    if (hasEars) confidence += 0.3;
    if (hasShoulders) confidence += 0.2;

    // Adjust based on face size (should be reasonable)
    const faceArea = faceRegion.width * faceRegion.height;
    const imageArea = (faceRegion.width + 100) * (faceRegion.height + 100); // Approximate image area
    const faceRatio = faceArea / imageArea;

    if (faceRatio > 0.1 && faceRatio < 0.6) {
      confidence += 0.1;
    }

    return Math.min(confidence, 1.0);
  }
}

export const faceValidator = new FaceValidator(); 