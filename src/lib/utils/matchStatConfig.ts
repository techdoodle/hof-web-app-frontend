export const generateMatchStatsConfig = (matchStats: any) => {
    return {
      leftColumn: [
        {
            label: 'Passes',
            dataPath: 'totalPass'
        },
        {
            label: 'Pass Acc.',
            dataPath: 'totalPassingAccuracy',
            suffix: '%'
        },
        {
            label: 'Tackles',
            dataPath: 'tackleTurnover'
        }
      ],
      rightColumn: [
        {
            label: 'Shots Attemp',
            dataPath: 'totalShot'
        },
        {
            label: 'Interception',
            dataPath: 'interceptionSameTeam'
        },
        {
            label: 'Shots Acc.',
            dataPath: 'shotAccuracy',
            suffix: '%'
        }        
      ],
    }
}