import { UserData } from '@/modules/onboarding/types';
import { RadarChart } from './RadarChart';
import { ProfilePicture } from './ProfilePicture';
import { StatsTable } from './StatsTable';
import { positionAbbreviationMapping } from '@/utils/positionMapping';
import NameComponent from './NameComponent';

interface StatsTabProps {
  userData: UserData;
  stats: any;
  isLoading?: boolean;
  error?: any;
}

export function StatsTab({ userData, stats, isLoading, error }: StatsTabProps) {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex-1 p-4 space-y-3 mt-[46px]">
        <div className="flex items-center justify-center h-64">
          <div className="text-white">Loading stats...</div>
        </div>
      </div>
    );
  }

  // Handle error state
  // if (error) {
  //   return (
  //     <div className="flex-1 p-4 space-y-3 mt-[46px]">

  //       <div className="flex items-center justify-center h-64">
  //         <div className="text-yellow-400">Error loading stats. Please try again later.</div>
  //       </div>
  //     </div>
  //   );
  // }

  console.log('debugging statsssss', stats);

  if ((stats && Object.keys(stats?.detailedStats).length == 0) || error) {
    return <UncalibratedStats userData={userData} error={error || false} />;
  }

  return <CalibratedStats userData={userData} stats={stats} />;
}

function UncalibratedStats({ userData, error }: { userData: UserData, error: any }) {
  return (
    <div className="flex-1 p-4 space-y-3">
      <div className="flex-1" style={{ zIndex: 100, position: "relative", marginLeft: "10px" }}>
        <div className="text-4xl font-bold text-white mb-2 font-orbitron">
          {positionAbbreviationMapping[userData.playerCategory?.toUpperCase() as keyof typeof positionAbbreviationMapping] || 'STRIKER'}
        </div>
        <div className="text-yellow-400 flex items-baseline gap-2 text-yellow-400 mb-4">
          <span className=" text-4xl font-orbitron">{error ? '--' : '0'}</span>
          <span className=" text-md font-orbitron">Matches</span>
        </div>
      </div>
      {/* Player Info Section */}
      <div className="flex items-start justify-between" style={{ marginTop: '-120px', display: 'flex', justifyContent: 'end' }}>


        {/* Player Image with Jersey Overlay */}
        <div className="relative flex flex-col items-center" >
          {userData.profilePicture ? (
            <ProfilePicture
              key={`stats-profile-pic-${userData.id}-${userData.profilePicture || 'no-image'}`}
              imageUrl={userData.profilePicture || undefined}
              userName={`${userData.firstName} ${userData.lastName}`}
              size="lg"
            />
          ) : (
            <button
              onClick={() => {
                // TODO: Implement add profile picture functionality
                console.log('Add profile picture clicked');
              }}
              className="absolute -top-12 left-1/2 transform -translate-x-1/2 w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-dashed border-gray-400 flex flex-col items-center justify-center bg-black/60 hover:border-primary/50 transition-colors"
            >
              <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 mb-2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
              <span className="text-sm text-white">Add Photo</span>
            </button>
          )}
        </div>
      </div>

      {/* Calibration Message */}
      <div
        className="p-[1px] rounded-2xl w-full"
        style={{
          // marginTop: '-30px',
          position: 'relative',
          background: 'linear-gradient(169.22deg, rgba(169, 169, 169, 0) -1.94%, #FFFFFF 43.05%, #CBCBCB 66.97%, #747474 88.27%)',
        }}
      >
        <div className="py-8 px-4 text-center bg-[#0B1E19] rounded-2xl" >
          <div className="text-left mt-2 text-gradient-bg" style={{
            position: 'absolute',
            top: '-110px',
            left: '10px',
            gap: '5px',
            // left: '100px',
          }}>
            <h2 className="text-xxl font-bold text-[#AAAAAA] font-orbitron" style={{
              fontSize: '50px',
              // marginBottom: '10px',
              // marginLeft: '10px',
            }}>
              {userData.firstName}
            </h2>
            <h2 className="text-xl font-bold text-white font-orbitron" style={{
              fontSize: '50px',
            }}>
              {userData.lastName}
            </h2>
          </div>
          {!error && <>
            <div className="text-orange-400 text-sm font-bold">Your profile is uncalibrated</div>
            <div className="text-white text-sm ">Play a match to calibrate</div>
          </>}
          {error && <div className="text-orange-400 text-sm font-bold">Error loading stats. Please try again later.</div>}

        </div>
      </div>

      {/* Locked Stats */}
      {!error && <div
        className="flex flex-col items-center justify-center py-6 space-y-2"
      >
        <div className="w-16 h-16  rounded-full flex items-center justify-center">
          <img src="/lock.svg" alt="Lock" className="w-12 h-12" />
        </div>
        <div className="text-white text-center">
          <div
            className="font-medium"
            style={{
              fontWeight: 500,
              fontSize: '20px',
              lineHeight: '100%',
              letterSpacing: '0%'
            }}
          >
            Calibrate to unlock stats
          </div>
        </div>
      </div>}
    </div>
  );
}

