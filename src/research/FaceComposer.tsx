// // components/FaceComposer.tsx
// import React, { useRef, useCallback, useState, useEffect } from 'react';
// import { FaceDetector, FilesetResolver, Detection } from '@mediapipe/tasks-vision';

// interface FaceComposerProps {
//   dummyImageUrl?: string;
//   onImageGenerated?: (base64Image: string) => void;
//   onError?: (error: string) => void;
//   className?: string;
// }

// interface ProcessingOptions {
//   faceScale?: number;
//   positionX?: number;
//   positionY?: number;
//   maskSoftness?: number;
//   quality?: number;
// }

// const FaceComposer: React.FC<FaceComposerProps> = ({
//   dummyImageUrl = '/dummy.png',
//   onImageGenerated,
//   onError,
//   className = ''
// }) => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [previewImage, setPreviewImage] = useState<string>('');
//   const [isInitialized, setIsInitialized] = useState(false);
//   const canvasRef = useRef<HTMLCanvasElement>(null);
//   const faceDetectorRef = useRef<FaceDetector | null>(null);

//   // Initialize MediaPipe Face Detector on component mount
//   useEffect(() => {
//     initializeFaceDetector();
//     return () => {
//       // Cleanup
//       if (faceDetectorRef.current) {
//         faceDetectorRef.current.close();
//       }
//     };
//   }, []);

//   const initializeFaceDetector = useCallback(async () => {
//     if (faceDetectorRef.current) return faceDetectorRef.current;

//     try {
//       const vision = await FilesetResolver.forVisionTasks(
//         'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
//       );
      
//       const faceDetector = await FaceDetector.createFromOptions(vision, {
//         baseOptions: {
//           modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite',
//           delegate: 'GPU'
//         },
//         runningMode: 'IMAGE',
//         minDetectionConfidence: 0.5,
//         minSuppressionThreshold: 0.3
//       });

//       faceDetectorRef.current = faceDetector;
//       setIsInitialized(true);
//       return faceDetector;
//     } catch (error) {
//       console.error('Failed to initialize face detector:', error);
//       onError?.('Failed to initialize face detection. Please check your internet connection.');
//       return null;
//     }
//   }, [onError]);

//   // Enhanced face region extraction with better padding calculation
//   const extractFaceRegion = (
//     canvas: HTMLCanvasElement,
//     ctx: CanvasRenderingContext2D,
//     detection: Detection
//   ): ImageData | null => {
//     const bbox = detection.boundingBox;
    
//     // Calculate face center and dimensions
//     const faceCenterX = bbox.originX + bbox.width / 2;
//     const faceCenterY = bbox.originY + bbox.height / 2;
//     const faceSize = Math.max(bbox.width, bbox.height);
    
//     // Expand region to include hair, ears, and neck
//     const expandedSize = faceSize * 1.8; // 80% larger than detected face
//     const expandedX = Math.max(0, faceCenterX - expandedSize / 2);
//     const expandedY = Math.max(0, faceCenterY - expandedSize * 0.6); // More space on top for hair
//     const clampedWidth = Math.min(expandedSize, canvas.width - expandedX);
//     const clampedHeight = Math.min(expandedSize * 1.2, canvas.height - expandedY); // Slightly taller

//     try {
//       return ctx.getImageData(expandedX, expandedY, clampedWidth, clampedHeight);
//     } catch (error) {
//       console.error('Failed to extract face region:', error);
//       return null;
//     }
//   };

//   // Create advanced mask with feathered edges
//   const createAdvancedMask = (width: number, height: number, softness: number = 0.2): ImageData => {
//     const maskCanvas = document.createElement('canvas');
//     maskCanvas.width = width;
//     maskCanvas.height = height;
//     const maskCtx = maskCanvas.getContext('2d')!;
    
//     const centerX = width / 2;
//     const centerY = height / 2.2; // Slightly higher center for better face positioning
//     const radiusX = width * 0.45;
//     const radiusY = height * 0.4;
    
//     // Create elliptical gradient mask
//     maskCtx.save();
//     maskCtx.scale(1, radiusY / radiusX);
    
//     const gradient = maskCtx.createRadialGradient(
//       centerX, centerY * (radiusX / radiusY), 0,
//       centerX, centerY * (radiusX / radiusY), radiusX
//     );
    
