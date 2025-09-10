'use client';

import { useState, useEffect } from 'react';
import { UserData, FootballTeam } from '@/modules/onboarding/types';
import { Button } from '@/lib/ui/components/Button/Button';
import { OnboardingRepository } from '@/modules/onboarding/repository/onboarding.repository';

interface EditTeamFormProps {
    userData: UserData;
    onSave: (teamId: number) => Promise<void>;
    onCancel: () => void;
    isLoading: boolean;
}

export function EditTeamForm({ userData, onSave, onCancel, isLoading }: EditTeamFormProps) {
    const [selectedTeam, setSelectedTeam] = useState<number | null>(
        userData.preferredTeam?.id || null
    );
    const [searchQuery, setSearchQuery] = useState('');
    const [topTeams, setTopTeams] = useState<FootballTeam[]>([]);
    const [searchResults, setSearchResults] = useState<FootballTeam[]>([]);
    const [isLoadingTeams, setIsLoadingTeams] = useState(false);

    // Fetch top teams on component mount
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

        const debounceTimer = setTimeout(searchTeams, 500);
        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedTeam) return;
        await onSave(selectedTeam);
    };

    const displayTeams = searchQuery.trim() && searchQuery.trim().length >= 3 ? searchResults : topTeams;
    const showImages = !searchQuery.trim() || searchQuery.trim().length < 3;

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-gray-400 text-sm mb-4">
                Choose your favourite football team
            </p>

            {/* Search Input */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search team (min 3 characters)"
                    className="w-full pl-10 pr-10 py-3 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Teams List */}
            <div className="max-h-60 overflow-y-auto">
                {isLoadingTeams ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <>
                        {showImages ? (
                            // Grid layout for top teams with images
                            <div className="grid grid-cols-3 gap-3">
                                {displayTeams.map((team) => (
                                    <button
                                        key={team.id}
                                        type="button"
                                        onClick={() => setSelectedTeam(team.id)}
                                        className={`relative w-full h-24 flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${selectedTeam === team.id
                                            ? 'border-primary bg-primary/10'
                                            : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                                            }`}
                                    >
                                        {team.logoUrl ? (
                                            <img
                                                src={team.logoUrl}
                                                alt={team.teamName}
                                                className="w-8 h-8 object-contain mb-1 flex-shrink-0"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
                                                <span className="text-xs font-bold text-gray-300">
                                                    {team.teamName.substring(0, 2).toUpperCase()}
                                                </span>
                                            </div>
                                        )}
                                        <span className="text-xs text-center text-white leading-tight line-clamp-2">
                                            {team.teamName}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            // List layout for search results
                            <div className="space-y-2">
                                {displayTeams.map((team) => (
                                    <button
                                        key={team.id}
                                        type="button"
                                        onClick={() => setSelectedTeam(team.id)}
                                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${selectedTeam === team.id
                                            ? 'border-primary bg-primary/10 text-primary'
                                            : 'border-gray-600 bg-gray-800/50 text-white hover:border-gray-500'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="font-medium text-sm">{team.teamName}</span>
                                            <span className="text-xs text-gray-400">({team.country})</span>
                                        </div>
                                        <div
                                            className={`w-5 h-5 rounded-full border-2 transition-all ${selectedTeam === team.id
                                                ? 'border-primary bg-primary'
                                                : 'border-gray-500'
                                                }`}
                                        >
                                            {selectedTeam === team.id && (
                                                <div className="w-full h-full rounded-full bg-primary flex items-center justify-center">
                                                    <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {displayTeams.length === 0 && !isLoadingTeams && (
                            <div className="text-center py-8 text-gray-400 text-sm">
                                {searchQuery.trim() && searchQuery.trim().length >= 3 ? 'No teams found' : 'No teams available'}
                            </div>
                        )}
                    </>
                )}
            </div>

            <div className="flex gap-3 pt-4">
                <Button
                    type="button"
                    variant="secondary"
                    onClick={onCancel}
                    className="flex-1"
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    variant="gradient"
                    disabled={!selectedTeam || isLoading}
                    isLoading={isLoading}
                    className="flex-1"
                >
                    Save Changes
                </Button>
            </div>
        </form>
    );
}
