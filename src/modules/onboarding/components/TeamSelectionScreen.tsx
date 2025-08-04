import { useState, useEffect } from 'react';
import { Button } from '@/lib/ui/components/Button/Button';
import { TeamSelection, UserData, FootballTeam } from '../types';
import { OnboardingRepository } from '../repository/onboarding.repository';
import { useOnboardingTracking } from '@/hooks/useOnboardingTracking';

interface TeamSelectionScreenProps {
  onSubmit: (teamData: TeamSelection) => Promise<void>;
  isLoading: boolean;
  error?: Error | null;
  userData?: UserData;
}

export function TeamSelectionScreen({
  onSubmit,
  isLoading,
  error,
  userData,
}: TeamSelectionScreenProps) {
  const [selectedTeam, setSelectedTeam] = useState<number | null>(
    userData?.preferredTeam?.id || null
  );

  console.log('debugging selectedTeam', selectedTeam);
  console.log('debugging userData', userData?.preferredTeam);

  const [searchQuery, setSearchQuery] = useState('');
  const [topTeams, setTopTeams] = useState<FootballTeam[]>([]);
  const [searchResults, setSearchResults] = useState<FootballTeam[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(false);
  const { markOnboardingCompleted } = useOnboardingTracking();

  // Fetch top 9 teams on component mount
  useEffect(() => {
    const fetchTopTeams = async () => {
      setIsLoadingTeams(true);
      try {
        const repository = OnboardingRepository.getInstance();
        const teams = await repository.getTopTeams(9);
        setTopTeams(teams.slice(0, 9));
      } catch (error) {
        console.error('Failed to fetch top teams:', error);
        setTopTeams([]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    fetchTopTeams();
  }, []);

  // Search teams when query changes
  useEffect(() => {
    const searchTeams = async () => {
      // Only search if query has at least 3 characters
      if (!searchQuery.trim() || searchQuery.trim().length < 3) {
        setSearchResults([]);
        return;
      }

      setIsLoadingTeams(true);
      try {
        const repository = OnboardingRepository.getInstance();
        const teams = await repository.searchTeams(searchQuery);
        setSearchResults(teams);
      } catch (error) {
        console.error('Failed to search teams:', error);
        setSearchResults([]);
      } finally {
        setIsLoadingTeams(false);
      }
    };

    // Increased debounce to 500ms
    const debounceTimer = setTimeout(searchTeams, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  const handleSubmit = async () => {
    if (!selectedTeam) return;
    
    await onSubmit({
      preferredTeam: selectedTeam,
    }).then(() => {
        markOnboardingCompleted();
    });
  };

  const handleTeamSelect = (teamId: number) => {
    setSelectedTeam(teamId);
  };

  const displayTeams = searchQuery.trim() && searchQuery.trim().length >= 3 ? searchResults : topTeams;
  const showImages = !searchQuery.trim() || searchQuery.trim().length < 3;

  return (
    <div className="flex flex-col h-full">
      <div className="flex flex-col flex-1 min-h-0">
        <h1 className="text-2xl font-bold mb-2 text-white">
          Your favourite team
        </h1>

        {/* Search Input */}
        <div className="relative mb-6">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team (min 3 characters)"
            className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-700 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Teams Grid/List */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {isLoadingTeams ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {showImages ? (
                // Grid layout for top teams with images - fixed uniform size
                <div className="grid grid-cols-3 gap-4 mb-2">
                  {displayTeams.map((team, idx) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className={`relative w-full h-30 flex flex-col items-center justify-center p-2 rounded-2xl border-2 transition-all ${
                        selectedTeam === team.id
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-700 bg-gray-800/50 hover:border-gray-600'
                      }`}
                    >
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.teamName}
                          className="w-12 h-12 object-contain mb-2 flex-shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center mb-2 flex-shrink-0">
                          <span className="text-xs font-bold text-gray-300">
                            {team.teamName.substring(0, 2).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-center text-white leading-tight line-clamp-2">
                        {team.teamName}
                      </span>
                      {/* {selectedTeam === team.id && (
                        <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>
                      )} */}
                    </button>
                  ))}
                </div>
              ) : (
                // List layout for search results (text only)
                <div className="space-y-2">
                  {displayTeams.map((team) => (
                    <button
                      key={team.id}
                      onClick={() => handleTeamSelect(team.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-all ${
                        selectedTeam === team.id
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-700 bg-gray-800/50 text-white hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{team.teamName}</span>
                        <span className="text-sm text-gray-400">({team.country})</span>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 transition-all ${
                          selectedTeam === team.id
                            ? 'border-primary bg-primary'
                            : 'border-gray-500'
                        }`}
                      >
                        {/* {selectedTeam === team.id && (
                          <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full" />
                          </div>
                        )} */}
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {displayTeams.length === 0 && !isLoadingTeams && (
                <div className="text-center py-8 text-gray-400">
                  {searchQuery.trim() && searchQuery.trim().length >= 3 ? 'No teams found' : 'No teams available'}
                </div>
              )}
            </>
          )}
        </div>

        {error && (
          <div className="text-red-500 text-sm mb-4">
            {error.message}
          </div>
        )}
      </div>

      <div className="mt-4 fixed bottom-0 left-0 right-0 p-4">
        <Button
          onClick={handleSubmit}
          disabled={!selectedTeam || isLoading}
          isLoading={isLoading}
          variant="gradient"
          size="lg"
        >
          Continue
        </Button>
      </div>
    </div>
  );
} 