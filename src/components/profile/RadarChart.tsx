interface RadarChartProps {
  data: {
    shooting: number;
    dribbling: number;
    passing: number;
    defending: number;
    physical: number;
  };
}

export function RadarChart({ data }: RadarChartProps) {
  const size = 200;
  const center = size / 2;
  const radius = 80;
  
  // Convert data to polar coordinates
  const attributes = [
    { name: 'Shooting', value: data.shooting, angle: 0 }, // Top
    { name: 'Dribbling', value: data.dribbling, angle: 72 }, // Top right
    { name: 'Passing', value: data.passing, angle: 144 }, // Bottom right
    { name: 'Defending', value: data.defending, angle: 216 }, // Bottom left
    { name: 'Physical', value: data.physical, angle: 288 }, // Top left
  ];

  // Generate polygon points
  const points = attributes.map(attr => {
    const angle = (attr.angle * Math.PI) / 180;
    const r = (attr.value / 100) * radius;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    return `${x},${y}`;
  }).join(' ');

  // Generate grid circles
  const gridCircles = [20, 40, 60, 80, 100].map(value => {
    const r = (value / 100) * radius;
    return (
      <circle
        key={value}
        cx={center}
        cy={center}
        r={r}
        fill="none"
        stroke="#374151"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  });

  // Generate axis lines
  const axisLines = attributes.map(attr => {
    const angle = (attr.angle * Math.PI) / 180;
    const x = center + radius * Math.sin(angle);
    const y = center - radius * Math.cos(angle);
    return (
      <line
        key={attr.name}
        x1={center}
        y1={center}
        x2={x}
        y2={y}
        stroke="#374151"
        strokeWidth="1"
        opacity="0.3"
      />
    );
  });

  // Generate labels
  const labels = attributes.map(attr => {
    const angle = (attr.angle * Math.PI) / 180;
    const labelRadius = radius + 20;
    const x = center + labelRadius * Math.sin(angle);
    const y = center - labelRadius * Math.cos(angle);
    
    // Adjust text anchor and alignment based on angle
    let textAnchor = 'middle';
    let dominantBaseline = 'middle';
    
    if (attr.angle === 0) {
      dominantBaseline = 'auto';
    } else if (attr.angle === 180) {
      dominantBaseline = 'hanging';
    } else if (attr.angle < 90 || attr.angle > 270) {
      textAnchor = 'start';
    } else if (attr.angle > 90 && attr.angle < 270) {
      textAnchor = 'end';
    }

    return (
      <text
        key={attr.name}
        x={x}
        y={y}
        textAnchor={textAnchor}
        dominantBaseline={dominantBaseline}
        className="text-xs text-gray-400 fill-current"
      >
        {attr.name}
      </text>
    );
  });

  // Generate data points
  const dataPoints = attributes.map(attr => {
    const angle = (attr.angle * Math.PI) / 180;
    const r = (attr.value / 100) * radius;
    const x = center + r * Math.sin(angle);
    const y = center - r * Math.cos(angle);
    
    return (
      <circle
        key={attr.name}
        cx={x}
        cy={y}
        r="4"
        fill="#10B981"
        className="drop-shadow-sm"
      />
    );
  });

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-white">Player Attributes</h3>
      </div>
      <div className="flex justify-center">
        <svg width={size} height={size} className="w-full max-w-xs">
          {/* Grid circles */}
          {gridCircles}
          
          {/* Axis lines */}
          {axisLines}
          
          {/* Data polygon */}
          <polygon
            points={points}
            fill="#10B981"
            fillOpacity="0.2"
            stroke="#10B981"
            strokeWidth="2"
          />
          
          {/* Data points */}
          {dataPoints}
          
          {/* Labels */}
          {labels}
        </svg>
      </div>
    </div>
  );
} 