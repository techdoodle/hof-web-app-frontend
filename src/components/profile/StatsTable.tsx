import { cn } from '@/lib/utils/styles';
import { detectAndGenerateConfig, getValueFromPath, formatStatValue, type StatConfig } from '@/utils/statsConfig';

interface StatsTableProps {
  stats: any;
  screenName?: undefined | string;
  playerPosition?: 'GK' | 'DEF' | 'FWD';
  loading?: boolean;
}

export function StatsTable({ loading, stats, screenName, playerPosition }: StatsTableProps) {
  const config = detectAndGenerateConfig(stats, screenName, playerPosition);
  console.log('debugging config', config, stats, screenName, playerPosition);

  const renderStatRow = (statConfig: StatConfig, index?: number) => {
    const value = getValueFromPath(stats, statConfig.dataPath);
    const formattedValue = formatStatValue(value, statConfig);
    const key = `${statConfig.label}-${index}`;
    return (
      <div key={key} className="flex justify-between">
        <span className={index === 0 ? "text-white font-bold" : "text-[#AAAAAA] font-bold"}>{statConfig.label}</span>
        <span className={index === 0 ? "text-[#00CC66] font-bold" : "text-white font-bold"}>{formattedValue}</span>
      </div>
    );
  };

  return (
    <div
      className="p-[1px] rounded-2xl w-full"
      style={{
        // marginTop: '-30px',
        background: 'linear-gradient(169.22deg, rgba(169, 169, 169, 0) -1.94%, #FFFFFF 43.05%, #CBCBCB 66.97%, #747474 88.27%)',
      }}
    >
      <div className="p-4 bg-[#0B1E19] rounded-2xl" >
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3 font-orbitron">
            {config.leftColumn.map((item, index) => renderStatRow(item, index))}
          </div>
          <div className="space-y-3 font-orbitron">
            {config.rightColumn.map((item, index) => renderStatRow(item, index))}
          </div>
        </div>
      </div>
    </div>
  );
} 