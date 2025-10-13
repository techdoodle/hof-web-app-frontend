export const generateMatchStatsConfig = (matchStats: any, playerPosition?: 'GK' | 'DEF' | 'FWD') => {
  // Default configuration (current one) not needed
  const defaultConfig = {
    leftColumn: [
      { label: 'Key Passes', dataPath: 'detailedStats.impact.totalKeyPass' },
      { label: 'Pass Acc.', dataPath: 'detailedStats.passing.overallAccuracy', suffix: '%' },
      { label: 'Tackles', dataPath: 'detailedStats.tackling.totalTackles' },
      { label: 'Interceptions', dataPath: 'detailedStats.tackling.interceptions' },
      { label: 'Saves', dataPath: 'detailedStats.goalkeeping.totalSave' },
    ],
    rightColumn: [
      { label: 'Shots', dataPath: 'detailedStats.shooting.totalShots' },
      { label: 'Shot Acc.', dataPath: 'detailedStats.shooting.shotAccuracy', suffix: '%' },
      { label: 'Goals', dataPath: 'detailedStats.impact.totalGoals' },
      { label: 'Assists', dataPath: 'detailedStats.impact.totalAssists' },
      { label: 'Passes', dataPath: 'detailedStats.passing.totalPasses' },
    ],
  };
  // Goalkeeper Profile (GK) – Focus on saves, handling, and defensive actions
  const goalkeeperConfig = {
    leftColumn: [
      { label: 'Save', dataPath: 'detailedStats.goalkeeping.totalSave' },
      { label: 'Pass Acc.', dataPath: 'detailedStats.passing.overallAccuracy', suffix: '%' },
      { label: 'Shots', dataPath: 'detailedStats.shooting.totalShots' },
      { label: 'Shot Acc.', dataPath: 'detailedStats.shooting.shotAccuracy', suffix: '%' },
      { label: 'Passes', dataPath: 'detailedStats.passing.totalPasses' },
    ],
    rightColumn: [
      { label: 'Assists', dataPath: 'detailedStats.impact.totalAssists' },
      { label: 'Goals', dataPath: 'detailedStats.impact.totalGoals' },
      { label: 'Key Passes', dataPath: 'detailedStats.impact.totalKeyPass' },
      { label: 'Tackles', dataPath: 'detailedStats.tackling.totalTackles' },
      { label: 'Interceptions', dataPath: 'detailedStats.tackling.interceptions' },
    ]
  };

  // Defender Profile (DEF) – Focus on defensive interventions and passing under pressure
  const defenderConfig = {
    leftColumn: [
      { label: 'Tackles', dataPath: 'detailedStats.tackling.totalTackles' },
      { label: 'Pass Acc.', dataPath: 'detailedStats.passing.overallAccuracy', suffix: '%' },
      { label: 'Interceptions', dataPath: 'detailedStats.tackling.interceptions' },
      { label: 'Passes', dataPath: 'detailedStats.passing.totalPasses' },
      { label: 'Saves', dataPath: 'detailedStats.goalkeeping.totalSave' },
    ],
    rightColumn: [
      { label: 'Shots', dataPath: 'detailedStats.shooting.totalShots' },
      { label: 'Shot Acc.', dataPath: 'detailedStats.shooting.shotAccuracy', suffix: '%' },
      { label: 'Goals', dataPath: 'detailedStats.impact.totalGoals' },
      { label: 'Assists', dataPath: 'detailedStats.impact.totalAssists' },
      { label: 'Key Passes', dataPath: 'detailedStats.impact.totalKeyPass' },
    ]
  };

  // Forward Profile (FWD) – Emphasize attacking contribution and efficiency
  const forwardConfig = {
    leftColumn: [
      { label: 'Total Shots', dataPath: 'detailedStats.shooting.totalShots' },
      { label: 'Passing Acc', dataPath: 'detailedStats.passing.overallAccuracy', suffix: '%' },
      { label: 'Total Goals', dataPath: 'detailedStats.impact.totalGoals' },
      { label: 'Key Passes', dataPath: 'detailedStats.impact.totalKeyPass' },
      { label: 'Passes', dataPath: 'detailedStats.passing.totalPasses' },
    ],
    rightColumn: [
      { label: 'Shot Acc', dataPath: 'detailedStats.shooting.shotAccuracy', suffix: '%' },
      { label: 'Assists', dataPath: 'detailedStats.impact.totalAssists' },
      { label: 'Tackles', dataPath: 'detailedStats.tackling.totalTackles' },
      { label: 'Interceptions', dataPath: 'detailedStats.tackling.interceptions' },
      { label: 'Saves', dataPath: 'detailedStats.goalkeeping.totalSave' },
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

export const generateProfileStatsConfig = (matchStats: any, playerPosition?: 'GK' | 'DEF' | 'FWD') => {
  // Default configuration (current one) not needed
  const defaultConfig = {
    leftColumn: [
      {
        label: 'Matches',
        dataPath: 'matchesPlayed'
      },
      {
        label: 'Key Passes',
        dataPath: 'detailedStats.impact.totalKeyPass'
      },
      {
        label: 'Pass Acc.',
        dataPath: 'detailedStats.passing.overallAccuracy',
        suffix: '%'
      },
      {
        label: 'Tackles',
        dataPath: 'detailedStats.tackling.totalTackles'
      },
      {
        label: 'Passes',
        dataPath: 'detailedStats.passing.totalPasses'
      }
    ],
    rightColumn: [
      {
        label: 'MVPs',
        dataPath: 'totalMvpWins'
      },
      {
        label: 'Shots',
        dataPath: 'detailedStats.shooting.totalShots'
      },
      {
        label: 'Interception',
        dataPath: 'detailedStats.tackling.interceptions'
      },
      {
        label: 'Shots Acc.',
        dataPath: 'detailedStats.shooting.shotAccuracy',
        suffix: '%'
      },
      {
        label: 'Saves',
        dataPath: 'detailedStats.goalkeeping.totalSave'
      }
    ],
  };
  // Goalkeeper Profile (GK) – Focus on saves, handling, and defensive actions
  const goalkeeperConfig = {
    leftColumn: [
      {
        label: "Matches",
        dataPath: "matchesPlayed"
      },
      {
        label: "Save",
        dataPath: "detailedStats.goalkeeping.totalSave"
      },
      {
        label: "Assists",
        dataPath: "detailedStats.impact.totalAssists"
      },
      {
        label: 'Passes',
        dataPath: 'detailedStats.passing.totalPasses'
      }
    ],
    rightColumn: [
      {
        label: "MVPs",
        dataPath: "totalMvpWins"
      },
      {
        label: "Accuracy",
        dataPath: "detailedStats.passing.overallAccuracy",
        suffix: "%"
      },
      {
        label: "Shots",
        dataPath: "detailedStats.shooting.totalShots"
      },
      {
        label: 'Shot Acc.',
        dataPath: 'detailedStats.shooting.shotAccuracy',
        suffix: '%'
      },
      {
        label: 'Key Passes',
        dataPath: 'detailedStats.impact.totalKeyPass'
      }
    ]
  };

  // Defender Profile (DEF) – Focus on defensive interventions and passing under pressure
  const defenderConfig = {
    leftColumn: [
      {
        label: 'Matches',
        dataPath: 'matchesPlayed'
      },
      {
        label: 'Passes',
        dataPath: 'detailedStats.passing.totalPasses'
      },
      {
        label: 'Key Passes',
        dataPath: 'detailedStats.impact.totalKeyPass'
      },
      {
        label: 'Tackles',
        dataPath: 'detailedStats.tackling.totalTackles'
      },
      {
        label: 'Pass Acc.',
        dataPath: 'detailedStats.passing.overallAccuracy',
        suffix: '%'
      }
    ],
    rightColumn: [
      {
        label: 'MVPs',
        dataPath: 'totalMvpWins'
      },
      {
        label: 'Saves',
        dataPath: 'detailedStats.goalkeeping.totalSave'
      },
      {
        label: 'Interceptions',
        dataPath: 'detailedStats.tackling.interceptions'
      },
      {
        label: 'Shots',
        dataPath: 'detailedStats.shooting.totalShots'
      },
      {
        label: 'Shot Acc.',
        dataPath: 'detailedStats.shooting.shotAccuracy',
        suffix: '%'
      },
    ]
  };

  // Forward Profile (FWD) – Emphasize attacking contribution and efficiency
  const forwardConfig = {
    leftColumn: [
      {
        label: "Matches",
        dataPath: "matchesPlayed"
      },
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
        label: 'Passes',
        dataPath: 'detailedStats.passing.totalPasses'
      },
      {
        label: 'Key Passes',
        dataPath: 'detailedStats.impact.totalKeyPass'
      }
    ],
    rightColumn: [
      {
        label: "MVPs",
        dataPath: "totalMvpWins"
      },
      {
        label: "Shot Acc",
        dataPath: "detailedStats.shooting.shotAccuracy",
        suffix: "%"
      },
      {
        label: 'Saves',
        dataPath: 'detailedStats.goalkeeping.totalSave'
      },
      {
        label: 'Assists',
        dataPath: 'detailedStats.impact.totalAssists'
      },
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