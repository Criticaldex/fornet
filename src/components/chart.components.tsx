export const chartOptions = {
   chart: {
      type: null,
      zooming: {
         mouseWheel: false
      }
   },
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
   data: {
      rowsURL: 'https://demo-live-data.highcharts.com/time-rows.json',
      enablePolling: true,
      dataRefreshRate: 1
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
            stroke: 'var(--darkBlue)',
            fill: 'var(--bg-dark)',
            states: {
               hover: {
                  fill: 'var(--bg-light)',
               },
               select: {
                  stroke: 'var(--darkBlue)',
                  fill: 'var(--darkBlue)'
               }
            }
         }
      },
      menuStyle: {
         background: 'var(--bg-dark)'
      },
      menuItemStyle: {
         borderLeft: '2px solid var(--darkBlue)',
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
   }
};