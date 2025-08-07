import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

interface RadarChartProps {
  data: any;
}

// Dynamically import Highcharts components to avoid SSR issues
const HighchartsReact = dynamic(() => import('highcharts-react-official'), {
  ssr: false,
});

export function RadarChart({ data }: RadarChartProps) {
  const [isClient, setIsClient] = useState(false);
  const [Highcharts, setHighcharts] = useState<any>(null);

  console.log('debugging data', data);

  useEffect(() => {
    setIsClient(true);
    
    // Dynamically import Highcharts and initialize polar charts
    const loadHighcharts = async () => {
      try {
        const HighchartsModule = await import('highcharts');
        const highchartsMore = await import('highcharts/highcharts-more');
        
        // Initialize the more module properly
        const HighchartsInstance = HighchartsModule.default;
        
        // Use a different approach to call the module
        const moreModule = highchartsMore.default as any;
        if (typeof moreModule === 'function') {
          moreModule(HighchartsInstance);
        }
        
        setHighcharts(HighchartsInstance);
      } catch (error) {
        console.error('Error loading Highcharts:', error);
      }
    };
    
    loadHighcharts();
  }, []);

  // Don't render until Highcharts is loaded
  if (!isClient || !Highcharts) {
    return (
      <div className="w-full">
        <div className="flex justify-center">
          <div className="w-full h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  const chartOptions: any = {
    chart: {
      polar: true,
      type: 'line',
      backgroundColor: 'transparent',
      height: 300,
    },
    title: {
      text: '',
    },
    pane: {
      startAngle: 0,
      endAngle: 360,
    },
    xAxis: {
      categories: Object.keys(data).map(key => key.charAt(0).toUpperCase() + key.slice(1)) ?? [],
      tickmarkPlacement: 'on',
      lineWidth: 0,
      minorGridLineWidth: 0,
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 1,
      gridLineColor: '#374151',
      gridLineDashStyle: 'Solid',
      labels: {
        style: {
          color: '#AAAAAA',
          fontSize: '10px',
        },
        distance: 15,
      },
    },
    yAxis: {
      gridLineInterpolation: 'polygon',
      min: 0,
      max: 100,
      tickInterval: 20,
      lineWidth: 0,
      minorGridLineWidth: 0,
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 1,
      gridLineColor: '#374151',
      gridLineDashStyle: 'Solid',
      labels: {
        style: {
          color: '#AAAAAA',
          fontSize: '10px',
        },
        // distance: 15,
      },
    },
    plotOptions: {
      series: {
        pointStart: 0,
        pointInterval: 1,
      },
      area: {
        pointPlacement: 'on',
      },
    },
    series: [
      {
        type: 'area',
        name: 'Player Stats',
        data: Object.values(data) ?? [],
        color: '#10B981',
        fillOpacity: 0.2,
        lineWidth: 2,
        marker: {
          enabled: true,
          radius: 4,
          fillColor: '#10B981',
          lineWidth: 0,
        },
      },
    ],
    legend: {
      enabled: false,
    },
    credits: {
      enabled: false,
    },
    tooltip: {
      formatter: function(this: any) {
        const categories = Object.keys(data);
        return `<b>${categories[this.x]}</b><br/>Value: ${this.y}`;
      },
    },
  };

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="w-full">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 