//     gradient.addColorStop(0, 'rgba(255,255,255,1)');
//     gradient.addColorStop(1 - softness, 'rgba(255,255,255,1)');
//     gradient.addColorStop(1, 'rgba(255,255,255,0)');
    
//     maskCtx.fillStyle = gradient;
//     maskCtx.fillRect(0, 0, width, height * (radiusX / radiusY));
//     maskCtx.restore();
    
//     return maskCtx.getImageData(0, 0, width, height);
//   };

//   // Apply mask with alpha blending
//   const applyMask = (imageData: ImageData, mask: ImageData): ImageData => {
//     const result = new ImageData(
//       new Uint8ClampedArray(imageData.data),
//       imageData.width,
//       imageData.height
//     );
    
//     for (let i = 0; i < result.data.length; i += 4) {
//       const maskAlpha = mask.data[i] / 255;
//       result.data[i + 3] = Math.round(result.data[i + 3] * maskAlpha);
//     }
    
//     return result;
//   };

//   // Enhanced composition with better positioning
//   const compositeFaceOnDummy = async (
//     faceImageData: ImageData,
//     dummyImage: HTMLImageElement,
//     options: ProcessingOptions = {}
//   ): Promise<string> => {
//     const {
//       faceScale = 'auto',
//       positionX = 'center',
//       positionY = 0.08, // 8% from top
//       maskSoftness = 0.25,
//       quality = 0.9
//     } = options;

//     const canvas = canvasRef.current!;
//     const ctx = canvas.getContext('2d')!;
    
//     // Set canvas size to match dummy image
//     canvas.width = dummyImage.width;
//     canvas.height = dummyImage.height;
    
//     // Draw dummy image as background
//     ctx.clearRect(0, 0, canvas.width, canvas.height);
//     ctx.drawImage(dummyImage, 0, 0);
    
//     // Calculate optimal face size
//     let scaleFactor: number;
//     if (faceScale === 'auto') {
//       const maxFaceWidth = dummyImage.width * 0.45;
//       const maxFaceHeight = dummyImage.height * 0.4;
//       scaleFactor = Math.min(
//         maxFaceWidth / faceImageData.width,
//         maxFaceHeight / faceImageData.height
//       );
//     } else {
//       scaleFactor = faceScale as number;
//     }
    
//     const scaledWidth = faceImageData.width * scaleFactor;
//     const scaledHeight = faceImageData.height * scaleFactor;
    
//     // Calculate position
//     const faceX = positionX === 'center' 
//       ? (dummyImage.width - scaledWidth) / 2 
//       : (positionX as number);
//     const faceY = typeof positionY === 'number' 
//       ? dummyImage.height * positionY 
//       : positionY;
    
//     // Create and process face canvas
//     const faceCanvas = document.createElement('canvas');
//     faceCanvas.width = faceImageData.width;
//     faceCanvas.height = faceImageData.height;
//     const faceCtx = faceCanvas.getContext('2d')!;
    
//     // Apply advanced mask
//     const mask = createAdvancedMask(faceImageData.width, faceImageData.height, maskSoftness);
//     const maskedFace = applyMask(faceImageData, mask);
//     faceCtx.putImageData(maskedFace, 0, 0);
    
//     // Apply subtle color correction to match dummy image lighting
//     faceCtx.globalCompositeOperation = 'color-burn';
//     faceCtx.globalAlpha = 0.1;
//     faceCtx.fillStyle = '#f4f4f4';
//     faceCtx.fillRect(0, 0, faceCanvas.width, faceCanvas.height);
    
//     // Composite onto main canvas with soft light blending
//     ctx.globalCompositeOperation = 'source-over';
//     ctx.filter = 'brightness(1.05) contrast(1.02)'; // Subtle enhancement
//     ctx.drawImage(faceCanvas, faceX, faceY, scaledWidth, scaledHeight);
//     ctx.filter = 'none';
    
//     return canvas.toDataURL('image/jpeg', quality);
//   };

//   // Main processing function with error handling
//   const processImage = async (base64Image: string, options: ProcessingOptions = {}) => {
//     if (!isInitialized) {
//       onError?.('Face detector not initialized yet. Please wait a moment.');
//       return;
//     }

//     setIsProcessing(true);
    
//     try {
//       const faceDetector = faceDetectorRef.current;
//       if (!faceDetector) {
//         throw new Error('Face detector not available');
//       }

