import { detectAndGenerateConfig, getValueFromPath, formatStatValue, type StatConfig } from '@/utils/statsConfig';

interface StatsTableProps {
  stats: any;
}

export function StatsTable({ stats }: StatsTableProps) {
  const config = detectAndGenerateConfig(stats);

  const renderStatRow = (statConfig: StatConfig) => {
    const value = getValueFromPath(stats, statConfig.dataPath);
    const formattedValue = formatStatValue(value, statConfig);

    return (
      <div key={statConfig.label} className="flex justify-between">
        <span className="text-white">{statConfig.label}</span>
        <span className="text-primary font-semibold">{formattedValue}</span>
      </div>
    );
  };

  return (
    <div 
      className="bg-[#0B1E19] p-4"
      style={{
        borderRadius: '16px',
        border: '1px solid',
        borderImageSource: 'linear-gradient(169.22deg, rgba(169, 169, 169, 0) -1.94%, #FFFFFF 43.05%, #CBCBCB 66.97%, #747474 88.27%)',
        borderImageSlice: '1',
        borderImageWidth: '1px',
      }}
    >
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-3">
          {config.leftColumn.map(renderStatRow)}
        </div>
        <div className="space-y-3">
          {config.rightColumn.map(renderStatRow)}
        </div>
      </div>
    </div>
  );
} 