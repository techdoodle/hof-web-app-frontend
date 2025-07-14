import { FaceDetector as MediaPipeFaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

// Face detection utility for frontend validation
export interface FaceDetectionResult {
  hasFace: boolean;
  hasNeck: boolean;
  confidence: number;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  landmarks?: Array<{
    x: number;
    y: number;
  }>;
}

export class FaceDetector {
  private static instance: FaceDetector;
  private faceDetector: MediaPipeFaceDetector | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): FaceDetector {
    if (!FaceDetector.instance) {
      FaceDetector.instance = new FaceDetector();
    }
    return FaceDetector.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.initializeMediaPipe();
    await this.initializationPromise;
  }

  private async initializeMediaPipe(): Promise<void> {
    try {
      // Initialize the MediaPipe FilesetResolver
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );

      // Create the face detector with options
      this.faceDetector = await MediaPipeFaceDetector.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
          delegate: "GPU"
        },
        runningMode: "IMAGE",
        minDetectionConfidence: 0.5,
        minSuppressionThreshold: 0.3
      });

      this.isInitialized = true;
      console.log('MediaPipe Face Detection initialized successfully');
    } catch (error) {
      console.error('Failed to initialize MediaPipe Face Detection:', error);
      // Fallback to basic detection
      this.isInitialized = true;
    }
  }

  async detectFace(imageData: string): Promise<FaceDetectionResult> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve) => {
      const img = new Image();
      img.onload = async () => {
        try {
          if (this.faceDetector) {
            const result = await this.detectWithMediaPipe(img);
            resolve(result);
          } else {
            const result = await this.detectWithOpenCV(img);
            resolve(result);
          }
        } catch (error) {
          console.error('Face detection error:', error);
          const fallbackResult = await this.detectWithOpenCV(img);
          resolve(fallbackResult);
        }
      };
      
      img.onerror = () => {
        resolve({ hasFace: false, hasNeck: false, confidence: 0 });
      };
      
      img.src = imageData;
    });
  }

  private async detectWithMediaPipe(img: HTMLImageElement): Promise<FaceDetectionResult> {
    try {
      if (!this.faceDetector) {
        throw new Error('Face detector not initialized');
      }

      const detectionResult = this.faceDetector.detect(img);
      
      if (detectionResult.detections && detectionResult.detections.length > 0) {
        const detection = detectionResult.detections[0];
        const boundingBox = detection.boundingBox;
        
        if (!boundingBox) {
          return { hasFace: false, hasNeck: false, confidence: 0 };
        }
        
        // Check for neck region based on face position
        const faceBottom = boundingBox.originY + boundingBox.height;
        const imageHeight = img.height;
        const hasNeck = faceBottom < imageHeight * 0.8; // Face should be in upper 80% to have neck visible
        
        // Extract landmarks if available (6 keypoints: left eye, right eye, nose tip, mouth, left ear, right ear)
        const landmarks = detection.keypoints?.map(keypoint => ({
          x: keypoint.x * img.width,
          y: keypoint.y * img.height
        }));

        // Get confidence score from categories
        const confidence = detection.categories && detection.categories.length > 0 
          ? detection.categories[0].score 
          : 0.8;

        return {
          hasFace: true,
          hasNeck,
          confidence,
          boundingBox: {
            x: boundingBox.originX,
            y: boundingBox.originY,
            width: boundingBox.width,
            height: boundingBox.height
          },
          landmarks
        };
      } else {
        return { hasFace: false, hasNeck: false, confidence: 0 };
      }
    } catch (error) {
      console.error('MediaPipe detection error:', error);
      throw error;
    }
  }

  private async detectWithOpenCV(img: HTMLImageElement): Promise<FaceDetectionResult> {
    // Fallback to a more robust implementation using canvas-based detection
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      return { hasFace: false, hasNeck: false, confidence: 0 };
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Use advanced face detection with better heuristics
    const result = await this.advancedFaceDetection(canvas, ctx);
    return result;
  }

  private async advancedFaceDetection(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<FaceDetectionResult> {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert to grayscale for better processing
    const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
    for (let i = 0; i < data.length; i += 4) {
      const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      grayscale[i / 4] = gray;
    }

    // Detect face using multiple approaches
    const faceRegions = this.detectFaceRegions(grayscale, canvas.width, canvas.height);
    const bestFace = this.selectBestFace(faceRegions);

    if (bestFace) {
      // Check for neck region
      const neckY = bestFace.y + bestFace.height;
      const hasNeck = neckY < canvas.height * 0.9 && this.detectNeckRegion(data, canvas.width, canvas.height, bestFace);

      return {
        hasFace: true,
        hasNeck,
        confidence: bestFace.confidence,
        boundingBox: bestFace
      };
    }

    return { hasFace: false, hasNeck: false, confidence: 0 };
  }

  private detectFaceRegions(grayscale: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, width: number, height: number, confidence: number}> {
    const faces: Array<{x: number, y: number, width: number, height: number, confidence: number}> = [];
    
    // Scan for face-like regions using multiple scales
    const scales = [0.1, 0.15, 0.2, 0.25, 0.3];
    
    for (const scale of scales) {
      const faceSize = Math.min(width, height) * scale;
      const stepSize = Math.max(1, Math.floor(faceSize * 0.1));
      
      for (let y = 0; y < height - faceSize; y += stepSize) {
        for (let x = 0; x < width - faceSize; x += stepSize) {
          const confidence = this.evaluateFaceRegion(grayscale, width, height, x, y, faceSize);
          
          if (confidence > 0.3) {
            faces.push({
              x,
              y,
              width: faceSize,
              height: faceSize,
              confidence
            });
          }
        }
      }
    }
    
    return faces;
  }

  private evaluateFaceRegion(grayscale: Uint8ClampedArray, width: number, height: number, x: number, y: number, size: number): number {
    let score = 0;
    const regionSize = Math.floor(size);
    
    // Check for face-like patterns using Viola-Jones inspired approach
    // 1. Eyes region (upper third) should be darker
    const eyeRegionY = y + regionSize * 0.2;
    const eyeRegionHeight = regionSize * 0.3;
    let eyeScore = 0;
    
    // 2. Nose region (middle) should have moderate brightness
    const noseRegionY = y + regionSize * 0.4;
    const noseRegionHeight = regionSize * 0.2;
    let noseScore = 0;
    
    // 3. Mouth region (lower third) should have variation
    const mouthRegionY = y + regionSize * 0.7;
    const mouthRegionHeight = regionSize * 0.2;
    let mouthScore = 0;
    
    let totalPixels = 0;
    let avgBrightness = 0;
    
    for (let dy = 0; dy < regionSize && y + dy < height; dy++) {
      for (let dx = 0; dx < regionSize && x + dx < width; dx++) {
        const pixelIndex = (y + dy) * width + (x + dx);
        const brightness = grayscale[pixelIndex];
        
        totalPixels++;
        avgBrightness += brightness;
        
        // Evaluate different regions
        if (dy >= eyeRegionY - y && dy < eyeRegionY - y + eyeRegionHeight) {
          eyeScore += brightness < 100 ? 1 : 0; // Eyes should be darker
        }
        
        if (dy >= noseRegionY - y && dy < noseRegionY - y + noseRegionHeight) {
          noseScore += brightness > 80 && brightness < 180 ? 1 : 0; // Nose moderate
        }
        
        if (dy >= mouthRegionY - y && dy < mouthRegionY - y + mouthRegionHeight) {
          mouthScore += brightness > 60 && brightness < 200 ? 1 : 0; // Mouth variation
        }
      }
    }
    
    if (totalPixels === 0) return 0;
    
    avgBrightness /= totalPixels;
    
    const eyeRatio = eyeScore / (regionSize * eyeRegionHeight);
    const noseRatio = noseScore / (regionSize * noseRegionHeight);
    const mouthRatio = mouthScore / (regionSize * mouthRegionHeight);
    
    // Combine scores with weights
    score = (eyeRatio * 0.4 + noseRatio * 0.3 + mouthRatio * 0.3);
    
    // Bonus for being in the upper part of the image
    const positionBonus = y < height * 0.6 ? 0.2 : 0;
    
    // Bonus for appropriate brightness (skin tone range)
    const brightnessBonus = (avgBrightness > 80 && avgBrightness < 200) ? 0.1 : 0;
    
    return Math.min(1, score + positionBonus + brightnessBonus);
  }

  private selectBestFace(faces: Array<{x: number, y: number, width: number, height: number, confidence: number}>): {x: number, y: number, width: number, height: number, confidence: number} | null {
    if (faces.length === 0) return null;
    
    // Sort by confidence and select the best one
    faces.sort((a, b) => b.confidence - a.confidence);
    return faces[0];
  }

  private detectNeckRegion(data: Uint8ClampedArray, width: number, height: number, face: {x: number, y: number, width: number, height: number}): boolean {
    const neckStartY = face.y + face.height;
    const neckEndY = Math.min(height, neckStartY + face.height * 0.5);
    const neckCenterX = face.x + face.width / 2;
    const neckWidth = face.width * 0.6;
    
    let skinPixels = 0;
    let totalPixels = 0;
    
    for (let y = neckStartY; y < neckEndY; y++) {
      for (let x = neckCenterX - neckWidth/2; x < neckCenterX + neckWidth/2; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const pixelIndex = (y * width + x) * 4;
          const r = data[pixelIndex];
          const g = data[pixelIndex + 1];
          const b = data[pixelIndex + 2];
          
          if (this.isSkinTone(r, g, b)) {
            skinPixels++;
          }
          totalPixels++;
        }
      }
    }
    
    return totalPixels > 0 && (skinPixels / totalPixels) > 0.3;
  }

  private isSkinTone(r: number, g: number, b: number): boolean {
    // Enhanced skin tone detection with multiple conditions
    // RGB skin tone detection
    const rgbSkin = (
      r > 95 && g > 40 && b > 20 &&
      r > g && r > b &&
      Math.abs(r - g) > 15 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15
    );
    
    // HSV-based skin detection
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;
    
    let h = 0;
    if (diff !== 0) {
      if (max === r) h = ((g - b) / diff) % 6;
      else if (max === g) h = (b - r) / diff + 2;
      else h = (r - g) / diff + 4;
    }
    h = h * 60;
    if (h < 0) h += 360;
    
    const s = max === 0 ? 0 : diff / max;
    const v = max / 255;
    
    const hsvSkin = (h >= 0 && h <= 50) && (s >= 0.23 && s <= 0.68) && (v >= 0.35 && v <= 0.95);
    
    // YCbCr skin detection
    const y = 0.299 * r + 0.587 * g + 0.114 * b;
    const cb = -0.169 * r - 0.331 * g + 0.5 * b + 128;
    const cr = 0.5 * r - 0.419 * g - 0.081 * b + 128;
    
    const ycbcrSkin = (cb >= 77 && cb <= 127) && (cr >= 133 && cr <= 173);
    
    return rgbSkin || hsvSkin || ycbcrSkin;
  }
}

export const faceDetector = FaceDetector.getInstance(); 