//       // Load and validate input image
//       const inputImage = new Image();
//       await new Promise<void>((resolve, reject) => {
//         inputImage.onload = () => resolve();
//         inputImage.onerror = () => reject(new Error('Failed to load input image'));
//         inputImage.src = base64Image;
//       });

//       // Validate image dimensions
//       if (inputImage.width < 100 || inputImage.height < 100) {
//         throw new Error('Input image is too small. Minimum size is 100x100 pixels.');
//       }

//       // Load dummy image
//       const dummyImage = new Image();
//       await new Promise<void>((resolve, reject) => {
//         dummyImage.onload = () => resolve();
//         dummyImage.onerror = () => reject(new Error('Failed to load dummy image'));
//         dummyImage.src = dummyImageUrl;
//       });

//       // Prepare canvas for detection
//       const detectionCanvas = document.createElement('canvas');
//       detectionCanvas.width = inputImage.width;
//       detectionCanvas.height = inputImage.height;
//       const detectionCtx = detectionCanvas.getContext('2d')!;
//       detectionCtx.drawImage(inputImage, 0, 0);

//       // Detect faces
//       const detectionResult = faceDetector.detect(detectionCanvas);
      
//       if (!detectionResult.detections || detectionResult.detections.length === 0) {
//         throw new Error('No faces detected in the image. Please ensure the image contains a clear, front-facing face.');
//       }

//       // Filter high-confidence detections
//       const highConfidenceDetections = detectionResult.detections.filter(
//         detection => (detection.categories?.[0]?.score ?? 0) > 0.7
//       );

//       const bestDetection = (highConfidenceDetections.length > 0 
//         ? highConfidenceDetections 
//         : detectionResult.detections
//       ).reduce((best, current) => {
//         const currentArea = current.boundingBox.width * current.boundingBox.height;
//         const bestArea = best.boundingBox.width * best.boundingBox.height;
//         return currentArea > bestArea ? current : best;
//       });

//       // Extract face region
//       const faceImageData = extractFaceRegion(detectionCanvas, detectionCtx, bestDetection);
//       if (!faceImageData) {
//         throw new Error('Failed to extract face region');
//       }

//       // Generate final composite
//       const resultImage = await compositeFaceOnDummy(faceImageData, dummyImage, options);
      
//       setPreviewImage(resultImage);
//       onImageGenerated?.(resultImage);

//     } catch (error) {
//       console.error('Image processing error:', error);
//       const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
//       onError?.(errorMessage);
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Public API for processing base64 images
//   const processBase64Image = useCallback((base64Image: string, options?: ProcessingOptions) => {
//     return processImage(base64Image, options);
//   }, [processImage]);

//   // File input handler
//   const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     if (!file) return;

//     if (!file.type.startsWith('image/')) {
//       onError?.('Please select a valid image file');
//       return;
//     }