function CalibratedStats({ userData, stats }: { userData: UserData; stats: any }) {
  // Get player position from userData
  const getPlayerPosition = (): 'GK' | 'DEF' | 'FWD' | undefined => {
    console.log('debugging userData', userData);
    if (userData?.playerCategory) {
      const category = userData.playerCategory.toUpperCase();
      if (category === 'GOALKEEPER') return 'GK';
      if (category === 'DEFENDER') return 'DEF';
      if (category === 'FORWARD' || category === 'FWD' || category === 'STRIKER') return 'FWD';
    }
    return undefined;
  };

  const playerPosition = getPlayerPosition();

  return (
    <div className="flex-1 p-4 space-y-3">
      <div className="flex-1" style={{ zIndex: 100, position: "relative", marginLeft: "10px" }}>
        <div className="text-4xl font-bold text-white mb-4 font-orbitron">
          {playerPosition}
          {/* {positionAbbreviationMapping[userData.playerCategory?.toUpperCase() as keyof typeof positionAbbreviationMapping] || 'STRIKER'} */}
        </div>
        <div className="space-y-2">
          <div className="flex items-baseline">
            <span className="text-3xl text-[#FFA726] font-bold " style={{ width: '22px', textAlign: 'center' }}>{stats?.detailedStats?.impact?.totalGoals || 0}</span>
            <span className="text-lg font-bold text-[#FFA726] ml-2 font-orbitron">Goals</span>
          </div>
          <div className="flex items-baseline">
            <span className="text-3xl text-[#FFA726] font-bold" style={{ width: '22px', textAlign: 'center' }}>{stats?.detailedStats?.impact?.totalAssists || 0}</span>
            <span className="text-lg font-bold text-[#FFA726] ml-2 font-orbitron">Assists</span>
          </div>
        </div>
      </div>
      {/* Player Info Section */}
      <div className="flex items-start justify-between" style={{ marginTop: '-140px', display: 'flex', justifyContent: 'end' }}>

        {/* Player Image */}
        <div className="relative">
          <ProfilePicture
            key={`stats-profile-pic-2-${userData.id}-${userData.profilePicture || 'no-image'}`}
            imageUrl={userData.profilePicture || undefined}
            userName={`${userData.firstName} ${userData.lastName}`}
            size="lg"
          />
        </div>
      </div>
      <div className="text-center text-gradient-bg" style={{
        position: 'absolute',
        marginTop: '-30px',
        left: '24px',
        gap: '9px',
        flexWrap: "wrap",
        display: "flex",
        alignItems: "flex-start",
        flexDirection: "column",
      }}>
        <NameComponent firstName={userData.firstName} lastName={userData.lastName} />
      </div>

      {/* Stats Table */}
      <StatsTable stats={stats} screenName='profileStats' playerPosition={playerPosition} extraPadding={true} />

      {/* Radar Chart */}
      {stats?.spiderChart && <div className="radar chart">
        <RadarChart data={stats?.spiderChart} />
      </div>}
    </div>
  );
} 