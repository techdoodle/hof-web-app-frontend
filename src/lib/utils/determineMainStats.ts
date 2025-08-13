export const determineMainStats = (playerPosition: 'GK' | 'DEF' | 'FWD', matchStats: any) => {

    switch (playerPosition) {
        case 'GK':
            return { 'Saves': matchStats?.detailedStats?.goalkeeping?.totalSave ?? "-", 'Key Passes': matchStats?.detailedStats?.passing?.totalKeyPass ?? "-" };
        case 'DEF':
            return { 'Tackles': matchStats?.detailedStats?.tackling?.totalTackleAttempts ?? "-", 'Assists': matchStats?.detailedStats?.impact?.totalAssists ?? "-" };
        case 'FWD':
            return { 'Goals': matchStats?.detailedStats?.impact?.totalGoals ?? "-", 'Assists': matchStats?.detailedStats?.impact?.totalAssists ?? "-" };
    }
};

