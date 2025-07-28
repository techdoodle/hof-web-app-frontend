'use client';

import { AuthWrapper } from '@/components/auth/AuthWrapper';
import { UserData } from '@/modules/onboarding/types';

export default function LandingPage() {
  return (
    <AuthWrapper>
      {(userData: UserData) => (
        <div className="flex flex-col items-center justify-center min-h-screen w-full bg-background p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">Welcome to HOF!</h1>
            
            <div className="space-y-4">
              <div className="text-center">
                {userData.profilePicture && (
                  <img
                    src={userData.profilePicture}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mx-auto mb-4 object-cover"
                  />
                )}
                <h2 className="text-xl font-semibold text-gray-800">
                  {userData.firstName} {userData.lastName}
                </h2>
                <p className="text-gray-600">@{userData.username || 'No username'}</p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700 mb-2">Profile Info</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Phone:</span> {userData.phoneNumber}</p>
                  <p><span className="font-medium">Email:</span> {userData.email || 'Not provided'}</p>
                  <p><span className="font-medium">City:</span> {userData.city ? userData.city.cityName : 'Not provided'}</p>
                  <p><span className="font-medium">Gender:</span> {userData.gender}</p>
                  <p><span className="font-medium">Position:</span> {userData.playerCategory || 'Not selected'}</p>
                  <p><span className="font-medium">Onboarding Complete:</span> {userData.onboardingComplete ? 'Yes' : 'No'}</p>
                </div>
              </div>

              <div className="text-center">
                <button 
                  className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                  onClick={() => {
                    // Add your navigation logic here
                    console.log('Find match clicked');
                  }}
                >
                  Find Match
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AuthWrapper>
  );
} 