export interface LeaderboardPlayer {
    id: number;
    rank: number;
    name: string;
    score: number;
    suffix: string;
    imageUrl: string;
    appearances: number;
    goals: number;
    assists: number;
}

export interface LeaderboardResponse {
    data: LeaderboardPlayer[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalPlayers: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}
