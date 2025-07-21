import { useState, useRef, useEffect } from 'react';
import { faceDetector, FaceDetectionResult } from '@/lib/utils/faceDetection';

interface CameraSelfieModalProps {
  onCapture: (imageData: string) => void;
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

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

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

          if (detectionResult.hasFace && detectionResult.hasNeck && detectionResult.confidence > 0.3) {
            // Face and neck detected, proceed with capture
            onCapture(imageData);
            stopCamera();
          } else {
            // Show validation error
            setShowValidationError(true);
            setTimeout(() => setShowValidationError(false), 3000);
          }
        } catch (err) {
          console.error('Face detection error:', err);
          // If face detection fails, still allow capture
          onCapture(imageData);
          stopCamera();
        }
      }
      
      setIsProcessing(false);
    }
  };

  const getValidationMessage = () => {
    if (!faceDetectionResult) return 'Please ensure your face is visible';
    
    if (!faceDetectionResult.hasFace) {
      return 'No face detected. Please position your face in the frame.';
    }
    
    if (!faceDetectionResult.hasNeck) {
      return 'Please ensure your neck is visible in the frame.';
    }
    
    if (faceDetectionResult.confidence < 0.3) {
      return 'Face detection confidence is low. Please improve lighting.';
    }
    
    return 'Please ensure your face and neck are clearly visible.';
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
                  Please make sure your face and neck are clearly visible in the frame
                </p>
              </div>

              {/* Face Frame */}
              <div className="w-[90vw] h-[70vh] border-4 border-blue-400 rounded-full opacity-80 relative">
                {/* Corner guides */}
                <div className="absolute -top-2 -left-2 w-8 h-8 border-l-4 border-t-4 border-blue-400 rounded-tl-lg"></div>
                <div className="absolute -top-2 -right-2 w-8 h-8 border-r-4 border-t-4 border-blue-400 rounded-tr-lg"></div>
                <div className="absolute -bottom-2 -left-2 w-8 h-8 border-l-4 border-b-4 border-blue-400 rounded-bl-lg"></div>
                <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r-4 border-b-4 border-blue-400 rounded-br-lg"></div>
              </div>
            </div>
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
              disabled={isLoading || !!error || isProcessing}
              className="w-20 h-20 bg-white rounded-full border-4 border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              <div className="w-16 h-16 bg-white rounded-full border-2 border-gray-400"></div>
            </button>
          </div>
        </div>

        {/* Hidden canvas for capturing */}
        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
} 