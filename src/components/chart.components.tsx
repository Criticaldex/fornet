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
   credits: {
      enabled: false
   },
   title: {
      text: null
   },
   series: null,
   xAxis: {
      zoomEnabled: false,
      categories: ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre'],
   },
   yAxis: {
      title: {
         enabled: false
      },
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
      }
   }
};