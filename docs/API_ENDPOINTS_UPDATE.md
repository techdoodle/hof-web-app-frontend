# 🔄 Updated API Endpoints Structure

## **Backend Endpoints (NestJS)**

### **User Management**
- `PATCH /users/:id` - **Update user data** (gender, profile info, etc.)
  - Used for all user updates including gender selection
  - Requires user ID as parameter
  - Takes any user data in request body

### **Profile Picture Processing**
- `POST /users/profile-picture/upload` - **Upload and process file**
  - Processes uploaded file and saves to user profile
  - Updates user record automatically
  
- `POST /users/profile-picture/process-base64` - **Process base64 and save**
  - Processes base64 image and saves to user profile
  - Updates user record automatically
  
- `POST /users/profile-picture/process-only-base64` - **Process base64 only**
  - Processes base64 image but doesn't save to profile
  - Returns processed image URL for preview
  - Used in onboarding flow before final submission

## **Updated Workflow**

### **Gender Selection Flow**
1. User selects gender
2. User takes selfie (optional)
3. Image gets processed via `/users/profile-picture/process-only-base64`
4. User clicks "Continue"
5. Gender + processed image URL sent via `PATCH /users/:id`

### **Profile Picture Processing Options**

#### **Option 1: Process and Save Immediately**
```typescript
// For direct profile picture updates
await repository.processProfilePictureBase64(imageData, token);
// This automatically saves to user profile
```

#### **Option 2: Process Only (Preview)**
```typescript
// For onboarding flow - process but don't save yet
await repository.processOnlyProfilePictureBase64(imageData, token);
// Returns processed image for preview
// Save later via PATCH /users/:id
```

## **Frontend Repository Updates**

### **OnboardingRepository Methods**
```typescript
// User updates (gender, profile info)
updateUserInfo(userInfo: UserInfo, userId: number, token: string)
updateGenderSelection(genderData: GenderSelection, userId: number, token: string)

// Profile picture processing
uploadProfilePicture(file: File, token: string) // Process and save
processProfilePictureBase64(imageData: string, token: string) // Process and save
processOnlyProfilePictureBase64(imageData: string, token: string) // Process only
```

## **Benefits of New Structure**

✅ **Cleaner API Design**
- Follows RESTful conventions
- Separates concerns (user updates vs image processing)

✅ **Flexible Image Processing**
- Can process images without saving to profile
- Allows for preview functionality
- Better user experience in onboarding

✅ **Consistent User Updates**
- All user data updates use the same PATCH endpoint
- Easier to maintain and extend

✅ **Better Error Handling**
- Clear separation of image processing vs data updates
- More specific error messages

## **Migration Notes**

### **Old Endpoints (Removed)**
- `POST /users/profile` ❌
- `POST /users/profile/gender` ❌
- `POST /users/profile/picture/base64` ❌

### **New Endpoints**
- `PATCH /users/:id` ✅ (for all user updates)
- `POST /users/profile-picture/process-only-base64` ✅ (for preview)
- `POST /users/profile-picture/process-base64` ✅ (process and save)

This structure is more maintainable and follows REST API best practices! 