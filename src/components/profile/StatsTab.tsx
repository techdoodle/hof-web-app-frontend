import { UserData } from '@/modules/onboarding/types';
import { RadarChart } from './RadarChart';
import { CheckIcon, LockIcon, TrophyIcon } from '@/components/icons';
import { ProfilePicture } from './ProfilePicture';
import FaceSwapComponent from './FaceSwap';

interface StatsTabProps {
  userData: UserData;
}

// Mock data - in real app this would come from API
const mockStats = {
  isCalibrated: false, // Change to true to see calibrated view
  rank: 24,
  position: 'FWD',
  goals: 2,
  assists: 4,
  matches: 343,
  passes: 8,
  tackles: 33,
  interceptions: 44,
  mvps: 32,
  passingAccuracy: 99,
  shotsAttempted: 44,
  shotsAccuracy: 23,
  attributes: {
    shooting: 85,
    dribbling: 78,
    passing: 92,
    defending: 65,
    physical: 88
  }
};

export function StatsTab({ userData }: StatsTabProps) {
  const stats = mockStats; // In real app, fetch from API based on userData

  if (!stats.isCalibrated) {
    return <UncalibratedStats userData={userData} />;
  }

  return <CalibratedStats userData={userData} stats={stats} />;
}

function UncalibratedStats({ userData }: { userData: UserData }) {
  return (
    <div className="flex-1 p-4 space-y-6 mt-[46px]">
      {/* Player Info Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1 mt-[-46px]">
          <div className="text-4xl font-bold text-white mb-2">
            {userData.playerCategory?.toUpperCase() || 'FWD'}
          </div>
          <div className="text-yellow-400 flex items-baseline gap-2 text-yellow-400 mb-4">
            <span className=" text-4xl">0</span>
            <span className=" text-md">Matches</span>
          </div>
        </div>
        
        {/* Player Image with Jersey Overlay */}
        <div className="relative flex flex-col items-center">
          <div className="relative flex flex-col items-center">
            {/* Jersey as base */}
            <img
              src="/dummy.png"
              alt="Jersey"
              className="w-58 sm:w-48 md:w-56"
            />
            
            {/* Profile picture overlay */}
            {userData.profilePicture ? (
              <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
                <img
                  src={userData.profilePicture}
                  alt="Profile"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover shadow-lg"
                />
                {/* <button
                  onClick={() => {
                    // TODO: Implement edit profile picture functionality
                    console.log('Edit profile picture clicked');
                  }}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-primary transition-colors"
                  title="Change Photo"
                >
                  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 2 20l.5-5L16.5 3.5z" />
                  </svg>
                </button> */}
              </div>
            ) : (
              <button
                onClick={() => {
                  // TODO: Implement add profile picture functionality
                  console.log('Add profile picture clicked');
                }}
                className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-black/60 hover:border-primary/50 transition-colors"
              >
                <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                  <circle cx="12" cy="13" r="3"/>
                </svg>
                <span className="text-sm text-white">Add Photo</span>
              </button>
            )}
          </div>
          
          {/* Player Name */}
          {/* <div className="text-center mt-2">
            <h2 className="text-xl font-bold text-white">
              {userData.firstName} {userData.lastName}
            </h2>
          </div> */}
        </div>
      </div>

      {/* Calibration Message */}
      <div 
        className=" rounded-lg p-10  flex flex-col items-center justify-center text-center"
        style={{
          width: '362px',
          height: '141px',
          top: '261px',
          left: '7px',
          borderRadius: '16px',
          borderWidth: '1px',
          borderStyle: 'solid',
          borderColor: '#374151',
          backgroundColor: '#0B1E19',
          gap: '10px'
        }}
      >
        <div className="text-orange-400 mb-1">Your profile is uncalibrated</div>
        <div className="text-white  font-small ">Play a match to calibrate</div>
      </div>

      {/* Locked Stats */}
      <div 
        className="flex flex-col items-center justify-center py-12 space-y-4"
       
      >
        <div className="w-16 h-16  rounded-full flex items-center justify-center">
          <img src="/lock.svg" alt="Lock" className="w-12 h-12" />
        </div>
        <div className="text-white text-center">
          <div 
            className="font-medium"
            style={{
              fontFamily: 'Rajdhani',
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '100%',
              letterSpacing: '0%'
            }}
          >
            Calibrate to unlock stats
          </div>
        </div>
      </div>
    </div>
  );
}

function CalibratedStats({ userData, stats }: { userData: UserData; stats: any }) {
  return (
    <div className="flex-1 p-4 space-y-6">
      {/* Rank Section */}
      <div className="flex justify-end">
        <div className="text-right">
          <div className="text-white text-sm">You are</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">Rank {stats.rank}</span>
            <TrophyIcon className="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Player Info Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-4xl font-bold text-white mb-4">
            {stats.position}
          </div>
          <div className="space-y-2">
            <div className="text-2xl text-white">
              <span className="text-3xl font-bold text-yellow-400">{stats.goals}</span> Goals
            </div>
            <div className="text-2xl text-white">
              <span className="text-3xl font-bold text-yellow-400">{stats.assists}</span> Assist
            </div>
          </div>
        </div>
        
        {/* Player Image */}
        <div className="relative">
          <ProfilePicture
            imageUrl={userData.profilePicture || undefined}
            userName={`${userData.firstName} ${userData.lastName}`}
            size="md"
          />
          {/* <FaceSwapComponent imageUrl={userData.profilePicture || undefined} /> */}
          
          {/* Player Name */}
          <div className="text-center mt-2">
            <h2 className="text-xl font-bold text-white">
              {userData.firstName} {userData.lastName}
            </h2>
          </div>
        </div>
      </div>

      {/* Stats Table */}
      <div className="bg-gray-800 rounded-lg p-4 border border-primary">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white">Matches</span>
              <span className="text-primary font-semibold">{stats.matches}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Passes</span>
              <span className="text-primary font-semibold">{stats.passes}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Tackles</span>
              <span className="text-primary font-semibold">{stats.tackles}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Interception</span>
              <span className="text-primary font-semibold">{stats.interceptions}</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white">MVPS</span>
              <span className="text-primary font-semibold">{stats.mvps}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Passing Acc</span>
              <span className="text-primary font-semibold">{stats.passingAccuracy}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Shots Attemp</span>
              <span className="text-primary font-semibold">{stats.shotsAttempted}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white">Shots Acc</span>
              <span className="text-primary font-semibold">{stats.shotsAccuracy}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Radar Chart */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <RadarChart data={stats.attributes} />
      </div>
    </div>
  );
} 