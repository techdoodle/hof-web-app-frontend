import { generateMatchStatsConfig } from "@/lib/utils/matchStatConfig";

export interface StatConfig {
  label: string;
  dataPath: string;
  suffix?: string;
  formatter?: (value: any) => string;
}

export interface StatsConfig {
  leftColumn: StatConfig[];
  rightColumn: StatConfig[];
}

export function generateStatsConfig(): StatsConfig {
  return {
    leftColumn: [
      {
        label: "Matches",
        dataPath: "matchesPlayed"
      },
      {
        label: "Passes",
        dataPath: "detailedStats.passing.totalCompletePassingActions"
      },
      {
        label: "Tackles",
        dataPath: "detailedStats.tackling.successfulTackles"
      },
      {
        label: "Interception",
        dataPath: "detailedStats.tackling.interceptions"
      }
    ],
    rightColumn: [
      {
        label: "MVPs",
        dataPath: "detailedStats.totalMvpWins"
      },
      {
        label: "Pass Acc.",
        dataPath: "detailedStats.passing.overallAccuracy",
        suffix: "%"
      },
      {
        label: "Shots Attemp",
        dataPath: "detailedStats.shooting.totalShots"
      },
      {
        label: "Shots Acc.",
        dataPath: "detailedStats.shooting.shotAccuracy",
        suffix: "%"
      }
    ]
  };
}

// Alternative configuration for different data structures
export function generateAlternativeStatsConfig(): StatsConfig {
  return {
    leftColumn: [
      {
        label: "Matches",
        dataPath: "matches"
      },
      {
        label: "Passes",
        dataPath: "passes"
      },
      {
        label: "Tackles",
        dataPath: "tackles"
      },
      {
        label: "Interception",
        dataPath: "interceptions"
      }
    ],
    rightColumn: [
      {
        label: "MVPs",
        dataPath: "mvps"
      },
      {
        label: "Passing Acc",
        dataPath: "passingAccuracy",
        suffix: "%"
      },
      {
        label: "Shots Attemp",
        dataPath: "shotsAttempted"
      },
      {
        label: "Shots Acc",
        dataPath: "shotsAccuracy",
        suffix: "%"
      }
    ]
  };
}

export function getValueFromPath(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

export function formatStatValue(value: any, config: StatConfig): string {
  if (value === null || value === undefined) {
    return '0';
  }

  const formattedValue = config.formatter ? config.formatter(value) : value.toString();
  return config.suffix ? `${formattedValue}${config.suffix}` : formattedValue;
}

// Utility function to detect data structure and choose appropriate config
export function detectAndGenerateConfig(stats: any, screenName: undefined | string): StatsConfig {
  // Check if stats has the detailedStats structure

  if (screenName === "matchStats") {
    return generateMatchStatsConfig(stats);
  }

  console.log('debugging stats', stats);
  if (stats?.detailedStats) {
    return generateStatsConfig();
  }
  
  // Check if stats has flat structure
  if (stats && typeof stats === 'object' && !stats.detailedStats) {
    return generateAlternativeStatsConfig();
  }
  
  // Default to detailed structure
  return generateStatsConfig();
}

// Utility function to validate stats data
export function validateStatsData(stats: any): boolean {
  if (!stats || typeof stats !== 'object') {
    return false;
  }
  
  // Check for required fields in detailed structure
  if (stats.detailedStats) {
    const requiredSections = ['shooting', 'passing', 'tackling', 'impact', 'interceptions'];
    return requiredSections.every(section => stats.detailedStats[section]);
  }
  
  // Check for required fields in flat structure
  const requiredFields = ['matches', 'passes', 'tackles', 'interceptions', 'mvps'];
  return requiredFields.every(field => stats.hasOwnProperty(field));
} 