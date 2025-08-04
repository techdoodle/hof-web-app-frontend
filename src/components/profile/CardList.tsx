import { UserMatch } from '@/hooks/useProfile';
import { ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CardListProps {
  matches?: UserMatch[];
}

const CardList = ({ matches }: CardListProps) => {

  const router = useRouter();
  if (!matches || matches.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400 font-rajdhani">No matches found</p>
      </div>
    );
  }

  console.log('debugging matches', matches);

  return (
    <div className="space-y-4">
      {matches.map((match, index) => (
        <div
          key={`${match.id}-${index}`}
          className="bg-[#0D1F1E] rounded-lg p-4 border border-gray-700 cursor-pointer"
          onClick={() => {
            router.push(`/match/${match.match.matchStatsId}`);
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-400 text-sm font-rajdhani">{match.timestamp}</p>
              <h3 className="text-white font-semibold font-rajdhani">{match.venue}</h3>
            </div>
            <div className="text-right">
              <ChevronRight className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardList;