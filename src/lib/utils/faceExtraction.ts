export interface FaceExtractionResult {
  success: boolean;
  faceImageUrl?: string;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  error?: string;
}

export class FaceExtractor {
  private static instance: FaceExtractor;
  
  private constructor() {}
  
  static getInstance(): FaceExtractor {
    if (!FaceExtractor.instance) {
      FaceExtractor.instance = new FaceExtractor();
    }
    return FaceExtractor.instance;
  }

  async extractFace(imageData: string, padding: number = 0.3): Promise<FaceExtractionResult> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const result = await this.processImage(img, padding);
            resolve(result);
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
    } catch (error) {
      return {
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async processImage(img: HTMLImageElement, padding: number): Promise<FaceExtractionResult> {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Canvas context not available');
    }

    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);

    // Detect face region
    const faceDetection = await this.detectFaceRegion(canvas, ctx);
    
    if (!faceDetection.success) {
      return faceDetection;
    }

    // Extract face with padding
    const faceCanvas = this.extractFaceRegion(
      canvas, 
      ctx, 
      faceDetection.boundingBox!, 
      padding
    );

    return {
      success: true,
      faceImageUrl: faceCanvas.toDataURL('image/jpeg', 0.9),
      boundingBox: faceDetection.boundingBox,
      confidence: faceDetection.confidence
    };
  }

  private async detectFaceRegion(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): Promise<FaceExtractionResult> {
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
      return {
        success: true,
        boundingBox: bestFace,
        confidence: bestFace.confidence
      };
    }

    return {
      success: false,
      confidence: 0,
      error: 'No face detected'
    };
  }

  private detectFaceRegions(grayscale: Uint8ClampedArray, width: number, height: number): Array<{x: number, y: number, width: number, height: number, confidence: number}> {
    const faces: Array<{x: number, y: number, width: number, height: number, confidence: number}> = [];
    
    // Scan for face-like regions using multiple scales
    const scales = [0.15, 0.2, 0.25, 0.3, 0.35];
    
    for (const scale of scales) {
      const faceSize = Math.min(width, height) * scale;
      const stepSize = Math.max(1, Math.floor(faceSize * 0.1));
      
      for (let y = 0; y < height - faceSize; y += stepSize) {
        for (let x = 0; x < width - faceSize; x += stepSize) {
          const confidence = this.evaluateFaceRegion(grayscale, width, height, x, y, faceSize);
          
          if (confidence > 0.4) {
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
    const regionSize = Math.floor(size);
    
    // Check for face-like patterns
    const eyeRegionY = y + regionSize * 0.2;
    const eyeRegionHeight = regionSize * 0.25;
    let eyeScore = 0;
    
    const noseRegionY = y + regionSize * 0.4;
    const noseRegionHeight = regionSize * 0.2;
    let noseScore = 0;
    
    const mouthRegionY = y + regionSize * 0.65;
    const mouthRegionHeight = regionSize * 0.2;
    let mouthScore = 0;
    
    let totalPixels = 0;
    let avgBrightness = 0;
    let edgeScore = 0;
    
    for (let dy = 0; dy < regionSize && y + dy < height; dy++) {
      for (let dx = 0; dx < regionSize && x + dx < width; dx++) {
        const pixelIndex = (y + dy) * width + (x + dx);
        const brightness = grayscale[pixelIndex];
        
        totalPixels++;
        avgBrightness += brightness;
        
        // Edge detection for facial features
        if (dx > 0 && dy > 0 && dx < regionSize - 1 && dy < regionSize - 1) {
          const sobelX = (
            grayscale[pixelIndex - 1] * -1 +
            grayscale[pixelIndex + 1] * 1 +
            grayscale[pixelIndex - width - 1] * -2 +
            grayscale[pixelIndex - width + 1] * 2 +
            grayscale[pixelIndex + width - 1] * -1 +
            grayscale[pixelIndex + width + 1] * 1
          );
          
          const sobelY = (
            grayscale[pixelIndex - width - 1] * -1 +
            grayscale[pixelIndex - width] * -2 +
            grayscale[pixelIndex - width + 1] * -1 +
            grayscale[pixelIndex + width - 1] * 1 +
            grayscale[pixelIndex + width] * 2 +
            grayscale[pixelIndex + width + 1] * 1
          );
          
          const edgeMagnitude = Math.sqrt(sobelX * sobelX + sobelY * sobelY);
          if (edgeMagnitude > 30) edgeScore++;
        }
        
        // Evaluate different regions
        if (dy >= eyeRegionY - y && dy < eyeRegionY - y + eyeRegionHeight) {
          eyeScore += brightness < 120 ? 1 : 0; // Eyes should be darker
        }
        
        if (dy >= noseRegionY - y && dy < noseRegionY - y + noseRegionHeight) {
          noseScore += brightness > 80 && brightness < 180 ? 1 : 0; // Nose moderate
        }
        
        if (dy >= mouthRegionY - y && dy < mouthRegionY - y + mouthRegionHeight) {
          mouthScore += brightness > 70 && brightness < 200 ? 1 : 0; // Mouth variation
        }
      }
    }
    
    if (totalPixels === 0) return 0;
    
    avgBrightness /= totalPixels;
    
    const eyeRatio = eyeScore / (regionSize * eyeRegionHeight);
    const noseRatio = noseScore / (regionSize * noseRegionHeight);
    const mouthRatio = mouthScore / (regionSize * mouthRegionHeight);
    const edgeRatio = edgeScore / totalPixels;
    
    // Combine scores with weights
    let score = (
      eyeRatio * 0.3 + 
      noseRatio * 0.25 + 
      mouthRatio * 0.25 + 
      edgeRatio * 0.2
    );
    
    // Bonus for being in the upper part of the image
    const positionBonus = y < height * 0.6 ? 0.15 : 0;
    
    // Bonus for appropriate brightness (skin tone range)
    const brightnessBonus = (avgBrightness > 80 && avgBrightness < 200) ? 0.1 : 0;
    
    // Bonus for appropriate size (not too small or too large)
    const sizeRatio = size / Math.min(width, height);
    const sizeBonus = (sizeRatio > 0.15 && sizeRatio < 0.4) ? 0.1 : 0;
    
    return Math.min(1, score + positionBonus + brightnessBonus + sizeBonus);
  }

  private selectBestFace(faces: Array<{x: number, y: number, width: number, height: number, confidence: number}>): {x: number, y: number, width: number, height: number, confidence: number} | null {
    if (faces.length === 0) return null;
    
    // Sort by confidence and select the best one
    faces.sort((a, b) => b.confidence - a.confidence);
    
    // Additional filtering: prefer faces in the upper half and center
    const bestCandidates = faces.filter(face => face.confidence > 0.4);
    
    if (bestCandidates.length === 0) return faces[0];
    
    // Score based on position (prefer center and upper regions)
    const scoredFaces = bestCandidates.map(face => {
      const centerX = face.x + face.width / 2;
      const centerY = face.y + face.height / 2;
      
      // Normalize to 0-1
      const normalizedX = centerX / 1000; // Assuming max width
      const normalizedY = centerY / 1000; // Assuming max height
      
      // Prefer center horizontally and upper regions vertically
      const positionScore = (1 - Math.abs(normalizedX - 0.5)) * (1 - normalizedY * 0.7);
      
      return {
        ...face,
        totalScore: face.confidence * 0.7 + positionScore * 0.3
      };
    });
    
    scoredFaces.sort((a, b) => b.totalScore - a.totalScore);
    return scoredFaces[0];
  }

  private extractFaceRegion(
    canvas: HTMLCanvasElement, 
    ctx: CanvasRenderingContext2D, 
    boundingBox: {x: number, y: number, width: number, height: number}, 
    padding: number
  ): HTMLCanvasElement {
    
    // Calculate padded dimensions
    const paddingX = boundingBox.width * padding;
    const paddingY = boundingBox.height * padding;
    
    const extractX = Math.max(0, boundingBox.x - paddingX);
    const extractY = Math.max(0, boundingBox.y - paddingY);
    const extractWidth = Math.min(
      canvas.width - extractX, 
      boundingBox.width + (paddingX * 2)
    );
    const extractHeight = Math.min(
      canvas.height - extractY, 
      boundingBox.height + (paddingY * 2)
    );
    
    // Create new canvas for the extracted face
    const faceCanvas = document.createElement('canvas');
    const faceCtx = faceCanvas.getContext('2d')!;
    
    // Set canvas size to extracted region
    faceCanvas.width = extractWidth;
    faceCanvas.height = extractHeight;
    
    // Draw the extracted region
    faceCtx.drawImage(
      canvas,
      extractX, extractY, extractWidth, extractHeight,
      0, 0, extractWidth, extractHeight
    );
    
    // Optional: Apply some enhancements
    this.enhanceFaceImage(faceCtx, extractWidth, extractHeight);
    
    return faceCanvas;
  }

  private enhanceFaceImage(ctx: CanvasRenderingContext2D, width: number, height: number): void {
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    // Apply subtle brightness and contrast enhancement
    for (let i = 0; i < data.length; i += 4) {
      // Brightness adjustment
      data[i] = Math.min(255, data[i] * 1.1);     // Red
      data[i + 1] = Math.min(255, data[i + 1] * 1.1); // Green  
      data[i + 2] = Math.min(255, data[i + 2] * 1.1); // Blue
      
      // Contrast adjustment
      data[i] = Math.min(255, Math.max(0, (data[i] - 128) * 1.1 + 128));
      data[i + 1] = Math.min(255, Math.max(0, (data[i + 1] - 128) * 1.1 + 128));
      data[i + 2] = Math.min(255, Math.max(0, (data[i + 2] - 128) * 1.1 + 128));
    }
    
    ctx.putImageData(imageData, 0, 0);
  }

  // Extract multiple faces if present
  async extractAllFaces(imageData: string, padding: number = 0.3): Promise<FaceExtractionResult[]> {
    try {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            const imageDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageDataObj.data;
            
            // Convert to grayscale
            const grayscale = new Uint8ClampedArray(canvas.width * canvas.height);
            for (let i = 0; i < data.length; i += 4) {
              const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
              grayscale[i / 4] = gray;
            }

            // Detect all faces
            const faceRegions = this.detectFaceRegions(grayscale, canvas.width, canvas.height);
            const validFaces = faceRegions.filter(face => face.confidence > 0.4);

            const results: FaceExtractionResult[] = validFaces.map(face => {
              const faceCanvas = this.extractFaceRegion(canvas, ctx, face, padding);
              return {
                success: true,
                faceImageUrl: faceCanvas.toDataURL('image/jpeg', 0.9),
                boundingBox: face,
                confidence: face.confidence
              };
            });

            resolve(results);
          } catch (error) {
            resolve([{
              success: false,
              confidence: 0,
              error: error instanceof Error ? error.message : 'Unknown error'
            }]);
          }
        };
        
        img.onerror = () => {
          resolve([{
            success: false,
            confidence: 0,
            error: 'Failed to load image'
          }]);
        };
        
        img.src = imageData;
      });
    } catch (error) {
      return [{
        success: false,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }
}

export const faceExtractor = FaceExtractor.getInstance(); 