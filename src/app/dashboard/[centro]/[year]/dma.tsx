'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
}

export function Dma({ name, data, objectiu, regresion }: any) {
   let max = 0;
   max = Math.max(...data.data)
   max = (objectiu > max) ? objectiu : max;
   const options = {
      ...chartOptions,
      chart: {
         type: 'column',
         spacingTop: 30
      },
      title: {
         text: name
      },
      series: [
         data,
         {
            type: 'line',
            name: 'Línia de Tendència',
            data: regresion,
            color: 'var(--yellow)'
         }
      ],
      xAxis: {
         categories: ['Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
      },
      yAxis: {
         ...chartOptions.yAxis,
         max: max,
         min: null,
         plotLines: [{
            color: 'var(--red)',
            width: 2,
            value: objectiu,
            label: {
               text: parseFloat(objectiu.toFixed(2)).toLocaleString()

            }
         }]
      },
      plotOptions: {
         series: {
            borderWidth: 0,
            stacking: 'normal',
            dataLabels: {
               enabled: true,
               style: {
                  textOutline: 'none'
               },
            }
         },
         line: {
            lineWidth: 2,
            marker: {
               enabled: false
            },
            dataLabels: {
               enabled: false
            },
            connectNulls: true
         }
      },
      tooltip: {
         pointFormat: '{series.name}: <b>{point.y}</b>'
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}