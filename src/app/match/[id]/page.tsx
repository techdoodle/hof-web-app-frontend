import MatchDetailsHeader from "@/components/match/MatchDetailsHeader";
import MatchPlayerProfile from "@/components/match/MatchPlayerProfile";
import { VenueDetails } from "@/components/match/VenueDetails";
import { StatsTable } from "@/components/profile/StatsTable";

interface MatchPageProps {
  params: {
    id: string;
  };
}

const MatchPage = ({ params }: MatchPageProps) => {
  const { id } = params;

  return (
    <div 
      className="match-details-page min-h-screen overflow-y-auto p-4 flex flex-col gap-4"
      style={{
        backgroundImage: 'url(/hof-background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <MatchDetailsHeader />
      <MatchPlayerProfile />
      <StatsTable stats={[]} />
      <VenueDetails />
    </div>
  );
};

export default MatchPage; 