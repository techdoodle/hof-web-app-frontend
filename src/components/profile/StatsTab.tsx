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
    <div className="flex-1 p-4 space-y-6">
      {/* Player Info Section */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="text-4xl font-bold text-white mb-2">
            {userData.playerCategory?.toUpperCase() || 'FWD'}
          </div>
          <div className="flex items-center gap-2 text-yellow-400 mb-4">
            <CheckIcon className="w-5 h-5" />
            <span className="text-white">Matches</span>
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

      {/* Calibration Message */}
      <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
        <div className="text-orange-400 font-medium mb-1">Your profile is uncalibrated</div>
        <div className="text-white">Play a match to calibrate</div>
      </div>

      {/* Locked Stats */}
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
          <LockIcon className="w-8 h-8 text-gray-500" />
        </div>
        <div className="text-white text-center">
          <div className="font-medium">Calibrate to unlock stats</div>
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