import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';
import { getAccessToken } from './auth';

export interface ImageUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * ImageUploadService - Handles image upload and validation
 * 
 * VALIDATION STRATEGY:
 * - Frontend: Basic checks only (file type, size)
 * - Backend: Proper face detection using Python CV libraries
 * 
 * Why we don't do face validation in frontend:
 * - JavaScript-based face detection is unreliable
 * - Cannot distinguish between objects (cakes, toys) and real faces
 * - Backend has proper OpenCV/CV2 for accurate detection
 * 
 * The backend Python service will:
 * - Detect if there's a valid human face
 * - Extract face with proper boundaries
 * - Remove background
 * - Return error if no valid face found
 */
export class ImageUploadService {
    private static repository = OnboardingRepository.getInstance();

    /**
     * Validates and uploads an image (base64 or File)
     * - Frontend: File type and size validation only
     * - Backend: Face detection and processing
     */
    static async validateAndUpload(
        input: string | File,
        options: {
            requireValidation?: boolean;
            updateProfile?: boolean;
        } = {}
    ): Promise<ImageUploadResult> {
        const { requireValidation = true, updateProfile = false } = options;

        try {
            // Step 1: Validate file type if it's a File object
            if (input instanceof File) {
                const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
                if (!validTypes.includes(input.type)) {
                    return {
                        success: false,
                        error: 'Invalid file type. Please upload a JPEG or PNG image.'
                    };
                }

                // Check file size (max 10MB)
                const maxSize = 10 * 1024 * 1024; // 10MB
                if (input.size > maxSize) {
                    return {
                        success: false,
                        error: 'File is too large. Maximum size is 10MB.'
                    };
                }
            }

            // Step 2: Convert to base64 if needed
            const base64Image = await this.toBase64(input);

            // Step 3: Basic client-side checks only (file type & size already done above)
            // Skip unreliable JS-based face detection - let backend Python service handle it
            // The backend uses proper CV libraries for accurate face detection

            console.log('Basic validation passed, sending to backend for face detection...');

            // Step 4: Get auth token
            const token = getAccessToken();
            if (!token) {
                return {
                    success: false,
                    error: 'Authentication required. Please log in again.'
                };
            }

            // Step 5: Send to backend (Python service with proper face detection)
            console.log('Sending to backend for processing and face detection...');
            let result: { url: string; success?: boolean; message?: string };

            try {
                if (updateProfile) {
                    // For edit profile: send as base64 and update user profile immediately
                    result = await this.repository.processProfilePictureBase64(base64Image, token);
                } else {
                    // For onboarding: process only, save to profile later
                    result = await this.repository.processOnlyProfilePictureBase64(base64Image, token);
                }
            } catch (backendError: any) {
                console.error('Backend processing error:', backendError);

                // Handle backend errors
                const errorMsg = backendError?.message?.toLowerCase() || '';

                if (errorMsg.includes('face') || errorMsg.includes('detect')) {
                    return {
                        success: false,
                        error: 'No valid face detected in the image. Please upload a clear selfie showing your face, ears, and shoulders.'
                    };
                } else if (errorMsg.includes('unavailable') || errorMsg.includes('service')) {
                    return {
                        success: false,
                        error: 'Image processing service is temporarily unavailable. Please try again later.'
                    };
                } else {
                    return {
                        success: false,
                        error: 'Failed to process image. Please ensure it\'s a clear selfie and try again.'
                    };
                }
            }

            // Check if backend processing actually succeeded
            if (!result || !result.url || result.url.length === 0 || result.success === false) {
                const errorMsg = result?.message || 'No valid face detected in image';
                return {
                    success: false,
                    error: `Image validation failed: ${errorMsg}. Please upload a clear selfie showing your face, ears, and shoulders.`
                };
            }

            console.log('Backend processing successful:', result.url);
            return {
                success: true,
                url: result.url
            };
        } catch (error) {
            console.error('Image upload failed:', error);

            // Provide user-friendly error messages
            let errorMessage = '';

            if (error instanceof Error) {
                const errorMsg = error.message.toLowerCase();

                if (errorMsg.includes('timeout')) {
                    errorMessage = 'Request timed out. Please check your internet connection and try again.';
                } else if (errorMsg.includes('network')) {
                    errorMessage = 'Network error. Please check your internet connection.';
                } else if (errorMsg.includes('unavailable') || errorMsg.includes('service')) {
                    errorMessage = 'Image processing service is temporarily unavailable. Please try again later.';
                } else if (errorMsg.includes('face') || errorMsg.includes('detect')) {
                    errorMessage = 'No valid face detected. Please upload a clear selfie showing your face, ears, and shoulders.';
                } else if (errorMsg.includes('validation') || errorMsg.includes('invalid')) {
                    errorMessage = 'Image validation failed. Please upload a photo showing your face, ears, and shoulders clearly.';
                } else if (errorMsg.includes('unauthorized') || errorMsg.includes('token')) {
                    errorMessage = 'Authentication error. Please log in again.';
                } else {
                    errorMessage = 'Failed to process image. Please try again or use the camera option.';
                }
            } else {
                errorMessage = 'Failed to process image. Please try again or use the camera option.';
            }

            return {
                success: false,
                error: errorMessage
            };
        }
    }

    /**
     * Convert File to base64 or keep base64 string
     */
    private static async toBase64(input: string | File): Promise<string> {
        if (typeof input === 'string') {
            return input;
        }

        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(input);
        });
    }
}

