import React, { useState, useEffect, useRef } from 'react';
import { FaceDetector as MediaPipeFaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';

interface FaceSwapComponentProps {
  imageUrl?: string;
}

interface BoundingBox {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

const FaceSwapComponent: React.FC<FaceSwapComponentProps> = ({ imageUrl }) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [faceDetector, setFaceDetector] = useState<MediaPipeFaceDetector | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sourceCanvasRef = useRef<HTMLCanvasElement>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize MediaPipe Face Detector
  useEffect(() => {
    const initializeFaceDetector = async (): Promise<void> => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
        );
        
        const detector = await MediaPipeFaceDetector.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
            delegate: "GPU"
          },
          runningMode: "IMAGE"
        });
        
        setFaceDetector(detector);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
        setError("Failed to initialize face detector: " + errorMessage);
      }
    };

    initializeFaceDetector();
  }, []);

  // Load image from URL
  const loadImage = (src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  };

  // Detect face and get bounding box
  const detectFace = async (image: HTMLImageElement): Promise<BoundingBox> => {
    if (!faceDetector) throw new Error("Face detector not initialized");
    
    const detections = faceDetector.detect(image);
    if (!detections.detections || detections.detections.length === 0) {
      throw new Error("No face detected in the image");
    }
    
    return detections.detections[0].boundingBox as BoundingBox;
  };

  // Crop face from source image
  const cropFace = (sourceImage: HTMLImageElement, boundingBox: BoundingBox): HTMLCanvasElement => {
    const canvas = sourceCanvasRef.current;
    if (!canvas) throw new Error("Source canvas not available");
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");
    
    const { originX, originY, width, height } = boundingBox;
    
    // Add padding around face
    const padding = 0.3;
    const paddedWidth = width * (1 + padding);
    const paddedHeight = height * (1 + padding);
    const paddedX = Math.max(0, originX - (paddedWidth - width) / 2);
    const paddedY = Math.max(0, originY - (paddedHeight - height) / 2);
    
    canvas.width = paddedWidth;
    canvas.height = paddedHeight;
    
    ctx.drawImage(
      sourceImage,
      paddedX, paddedY, paddedWidth, paddedHeight,
      0, 0, paddedWidth, paddedHeight
    );
    
    return canvas;
  };

  // Simple background removal using edge detection and color similarity
  const removeBackground = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Sample edge colors for background detection
    const edgePixels: number[][] = [];
    const width = canvas.width;
    const height = canvas.height;
    
    // Sample pixels from edges
    for (let i = 0; i < width; i++) {
      edgePixels.push(getPixel(data, i, 0, width)); // top edge
      edgePixels.push(getPixel(data, i, height - 1, width)); // bottom edge
    }
    for (let j = 0; j < height; j++) {
      edgePixels.push(getPixel(data, 0, j, width)); // left edge
      edgePixels.push(getPixel(data, width - 1, j, width)); // right edge
    }
    
    // Calculate average background color
    const avgBg = calculateAverageColor(edgePixels);
    
    // Remove background pixels
    for (let i = 0; i < data.length; i += 4) {
      const pixel: number[] = [data[i], data[i + 1], data[i + 2]];
      const distance = colorDistance(pixel, avgBg);
      
      // If pixel is similar to background, make it transparent
      if (distance < 80) { // Adjust threshold as needed
        data[i + 3] = 0; // Set alpha to 0 (transparent)
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  };

  const getPixel = (data: Uint8ClampedArray, x: number, y: number, width: number): number[] => {
    const index = (y * width + x) * 4;
    return [data[index], data[index + 1], data[index + 2]];
  };

  const calculateAverageColor = (pixels: number[][]): number[] => {
    const sum = pixels.reduce((acc: number[], pixel: number[]) => [
      acc[0] + pixel[0],
      acc[1] + pixel[1],
      acc[2] + pixel[2]
    ], [0, 0, 0]);
    
    return [
      Math.round(sum[0] / pixels.length),
      Math.round(sum[1] / pixels.length),
      Math.round(sum[2] / pixels.length)
    ];
  };

  const colorDistance = (color1: number[], color2: number[]): number => {
    return Math.sqrt(
      Math.pow(color1[0] - color2[0], 2) +
      Math.pow(color1[1] - color2[1], 2) +
      Math.pow(color1[2] - color2[2], 2)
    );
  };

  // Blend cropped face onto target image
  const blendFaceOnTarget = async (
    croppedFaceCanvas: HTMLCanvasElement, 
    targetImage: HTMLImageElement
  ): Promise<string> => {
    const canvas = canvasRef.current;
    if (!canvas) throw new Error("Main canvas not available");
    
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error("Canvas context not available");
    
    canvas.width = targetImage.width;
    canvas.height = targetImage.height;
    
    // Draw target image
    ctx.drawImage(targetImage, 0, 0);
    
    // Detect face in target image to get position
    let targetFaceBounds: BoundingBox;
    try {
      targetFaceBounds = await detectFace(targetImage);
    } catch (err) {
      // If no face detected in target, place in center
      targetFaceBounds = {
        originX: targetImage.width * 0.3,
        originY: targetImage.height * 0.2,
        width: targetImage.width * 0.4,
        height: targetImage.height * 0.5
      };
    }
    
    // Scale and position the cropped face
    const scaleX = targetFaceBounds.width / croppedFaceCanvas.width;
    const scaleY = targetFaceBounds.height / croppedFaceCanvas.height;
    const scale = Math.min(scaleX, scaleY) * 1.2; // Slightly larger
    
    const newWidth = croppedFaceCanvas.width * scale;
    const newHeight = croppedFaceCanvas.height * scale;
    
    const x = targetFaceBounds.originX + (targetFaceBounds.width - newWidth) / 2;
    const y = targetFaceBounds.originY + (targetFaceBounds.height - newHeight) / 2;
    
    // Draw the cropped face
    ctx.drawImage(croppedFaceCanvas, x, y, newWidth, newHeight);
    
    return canvas.toDataURL();
  };

  // Main processing function
  const processFaceSwap = async (): Promise<void> => {
    if (!imageUrl || !faceDetector) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Load source image (from URL)
      const sourceImage = await loadImage(imageUrl);
      
      // Load target image (dummy.png)
      const targetImage = await loadImage('/dummy.png');
      
      // Detect face in source image
      const faceBounds = await detectFace(sourceImage);
      
      // Crop face from source
      const croppedFaceCanvas = cropFace(sourceImage, faceBounds);
      
      // Remove background from cropped face
      const faceWithoutBg = removeBackground(croppedFaceCanvas);
      
      // Blend onto target image
      const result = await blendFaceOnTarget(faceWithoutBg, targetImage);
      
      setProcessedImage(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-process when imageUrl changes
  useEffect(() => {
    if (imageUrl && faceDetector) {
      processFaceSwap();
    }
  }, [imageUrl, faceDetector]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        AI Face Swap with Background Removal
      </h2>
      
      {/* Hidden canvases for processing */}
      <canvas ref={sourceCanvasRef} style={{ display: 'none' }} />
      <canvas ref={targetCanvasRef} style={{ display: 'none' }} />
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Input section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Source Image URL:
        </label>
        <div className="text-sm text-gray-600 mb-2">
          Current URL: {imageUrl || 'Not provided'}
        </div>
        {imageUrl && (
          <div className="mb-4">
            <img 
              src={imageUrl} 
              alt="Source" 
              className="max-w-xs h-auto rounded-lg border"
              crossOrigin="anonymous"
            />
          </div>
        )}
      </div>

      {/* Process button */}
      <div className="flex justify-center mb-6">
        <button
          onClick={processFaceSwap}
          disabled={!imageUrl || !faceDetector || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Processing...
            </>
          ) : (
            'Process Face Swap'
          )}
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Status */}
      <div className="mb-6 text-center">
        <div className="text-sm text-gray-600">
          Face Detector: {faceDetector ? '✅ Ready' : '⏳ Loading...'}
        </div>
      </div>

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original target image */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Original Target</h3>
          <img 
            src="/dummy.png" 
            alt="Target" 
            className="w-full h-auto rounded-lg border shadow-sm"
          />
        </div>

        {/* Processed result */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Face Swap Result</h3>
          {processedImage ? (
            <div>
              <img 
                src={processedImage} 
                alt="Processed" 
                className="w-full h-auto rounded-lg border shadow-sm"
              />
              <a
                href={processedImage}
                download="face-swap-result.png"
                className="inline-block mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Download Result
              </a>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 rounded-lg border flex items-center justify-center text-gray-500">
              {isLoading ? 'Processing...' : 'No result yet'}
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">Instructions:</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Provide an image URL containing a clear face</li>
          <li>• The component will detect and crop the face automatically</li>
          <li>• Background will be removed using color similarity detection</li>
          <li>• The face will be blended onto the dummy.png image</li>
          <li>• For best results, use images with good lighting and clear faces</li>
        </ul>
      </div>
    </div>
  );
};

export default FaceSwapComponent;