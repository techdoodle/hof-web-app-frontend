export const generateMatchStatsConfig = (matchStats: any, playerPosition?: 'GK' | 'DEF' | 'FWD') => {
  // Default configuration (current one) not needed
  const defaultConfig = {
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
  };
 // Goalkeeper Profile (GK) – Focus on saves, handling, and defensive actions
 const goalkeeperConfig = {
    leftColumn: [
    //   {
    //     label: "Matches",
    //     dataPath: "matchesPlayed"
    //   },
      {
        label: "Save",
        dataPath: "detailedStats.goalkeeping.totalSave"
      },
      {
        label: "Catch",
        dataPath: "detailedStats.goalkeeping.totalCatch"
      },
      {
        label: "Punch",
        dataPath: "detailedStats.goalkeeping.totalPunch"
      }
    ],
    rightColumn: [
    //   {
    //     label: "MVPs",
    //     dataPath: "totalMvpWins"
    //   },
      {
        label: "Clearance",
        dataPath: "detailedStats.goalkeeping.totalClearance"
      },
      {
        label: "Accuracy",
        dataPath: "detailedStats.passing.overallAccuracy",
        suffix: "%"
      },
      {
        label: "Miscontrol",
        dataPath: "detailedStats.goalkeeping.totalMiscontrol"
      }
    ]
  };

  // Defender Profile (DEF) – Focus on defensive interventions and passing under pressure
  const defenderConfig = {
    leftColumn: [
    //   {
    //     label: "Matches",
    //     dataPath: "matchesPlayed"
    //   },
      {
        label: "Interception",
        dataPath: "detailedStats.tackling.interceptions"
      },
      {
        label: "Tackle",
        dataPath: "detailedStats.tackling.successfulTackles"
      },
      {
        label: "Goals",
        dataPath: "detailedStats.impact.totalGoals"
      }
    ],
    rightColumn: [
    //   {
    //     label: "MVPs",
    //     dataPath: "totalMvpWins"
    //   },
      {
        label: "Assists",
        dataPath: "detailedStats.impact.totalAssists"
      },
      {
        label: "Blocks",
        dataPath: "detailedStats.tackling.blocks"
      },
      {
        label: "Passing Acc",
        dataPath: "detailedStats.passing.overallAccuracy",
        suffix: "%"
      }
    ]
  };

  // Forward Profile (FWD) – Emphasize attacking contribution and efficiency
  const forwardConfig = {
    leftColumn: [
    //   {
    //     label: "Matches",
    //     dataPath: "matchesPlayed"
    //   },
      {
        label: "Total Shots",
        dataPath: "detailedStats.shooting.totalShots"
      },
      {
        label: "Passing Acc",
        dataPath: "detailedStats.passing.overallAccuracy",
        suffix: "%"
      },
      {
        label: "Total Goals",
        dataPath: "detailedStats.impact.totalGoals"
      }
    ],
    rightColumn: [
    //   {
    //     label: "MVPs",
    //     dataPath: "totalMvpWins"
    //   },
      {
        label: "Dribbles Attempted",
        dataPath: "detailedStats.dribbling.totalAttempts"
      },
      {
        label: "Shot Acc",
        dataPath: "detailedStats.shooting.shotAccuracy",
        suffix: "%"
      },
      {
        label: "Assists",
        dataPath: "detailedStats.impact.totalAssists"
      }
    ]
  };


  // Return configuration based on player position
  switch (playerPosition) {
    case 'GK':
      return goalkeeperConfig;
    case 'DEF':
      return defenderConfig;
    case 'FWD':
      return forwardConfig;
    default:
      return defaultConfig;
  }
}