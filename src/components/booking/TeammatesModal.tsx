import { X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Participant {
    firstName: string;
    lastName: string;
    profilePicture?: string;
}

interface TeammatesModalProps {
    isOpen: boolean;
    onClose: () => void;
    participants: Record<string, Participant[]>;
}

export function TeammatesModal({ isOpen, onClose, participants }: TeammatesModalProps) {
    if (!isOpen) return null;

    const teams = Object.keys(participants).filter(team => participants[team].length > 0);
    const totalPlayers = Object.values(participants).reduce((sum, players) => sum + players.length, 0);

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div
                    className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-4xl max-h-[80vh] overflow-hidden animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
                                    <Users className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Your Teammates</h2>
                                    <p className="text-sm text-gray-400">{totalPlayers} players confirmed</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-lg"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                        <div className={`grid ${teams.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'} gap-6`}>
                            {teams.map((teamName) => (
                                <div key={teamName} className="space-y-4">
                                    {/* Team Header */}
                                    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-4 border border-gray-600">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-lg font-bold text-white">{teamName}</h3>
                                            <span className="text-sm bg-orange-500/20 text-orange-400 px-3 py-1 rounded-full font-medium">
                                                {participants[teamName].length} {participants[teamName].length === 1 ? 'player' : 'players'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Players List */}
                                    <div className="space-y-2">
                                        {participants[teamName].map((player, index) => (
                                            <div
                                                key={index}
                                                className="group bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 hover:border-orange-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-orange-500/10"
                                            >
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar */}
                                                    {player.profilePicture ? (
                                                        <img
                                                            src={player.profilePicture}
                                                            alt={`${player.firstName} ${player.lastName}`}
                                                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-600 group-hover:border-orange-500 transition-colors"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center border-2 border-gray-600 group-hover:border-orange-500 transition-colors">
                                                            <span className="text-white font-semibold text-sm">
                                                                {player.firstName?.[0]}{player.lastName?.[0]}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Name */}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white font-medium truncate">
                                                            {player.firstName} {player.lastName}
                                                        </p>
                                                        <p className="text-xs text-gray-400">
                                                            Player #{index + 1}
                                                        </p>
                                                    </div>

                                                    {/* Status Indicator */}
                                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" title="Confirmed" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Empty State */}
                        {totalPlayers === 0 && (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Users className="w-10 h-10 text-gray-600" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-400 mb-2">No Teammates Yet</h3>
                                <p className="text-gray-500">Be the first one to book this match!</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="bg-gray-800/50 border-t border-gray-700 p-4">
                        <Button
                            onClick={onClose}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
                        >
                            Close
                        </Button>
                    </div>
                </div>
            </div>
        </>
    );
}

