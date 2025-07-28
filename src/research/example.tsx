// // pages/face-composer.tsx or app/face-composer/page.tsx
// import FaceComposer from './FaceComposer';

// export default function FaceComposerPage() {
//   const handleImageGenerated = async (base64Image: string) => {
//     // Save to your backend
//     const response = await fetch('/api/save-image', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({ image: base64Image })
//     });
    
//     if (response.ok) {
//       console.log('Image saved successfully!');
//     }
//   };

//   const handleError = (error: string) => {
//     console.error('Face composition error:', error);
//     // Handle error (show toast, etc.)
//   };

//   return (
//     <div>
//       <h1>Create Football Player Avatar</h1>
//       <FaceComposer
//         dummyImageUrl="/dummy.png"
//         onImageGenerated={handleImageGenerated}
//         onError={handleError}
//       />
//     </div>
//   );
// }