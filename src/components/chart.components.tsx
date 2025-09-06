import { time } from "console";

export const chartOptions = {
   chart: {
      type: null,
      zooming: {
         mouseWheel: false
      }
   },
   credits: {
      enabled: false
   },
   colors: ["#ff6600", "#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e1"],
   lang: {
      noData: "No hi han dades disponibles"
   },
   noData: {
      style: {
         fontSize: '26px',
         fontWeight: 'bold',
         color: '#666666'
      },
   },
   xAxis: {
      type: 'datetime',
      dateTimeLabelFormats: {
         // don't display the year
         month: '%e. %b',
         year: '%b'
      }
   },
   yAxis: {
      max: null,
      min: null,
      plotLines: [{
         color: 'var(--red)',
         width: 2,
         value: null
      }]
   },
   legend: {
      enabled: true,
   },
   navigation: {
      buttonOptions: {
         theme: {
            stroke: 'var(--accent)',
            fill: 'var(--bg-dark)',
            states: {
               hover: {
                  fill: 'var(--bg-light)',
               },
               select: {
                  stroke: 'var(--accent)',
                  fill: 'var(--accent)'
               }
            }
         }
      },
      menuStyle: {
         background: 'var(--bg-dark)'
      },
      menuItemStyle: {
         borderLeft: '2px solid var(--accent)',
         borderRadius: 0,
         color: 'var(--text-color)',
      },
      menuItemHoverStyle: {
         background: 'var(--bg-light)'
      }
   },
   plotOptions: {
      series: {
         borderWidth: 0,
         maxPointWidth: 100,
         // marker: {
         //    symbol: 'circle',
         //    fillColor: '#FFFFFF',
         //    enabled: true,
         //    radius: 0.5,
         //    lineWidth: 1,
         //    lineColor: null
         // }
      }
   },
   time: {
      timezone: 'Europe/Madrid'
   }
};