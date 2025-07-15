# HOF Image Processing Workflow Documentation

## Overview

This document describes the complete image processing workflow for the HOF (Humans of Football) application. The workflow processes user selfies through multiple stages including face detection, pose detection, cropping, and background removal.

## Architecture

```
Frontend (Next.js) → Backend (NestJS) → Python Service → Processed Image
```

### Components

1. **Frontend (Next.js)**
   - `CameraSelfieModal`: Camera interface with face detection validation
   - `GenderSelectionScreen`: Main screen that triggers the workflow
   - `faceDetection.ts`: Client-side face detection utility

2. **Backend (NestJS)**
   - `ImageProcessingService`: Handles communication with Python service
   - `UserController`: API endpoints for image processing
   - File upload and base64 processing support

3. **Python Service (FastAPI)**
   - MediaPipe integration for pose and face detection
   - Image cropping from head to neck
   - Background removal using U-2-Net/rembg
   - Multiple processing endpoints

## Workflow Steps

### 1. Image Capture (Frontend)
- User opens camera modal
- Face detection validation ensures face and neck are visible
- Image captured as base64 data

### 2. Initial Validation (Frontend)
```typescript
const detectionResult = await faceDetector.detectFace(imageData);
if (detectionResult.hasFace && detectionResult.hasNeck && detectionResult.confidence > 0.3) {
  // Proceed with processing
}
```

### 3. Backend Processing (NestJS)
- Receives base64 image data
- Converts to buffer and sends to Python service
- Handles response and stores processed image

### 4. Python Service Processing
```python
# Step 1: Detect pose and face
pose_results, face_results = detect_pose_and_face(image)

# Step 2: Calculate crop boundaries
top, bottom, left, right = get_crop_boundaries(pose_results, face_results)

# Step 3: Crop image
cropped_image = crop_image(image, top, bottom, left, right)

# Step 4: Remove background
final_image = remove_background(cropped_image)
```

## API Endpoints

### Backend (NestJS)
- `POST /users/profile/picture/base64` - Process base64 image
- `POST /users/profile/picture` - Process uploaded file

### Python Service (FastAPI)
- `POST /process-selfie/` - Complete processing pipeline
- `POST /remove-background/` - Background removal only
- `POST /detect-pose/` - Pose detection only
- `GET /health` - Service health check

## Setup Instructions

### 1. Python Service Setup
```bash
cd hof-python-env
chmod +x start.sh
./start.sh
```

### 2. Backend Setup
```bash
cd hof-web-app-backend
npm install
npm run start:dev
```

### 3. Frontend Setup
```bash
cd hof-web
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PYTHON_SERVICE_URL=http://localhost:8001
```

### Python Service
No additional environment variables required.

## Dependencies

### Python Service
- `fastapi` - Web framework
- `mediapipe` - Pose and face detection
- `opencv-python` - Image processing
- `rembg` - Background removal
- `numpy` - Array operations
- `Pillow` - Image handling

### Backend
- `@nestjs/platform-express` - File upload support
- `multer` - File handling
- `form-data` - Form data creation
- `axios` - HTTP client

### Frontend
- Custom face detection utility
- Canvas API for image processing

## Processing Pipeline Details

### Face Detection (Frontend)
```typescript
// Basic skin tone detection
private isSkinTone(r: number, g: number, b: number): boolean {
  return (
    r > 95 && g > 40 && b > 20 &&
    r > g && r > b &&
    Math.abs(r - g) > 15
  );
}
```

### Pose Detection (Python)
```python
# MediaPipe pose detection
pose = mp_pose.Pose(
    static_image_mode=True,
    model_complexity=2,
    enable_segmentation=True,
    min_detection_confidence=0.5
)
```

### Cropping Logic
- Uses nose position to determine head top
- Uses shoulder positions to determine crop width
- Extends below shoulders to include neck
- Fallback to face detection if pose detection fails

### Background Removal
- Uses U-2-Net model via rembg library
- Maintains transparency
- Optimized for human subjects

## Error Handling

### Frontend
- Face detection validation with user feedback
- Fallback to original image if processing fails
- Loading states during processing

### Backend
- Proper HTTP status codes
- Detailed error messages
- Service availability checks

### Python Service
- Input validation
- Model initialization checks
- Graceful degradation

## Performance Considerations

1. **Model Loading**: Models are loaded once at startup
2. **Image Size**: Optimized for mobile camera resolutions
3. **Processing Time**: Typical processing takes 2-5 seconds
4. **Memory Usage**: Efficient buffer management

## Storage Options

Currently returns base64 data URLs. For production:

### Option 1: Cloud Storage (S3/Firebase)
```typescript
const s3Key = `profile-pictures/${Date.now()}.png`;
await this.s3Service.upload(s3Key, imageBuffer);
return `https://bucket.s3.amazonaws.com/${s3Key}`;
```

### Option 2: PostgreSQL Storage
```typescript
const imageRecord = await this.imageRepository.save({
  data: imageBuffer,
  mimeType: 'image/png',
  userId: user.id
});
return `/api/images/${imageRecord.id}`;
```

## Testing

### Manual Testing
1. Open camera modal
2. Ensure face and neck are visible
3. Capture image
4. Verify processing indicators
5. Check final result

### API Testing
```bash
# Test Python service
curl -X POST "http://localhost:8001/process-selfie/" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test_image.jpg"

# Test backend
curl -X POST "http://localhost:3000/users/profile/picture/base64" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"imageData": "data:image/jpeg;base64,..."}'
```

## Troubleshooting

### Common Issues

1. **Python service not starting**
   - Check Python version (3.8+)
   - Install dependencies: `pip install -r requirements.txt`
   - Check port availability

2. **Face detection not working**
   - Ensure good lighting
   - Check camera permissions
   - Verify face is in frame

3. **Background removal failing**
   - Check rembg model download
   - Verify sufficient memory
   - Check image format

4. **Processing timeout**
   - Increase timeout settings
   - Check service connectivity
   - Monitor service logs

### Logs
- Frontend: Browser console
- Backend: NestJS logs
- Python: FastAPI logs (uvicorn)

## Future Enhancements

1. **Advanced Face Detection**: Integration with more sophisticated models
2. **Real-time Processing**: WebSocket-based real-time processing
3. **Batch Processing**: Multiple image processing
4. **Quality Metrics**: Image quality assessment
5. **Caching**: Processed image caching
6. **Analytics**: Processing success/failure metrics

## Security Considerations

1. **Input Validation**: Proper image format validation
2. **File Size Limits**: Prevent large file uploads
3. **Rate Limiting**: Prevent abuse
4. **Authentication**: Secure API endpoints
5. **Data Privacy**: Secure image handling and storage 