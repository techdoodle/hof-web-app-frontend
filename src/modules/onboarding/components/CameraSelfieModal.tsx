import { useState, useRef, useEffect } from 'react';
import { faceValidator, FaceValidationResult } from '@/lib/utils/faceValidation';

interface CameraSelfieModalProps {
  onCapture: (originalImage: string, processedImage: string, faceBounds: { x: number, y: number, width: number, height: number }) => void;
  onClose: () => void;
}

export function CameraSelfieModal({ onCapture, onClose }: CameraSelfieModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationResult, setValidationResult] = useState<FaceValidationResult | null>(null);
  const [showValidationError, setShowValidationError] = useState(false);
  const [cameraMode, setCameraMode] = useState<'front' | 'back'>('front');
  const [guidanceMessage, setGuidanceMessage] = useState('Position your face in the frame');

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [cameraMode]);

  // Real-time validation for guidance
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (videoRef.current && !isLoading && !error) {
      intervalId = setInterval(async () => {
        await performRealTimeValidation();
      }, 2000); // Check every 2 seconds to reduce performance impact
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isLoading, error]);

  const performRealTimeValidation = async () => {
    if (videoRef.current && canvasRef.current && !isProcessing) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = canvas.toDataURL('image/jpeg', 0.6);

        try {
          const result = await faceValidator.validateFace(imageData);
          setValidationResult(result);
          setGuidanceMessage(result.message);
        } catch (err) {
          // Ignore real-time validation errors
        }
      }
    }
  };

  const startCamera = async () => {
    try {
      stopCamera(); // Stop existing stream first

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
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
      setStream(null);
    }
  };

  const switchCamera = async () => {
    setCameraMode(prev => prev === 'front' ? 'back' : 'front');
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
        const imageData = canvas.toDataURL('image/jpeg', 0.9);

        try {
          // Validate face in the captured image
          const result = await faceValidator.validateFace(imageData);
          setValidationResult(result);

          // Only proceed if all validations pass
          if (result.hasFace && result.hasEars && result.hasShoulders && result.confidence > 0.7) {
            onCapture(imageData, imageData, { x: 0, y: 0, width: canvas.width, height: canvas.height });
            stopCamera();
          } else {
            setShowValidationError(true);
            setTimeout(() => setShowValidationError(false), 4000);
          }
        } catch (err) {
          console.error('Face validation error:', err);
          setValidationResult({
            hasFace: false,
            hasEars: false,
            hasShoulders: false,
            confidence: 0,
            message: 'Validation failed. Please try again.'
          });
          setShowValidationError(true);
          setTimeout(() => setShowValidationError(false), 3000);
        }
      }

      setIsProcessing(false);
    }
  };

  const getValidationMessage = () => {
    if (!validationResult) return 'Please position your face properly';

    if (!validationResult.hasFace) {
      return 'No face detected. Please position your face in the center of the frame.';
    }

    if (!validationResult.hasEars) {
      return 'Ears not visible. Please show both ears.';
    }

    if (!validationResult.hasShoulders) {
      return 'Shoulders not visible. Please include upper body.';
    }

    if (validationResult.confidence <= 0.7) {
      return 'Image quality is too low. Please ensure good lighting and focus.';
    }

    return 'Please position your face properly in the frame.';
  };

  const isReadyToCapture = validationResult?.hasFace &&
    validationResult?.hasEars &&
    validationResult?.hasShoulders &&
    validationResult?.confidence > 0.7;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center">
      <div className="relative w-full h-full bg-gray-900">
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
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>
            {/* <h2 className="text-white text-lg font-semibold">Profile Photo</h2> */}
            <button
              onClick={switchCamera}
              className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </button>
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
            style={{ transform: cameraMode === 'back' ? 'scaleX(-1)' : 'none' }}
          />

          {/* Skeleton Frame Guide */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              {/* Instructions */}
              <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 text-center">
                <h3 className="mt-2 text-white text-xl font-bold mb-2">Take a selfie</h3>
                {/* <p className="text-gray-300 text-sm">
                  Position your head, face, neck, shoulders and partial chest in the frame
                </p> */}
              </div>

              {/* Main Frame */}
              <div className={`w-80 min-h-[60dvh] border-4 rounded-2xl opacity-90 transition-colors duration-300 ${isReadyToCapture ? 'border-green-400' : 'border-blue-400'
                }`}>
                {/* Corner guides */}
                <div className={`absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 rounded-tl-lg transition-colors duration-300 ${isReadyToCapture ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                <div className={`absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 rounded-tr-lg transition-colors duration-300 ${isReadyToCapture ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                <div className={`absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 rounded-bl-lg transition-colors duration-300 ${isReadyToCapture ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 rounded-br-lg transition-colors duration-300 ${isReadyToCapture ? 'border-green-400' : 'border-blue-400'
                  }`}></div>
              </div>
            </div>
          </div>

          {/* Real-time Guidance Message */}
          <div className="absolute top-4 left-4 right-4 bg-black bg-opacity-70 rounded-lg p-3 text-white text-center text-sm">
            <p className="font-medium">{guidanceMessage}</p>
            {validationResult && (
              <div className="mt-2 flex justify-center space-x-3 text-xs">
                <span className={validationResult.hasFace ? 'text-green-400' : 'text-red-400'}>
                  Face: {validationResult.hasFace ? '✓' : '✗'}
                </span>
                <span className={validationResult.hasEars ? 'text-green-400' : 'text-red-400'}>
                  Ears: {validationResult.hasEars ? '✓' : '✗'}
                </span>
                <span className={validationResult.hasShoulders ? 'text-green-400' : 'text-red-400'}>
                  Shoulders: {validationResult.hasShoulders ? '✓' : '✗'}
                </span>
                <span className={validationResult.confidence > 0.7 ? 'text-green-400' : 'text-orange-400'}>
                  Quality: {Math.round(validationResult.confidence * 100)}%
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
                !isReadyToCapture
              }
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center transition-all duration-300 ${isReadyToCapture && !isLoading && !error && !isProcessing
                ? 'bg-green-500 border-green-400 hover:bg-green-600 hover:scale-110'
                : 'bg-white border-gray-300 hover:bg-gray-100 disabled:opacity-50'
                }`}
            >
              <div className={`w-16 h-16 rounded-full border-2 transition-colors duration-300 ${isReadyToCapture && !isLoading && !error && !isProcessing
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
              <p className={`text-xs font-medium ${isReadyToCapture && !isLoading && !error && !isProcessing
                ? 'text-green-400'
                : 'text-gray-400'
                }`}>
                {isProcessing ? 'Processing...' :
                  isReadyToCapture && !isLoading && !error && !isProcessing
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