//     if (file.size > 10 * 1024 * 1024) { // 10MB limit
//       onError?.('Image file is too large. Please select an image smaller than 10MB.');
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (e) => {
//       const base64 = e.target?.result as string;
//       processImage(base64);
//     };
//     reader.onerror = () => onError?.('Failed to read the selected file');
//     reader.readAsDataURL(file);
//   };

//   // Expose processBase64Image for parent components
//   React.useImperativeHandle(ref, () => ({
//     processBase64Image
//   }), [processBase64Image]);

//   return (
//     <div className={`face-composer ${className}`}>
//       {!isInitialized && (
//         <div className="initialization-notice">
//           Initializing face detection... Please wait.
//         </div>
//       )}
      
//       <div className="input-section">
//         <label htmlFor="face-input" className="file-input-label">
//           <input
//             id="face-input"
//             type="file"
//             accept="image/jpeg,image/jpg,image/png,image/webp"
//             onChange={handleFileInput}
//             disabled={isProcessing || !isInitialized}
//             className="file-input"
//           />
//           <span>{isProcessing ? 'Processing...' : 'Choose Face Image'}</span>
//         </label>
        
//         {isProcessing && (
//           <div className="processing-indicator">
//             <div className="spinner"></div>
//             Extracting and compositing face...
//           </div>
//         )}
//       </div>

//       <canvas ref={canvasRef} style={{ display: 'none' }} />

//       {previewImage && (
//         <div className="preview-section">
//           <h3>Generated Football Player</h3>
//           <img
//             src={previewImage}
//             alt="Generated football player"
//             className="preview-image"
//           />
//           <button
//             onClick={() => {
//               const link = document.createElement('a');
//               link.download = 'football-player.jpg';
//               link.href = previewImage;
//               link.click();
//             }}
//             className="download-button"
//           >
//             Download Image
//           </button>
//         </div>
//       )}

//       <style jsx>{`
//         .face-composer {
//           max-width: 600px;
//           margin: 0 auto;
//           padding: 20px;
//           font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
//         }
        
//         .initialization-notice {
//           background: #e3f2fd;
//           color: #1565c0;
//           padding: 12px;
//           border-radius: 8px;
//           text-align: center;
//           margin-bottom: 20px;
//         }
        
//         .input-section {
//           margin-bottom: 24px;
//         }
        
//         .file-input-label {
//           display: inline-block;
//           padding: 12px 24px;
//           background: #007bff;
//           color: white;
//           border-radius: 8px;
//           cursor: pointer;
//           transition: background-color 0.2s;
//           font-weight: 500;
//         }
        
//         .file-input-label:hover:not([disabled]) {
//           background: #0056b3;
//         }
        
//         .file-input {
//           display: none;
//         }
        
//         .file-input-label:has(.file-input:disabled) {
//           background: #6c757d;
//           cursor: not-allowed;
//         }
        
//         .processing-indicator {
//           display: flex;
//           align-items: center;
//           gap: 12px;
//           margin-top: 16px;
//           padding: 12px;
//           background: #f8f9fa;
//           border-radius: 8px;
//           color: #495057;
//         }
        
//         .spinner {
//           width: 20px;
//           height: 20px;
//           border: 2px solid #e9ecef;
//           border-top: 2px solid #007bff;
//           border-radius: 50%;
//           animation: spin 1s linear infinite;
//         }
        
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
        
//         .preview-section {
//           text-align: center;
//           padding: 24px;
//           background: #f8f9fa;
//           border-radius: 12px;
//           margin-top: 24px;
//         }
        
//         .preview-section h3 {
//           margin: 0 0 16px 0;
//           color: #333;
//           font-size: 1.25rem;
//         }
        
//         .preview-image {
//           max-width: 100%;
//           height: auto;
//           border-radius: 8px;
//           box-shadow: 0 4px 12px rgba(0,0,0,0.1);
//           margin-bottom: 16px;
//         }
        
//         .download-button {
//           background: #28a745;
//           color: white;
//           border: none;
//           padding: 10px 20px;
//           border-radius: 6px;
//           cursor: pointer;
//           font-weight: 500;
//           transition: background-color 0.2s;
//         }
        
//         .download-button:hover {
//           background: #1e7e34;
//         }
//       `}</style>
//     </div>
//   );
// };

// // Forward ref for imperative API
// const FaceComposerWithRef = React.forwardRef<
//   { processBase64Image: (base64: string, options?: ProcessingOptions) => void },
//   FaceComposerProps
// >((props, ref) => <FaceComposer {...props} ref={ref} />);

// FaceComposerWithRef.displayName = 'FaceComposer';

// export default FaceComposerWithRef;

// // Hook for programmatic usage
// export const useFaceComposer = () => {
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState<string>('');
//   const componentRef = useRef<{ processBase64Image: (base64: string, options?: ProcessingOptions) => void }>(null);

//   const processBase64Image = useCallback(async (
//     base64Image: string, 
//     options?: ProcessingOptions
//   ): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       setIsProcessing(true);
//       setError('');

//       const handleSuccess = (result: string) => {
//         setIsProcessing(false);
//         resolve(result);
//       };

//       const handleError = (errorMessage: string) => {
//         setIsProcessing(false);
//         setError(errorMessage);
//         reject(new Error(errorMessage));
//       };

//       // This would need to be handled differently in a real implementation
//       // You'd typically have the FaceComposer component rendered somewhere
//       // and call its methods through a ref
//       if (componentRef.current) {
//         componentRef.current.processBase64Image(base64Image, options);
//       } else {
//         reject(new Error('Face composer not initialized'));
//       }
//     });
//   }, []);

//   return {
//     processBase64Image,
//     isProcessing,
//     error,
//     componentRef
//   };
// };

// // Utility functions for image processing
// export const imageUtils = {
//   // Convert file to base64
//   fileToBase64: (file: File): Promise<string> => {
//     return new Promise((resolve, reject) => {
//       const reader = new FileReader();
//       reader.onload = () => resolve(reader.result as string);
//       reader.onerror = reject;
//       reader.readAsDataURL(file);
//     });
//   },

//   // Resize image while maintaining aspect ratio
//   resizeImage: (base64: string, maxWidth: number, maxHeight: number, quality: number = 0.9): Promise<string> => {
//     return new Promise(resolve => {
//       const img = new Image();
//       img.onload = () => {
//         const canvas = document.createElement('canvas');
//         const ctx = canvas.getContext('2d')!;
        
//         const ratio = Math.min(maxWidth / img.width, maxHeight / img.height);
//         canvas.width = img.width * ratio;
//         canvas.height = img.height * ratio;
        
//         ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//         resolve(canvas.toDataURL('image/jpeg', quality));
//       };
//       img.src = base64;
//     });
//   },

//   // Validate image format and size
//   validateImage: (file: File): { valid: boolean; error?: string } => {
//     const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
//     const maxSize = 10 * 1024 * 1024; // 10MB

//     if (!validTypes.includes(file.type)) {
//       return { valid: false, error: 'Invalid file type. Please use JPEG, PNG, or WebP.' };
//     }

//     if (file.size > maxSize) {
//       return { valid: false, error: 'File too large. Maximum size is 10MB.' };
//     }

//     return { valid: true };
//   }
// };

// // Example usage component
// export const FaceComposerExample: React.FC = () => {
//   const [result, setResult] = useState<string>('');
//   const [error, setError] = useState<string>('');
//   const faceComposerRef = useRef<{ processBase64Image: (base64: string, options?: ProcessingOptions) => void }>(null);

//   const handleImageGenerated = (base64Image: string) => {
//     setResult(base64Image);
//     // Here you would typically save to your backend
//     saveToBackend(base64Image);
//   };

//   const saveToBackend = async (base64Image: string) => {
//     try {
//       const response = await fetch('/api/save-football-player', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           image: base64Image,
//           timestamp: new Date().toISOString()
//         })
//       });

//       if (!response.ok) {
//         throw new Error('Failed to save image');
//       }

//       console.log('Image saved successfully');
//     } catch (error) {
//       console.error('Failed to save image:', error);
//       setError('Failed to save image to backend');
//     }
//   };

//   // Example of processing image programmatically
//   const processCustomImage = async (imageFile: File) => {
//     try {
//       const base64 = await imageUtils.fileToBase64(imageFile);
      
//       // Resize if too large
//       const resized = await imageUtils.resizeImage(base64, 1024, 1024, 0.9);
      
//       // Process with custom options
//       if (faceComposerRef.current) {
//         faceComposerRef.current.processBase64Image(resized, {
//           faceScale: 0.8,
//           positionY: 0.1,
//           maskSoftness: 0.3,
//           quality: 0.95
//         });
//       }
//     } catch (error) {
//       setError('Failed to process image');
//     }
//   };

//   return (
//     <div className="example-container">
//       <h2>Football Player Face Composer</h2>
      
//       <FaceComposerWithRef
//         ref={faceComposerRef}
//         dummyImageUrl="/dummy.png"
//         onImageGenerated={handleImageGenerated}
//         onError={setError}
//         className="custom-composer"
//       />

//       {error && (
//         <div className="error-message">
//           Error: {error}
//         </div>
//       )}

//       {result && (
//         <div className="result-section">
//           <h3>Ready to save:</h3>
//           <p>Image has been generated and saved to backend!</p>
//         </div>
//       )}

//       <style jsx>{`
//         .example-container {
//           max-width: 800px;
//           margin: 0 auto;
//           padding: 20px;
//         }
        
//         .error-message {
//           background: #f8d7da;
//           color: #721c24;
//           padding: 12px;
//           border-radius: 6px;
//           margin: 16px 0;
//           border: 1px solid #f5c6cb;
//         }
        
//         .result-section {
//           background: #d4edda;
//           color: #155724;
//           padding: 16px;
//           border-radius: 6px;
//           margin: 16px 0;
//           border: 1px solid #c3e6cb;
//         }
        
//         .custom-composer {
//           border: 1px solid #e0e0e0;
//           border-radius: 12px;
//           padding: 20px;
//         }
//       `}</style>
//     </div>
//   );
// };