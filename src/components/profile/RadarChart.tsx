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
          <div className="w-full max-w-xs h-64 flex items-center justify-center">
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
      tickInterval: 72,
      min: 0,
      max: 360,
      labels: {
        format: '{value}°',
      },
      lineWidth: 0,
      minorGridLineWidth: 0,
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 1,
      gridLineColor: '#F1F1F140',
      gridLineDashStyle: 'Solid',
    },
    yAxis: {
        gridLineInterpolation: 'polygon',
      min: 0,
      max: 100,
      tickInterval: 20,
      categories: [
        'Shooting', 'Dribbling', 'Passing', 'Defending', 'Physical'
      ],
      lineWidth: 0,
      minorGridLineWidth: 0,
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 1,
      gridLineColor: '#374151',
      gridLineDashStyle: 'Solid',
    },
    plotOptions: {
      series: {
        pointStart: 0,
        pointInterval: 72,
      },
      area: {
        pointPlacement: 'on',
      },
    },
    series: [
      {
        type: 'area',
        name: 'Player Stats',
        data: [
          10,
          20,
          30,
          40,
          50,
          60,
          70,
          80,
        ],
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
        const categories = ['Shooting', 'Dribbling', 'Passing', 'Defending', 'Physical'];
        const index = Math.floor(this.x / 72);
        if (index < categories.length) {
          return `<b>${categories[index]}</b><br/>Value: ${this.y}`;
        }
        return `<b>Shooting</b><br/>Value: ${this.y}`;
      },
    },
  };

//   const chartOptions = {

//     chart: {
//         polar: true,
//         type: 'line',
//         backgroundColor: 'transparent',
//         height: 300,
//     },

//     title: null,

//     pane: {
//         size: '80%'
//     },

//     xAxis: {
//         categories: [
//             'Sales', 'Marketing', 'Development', 'Customer Support',
//             'Information Technology', 'Administration'
//         ],
//         tickmarkPlacement: 'on',
//         lineWidth: 0
//     },

//     yAxis: {
//         gridLineInterpolation: 'polygon',
//         lineWidth: 0,
//         min: 0
//     },

//     tooltip: {
//         shared: true,
//         pointFormat: '<span style="color:{series.color}">{series.name}: <b>' +
//             '${point.y:,.0f}</b><br/>'
//     },

//     legend: {
//         align: 'right',
//         verticalAlign: 'middle',
//         layout: 'vertical'
//     },

//     series: [{
//         name: 'Allocated Budget',
//         data: [43000, 19000, 60000, 35000, 17000, 10000],
//         pointPlacement: 'on'
//     }, {
//         name: 'Actual Spending',
//         data: [50000, 39000, 42000, 31000, 26000, 14000],
//         pointPlacement: 'on'
//     }],

//     responsive: {
//         rules: [{
//             condition: {
//                 maxWidth: 500
//             },
//             chartOptions: {
//                 title: {
//                     x: 0
//                 },
//                 legend: {
//                     align: 'center',
//                     verticalAlign: 'bottom',
//                     layout: 'horizontal'
//                 },
//                 pane: {
//                     size: '70%'
//                 }
//             }
//         }]
//     }
// }

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="w-full max-w-xs">
          <HighchartsReact highcharts={Highcharts} options={chartOptions} />
        </div>
      </div>
    </div>
  );
} 