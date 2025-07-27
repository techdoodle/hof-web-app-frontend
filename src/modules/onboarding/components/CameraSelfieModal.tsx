import { useState, useRef, useEffect } from 'react';
import { faceDetector, FaceDetectionResult } from '@/lib/utils/faceDetection';
import { realignFaceImage } from '@/lib/utils/imageUtils';

interface CameraSelfieModalProps {
  onCapture: (originalImage: string, processedImage: string, faceBounds: {x: number, y: number, width: number, height: number}) => void;
  onClose: () => void;
}

export function CameraSelfieModal({ onCapture, onClose }: CameraSelfieModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [faceDetectionResult, setFaceDetectionResult] = useState<FaceDetectionResult | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState('Position your face in the frame with both ears visible');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Real-time face detection for guidance
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (videoRef.current && !isLoading && !error) {
      intervalId = setInterval(async () => {
        await performRealTimeDetection();
      }, 1000); // Check every second
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, error]);

  const performRealTimeDetection = async () => {
    if (videoRef.current && canvasRef.current && !isProcessing) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/jpeg', 0.6); // Lower quality for real-time

        try {
          const detectionResult = await faceDetector.detectFace(imageData);
          setFaceDetectionResult(detectionResult);
          
          // Update guidance message based on real-time detection
          if (!detectionResult.hasFace) {
            setGuidanceMessage('No face detected. Position your face in the center of the frame.');
          } else if (!detectionResult.hasEars) {
            setGuidanceMessage('Both ears must be visible. Adjust your position or move back.');
          } else if (detectionResult.confidence < 0.75) {
            setGuidanceMessage('Face detection confidence is low. Ensure good lighting.');
          } else if (detectionResult.hasDisturbance) {
            setGuidanceMessage('Image quality is poor. Improve lighting and remove obstructions.');
          } else if (detectionResult.faceQuality === 'poor') {
            setGuidanceMessage('Face quality needs improvement. Better lighting and focus needed.');
          } else {
            setGuidanceMessage('Perfect! High quality face detected. Ready to capture!');
          }
        } catch (err) {
          // Ignore real-time detection errors
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user', // Front camera
          width: { ideal: 480 },
          height: { ideal: 640 }
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('Unable to access camera. Please check permissions.');
      setIsLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const validateAndCapture = async () => {
    if (videoRef.current && canvasRef.current) {
      setIsProcessing(true);
      setShowValidationError(false);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Draw the video frame to canvas
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert to base64 image data
        const imageData = canvas.toDataURL('image/jpeg', 0.8);

        try {
          // Detect face in the captured image
          const detectionResult = await faceDetector.detectFace(imageData);
          setFaceDetectionResult(detectionResult);
          
          // Update guidance message based on detection results
          if (!detectionResult.hasFace) {
            setGuidanceMessage('No face detected. Please position your face in the center of the frame.');
          } else if (!detectionResult.hasEars) {
            setGuidanceMessage('Both ears must be visible. Please adjust your position or move the camera back.');
          } else if (detectionResult.confidence < 0.75) {
            setGuidanceMessage('Face detection confidence is low. Ensure good lighting and clear visibility.');
          } else if (detectionResult.hasDisturbance) {
            setGuidanceMessage('Image quality is poor. Please ensure good lighting and remove any obstructions.');
          } else if (detectionResult.faceQuality === 'poor') {
            setGuidanceMessage('Face quality is not optimal. Please improve lighting and focus.');
          } else {
            setGuidanceMessage('Perfect! Face detected with high quality. You can now take the photo.');
          }

          // Stricter validation: require high confidence, both ears visible, no disturbance
          if (detectionResult.hasFace && 
              detectionResult.hasEars && 
              detectionResult.confidence > 0.75 && 
              !detectionResult.hasDisturbance &&
              detectionResult.faceQuality !== 'poor') {
            
            // Only proceed if we have a high-quality face with ears
            let finalImageData = imageData;
            if (detectionResult.landmarks && detectionResult.landmarks.length >= 2) {
              finalImageData = await realignFaceImage(imageData, detectionResult.landmarks);
            }
            onCapture(imageData, finalImageData, detectionResult.boundingBox || { x: 0, y: 0, width: 100, height: 100 }); // Keep original interface
            stopCamera();
          } else {
            // Show validation error and DO NOT proceed
            setShowValidationError(true);
            setTimeout(() => setShowValidationError(false), 4000); // Longer display time
          }
        } catch (err) {
          console.error('Face detection error:', err);
          // If face detection fails, DO NOT allow capture - show error instead
          setFaceDetectionResult({ hasFace: false, hasEars: false, confidence: 0, faceQuality: 'poor', hasDisturbance: true });
          setShowValidationError(true);
          setTimeout(() => setShowValidationError(false), 3000);
        }
      }
      
      setIsProcessing(false);
    }
  };

  const getValidationMessage = () => {
    if (!faceDetectionResult) return 'Please position your face properly';
    
    if (!faceDetectionResult.hasFace) {
      return 'No face detected. Please position your face in the center of the frame.';
    }
    
    if (!faceDetectionResult.hasEars) {
      return 'Both ears must be visible. Please adjust your position or move the camera back.';
    }
    
    if (faceDetectionResult.confidence <= 0.75) {
      return 'Face detection confidence is too low. Please ensure good lighting and clear visibility.';
    }
    
    if (faceDetectionResult.hasDisturbance) {
      return 'Image quality is poor. Please ensure good lighting and remove any obstructions.';
    }
    
    if (faceDetectionResult.faceQuality === 'poor') {
      return 'Face quality is not optimal. Please improve lighting and focus.';
    }
    
    return 'Please position your face properly in the frame with both ears visible.';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full max-w-md mx-auto bg-gray-900">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/50 to-transparent">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6L6 18"/>
                <path d="M6 6l12 12"/>
              </svg>
            </button>
            <h2 className="text-white text-lg font-semibold">Profile Photo</h2>
            <div className="w-10"></div>
          </div>
        </div>

        {/* Camera View */}
        <div className="relative w-full h-full flex flex-col">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p>Starting camera...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
              <div className="text-white text-center p-4">
                <p className="mb-4">{error}</p>
                <button
                  onClick={() => {
                    stopCamera();
                    onClose();
                  }}
                  className="px-4 py-2 bg-primary rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          {/* Face Frame Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Instructions */}
              <div className="absolute -top-20 left-1/2 transform -translate-x-1/2 text-center">
                <h3 className="text-white text-lg font-semibold mb-2">Take a selfie</h3>
                <p className="text-gray-300 text-sm">
                  Position your face with both ears clearly visible (no neck required)
                </p>
              </div>

              {/* Face Frame with Ear Guides */}
              <div className={`w-[90vw] h-[60vh] border-4 rounded-full opacity-80 relative transition-colors duration-300 ${
                faceDetectionResult?.hasFace && 
                faceDetectionResult?.hasEars && 
                faceDetectionResult?.confidence > 0.75 && 
                !faceDetectionResult?.hasDisturbance &&
                faceDetectionResult?.faceQuality !== 'poor'
                  ? 'border-green-400'
                  : 'border-blue-400'
              }`}>
                {/* Ear guides */}
                <div className="absolute -left-6 top-16 w-10 h-16 border-2 border-white border-dashed rounded-full opacity-50"></div>
                <div className="absolute -right-6 top-16 w-10 h-16 border-2 border-white border-dashed rounded-full opacity-50"></div>
                
                {/* Corner guides */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg transition-colors duration-300 ${
                  faceDetectionResult?.hasFace && 
                  faceDetectionResult?.hasEars && 
                  faceDetectionResult?.confidence > 0.75 && 
                  !faceDetectionResult?.hasDisturbance &&
                  faceDetectionResult?.faceQuality !== 'poor'
                    ? 'border-green-400'
                    : 'border-blue-400'
                }`}></div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg transition-colors duration-300 ${
                  faceDetectionResult?.hasFace && 
                  faceDetectionResult?.hasEars && 
                  faceDetectionResult?.confidence > 0.75 && 
                  !faceDetectionResult?.hasDisturbance &&
                  faceDetectionResult?.faceQuality !== 'poor'
                    ? 'border-green-400'
                    : 'border-blue-400'
                }`}></div>
                <div className={`absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg transition-colors duration-300 ${
                  faceDetectionResult?.hasFace && 
                  faceDetectionResult?.hasEars && 
                  faceDetectionResult?.confidence > 0.75 && 
                  !faceDetectionResult?.hasDisturbance &&
                  faceDetectionResult?.faceQuality !== 'poor'
                    ? 'border-green-400'
                    : 'border-blue-400'
                }`}></div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 rounded-br-lg transition-colors duration-300 ${
                  faceDetectionResult?.hasFace && 
                  faceDetectionResult?.hasEars && 
                  faceDetectionResult?.confidence > 0.75 && 
                  !faceDetectionResult?.hasDisturbance &&
                  faceDetectionResult?.faceQuality !== 'poor'
                    ? 'border-green-400'
                    : 'border-blue-400'
                }`}></div>
              </div>
            </div>
          </div>

          {/* Real-time Guidance Message */}
          <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-white text-center text-sm">
            <p className="font-medium">{guidanceMessage}</p>
            {faceDetectionResult && (
              <div className="mt-2 flex justify-center space-x-4 text-xs">
                <span className={faceDetectionResult.hasFace ? 'text-green-400' : 'text-red-400'}>
                  Face: {faceDetectionResult.hasFace ? '✓' : '✗'}
                </span>
                <span className={faceDetectionResult.hasEars ? 'text-green-400' : 'text-red-400'}>
                  Ears: {faceDetectionResult.hasEars ? '✓' : '✗'}
                </span>
                <span className={faceDetectionResult.confidence > 0.75 ? 'text-green-400' : 'text-orange-400'}>
                  Quality: {Math.round(faceDetectionResult.confidence * 100)}%
                </span>
              </div>
            )}
          </div>

          {/* Validation Error */}
          {showValidationError && (
            <div className="absolute top-24 left-4 right-4 bg-red-600 text-white p-3 rounded-lg text-center">
              <p className="text-sm font-medium">{getValidationMessage()}</p>
            </div>
          )}

          {/* Processing Indicator */}
          {isProcessing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p>Processing image...</p>
              </div>
            </div>
          )}

          {/* Capture Button */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <button
              onClick={validateAndCapture}
              disabled={
                isLoading || 
                !!error || 
                isProcessing || 
                !faceDetectionResult?.hasFace ||
                !faceDetectionResult?.hasEars ||
                faceDetectionResult?.confidence <= 0.75 ||
                faceDetectionResult?.hasDisturbance ||
                faceDetectionResult?.faceQuality === 'poor'
              }
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${
                faceDetectionResult?.hasFace && 
                faceDetectionResult?.hasEars && 
                faceDetectionResult?.confidence > 0.75 && 
                !faceDetectionResult?.hasDisturbance &&
                faceDetectionResult?.faceQuality !== 'poor' &&
                !isLoading && !error && !isProcessing
                  ? 'bg-green-500 border-green-400 hover:bg-green-600 hover:scale-110'
                  : 'bg-white border-gray-300 hover:bg-gray-100 disabled:opacity-50'
              }`}
            >
              <div className={`w-16 h-16 rounded-full border-2 transition-colors duration-300 ${
                faceDetectionResult?.hasFace && 
                faceDetectionResult?.hasEars && 
                faceDetectionResult?.confidence > 0.75 && 
                !faceDetectionResult?.hasDisturbance &&
                faceDetectionResult?.faceQuality !== 'poor' &&
                !isLoading && !error && !isProcessing
                  ? 'bg-white border-green-200'
                  : 'bg-white border-gray-400'
              }`}>
                {isProcessing && (
                  <div className="w-8 h-8 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                )}
              </div>
            </button>
            
            {/* Capture button status text */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <p className={`text-xs font-medium ${
                faceDetectionResult?.hasFace && 
                faceDetectionResult?.hasEars && 
                faceDetectionResult?.confidence > 0.75 && 
                !faceDetectionResult?.hasDisturbance &&
                faceDetectionResult?.faceQuality !== 'poor' &&
                !isLoading && !error && !isProcessing
                  ? 'text-green-400'
                  : 'text-gray-400'
              }`}>
                {isProcessing ? 'Processing...' : 
                 faceDetectionResult?.hasFace && 
                 faceDetectionResult?.hasEars && 
                 faceDetectionResult?.confidence > 0.75 && 
                 !faceDetectionResult?.hasDisturbance &&
                 faceDetectionResult?.faceQuality !== 'poor' &&
                 !isLoading && !error && !isProcessing
                   ? 'Tap to Capture'
                   : 'Adjust Position'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 