'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { objectEach } from 'highcharts'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
}

export function Iqf({ name, data, objectiu }: any) {
   let max = 0;
   data.forEach((elem: any) => {
      elem.data.map((i: any) => {
         max = (i > max) ? i : max;
      });
   });
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
      series: data,
      xAxis: {
         categories: ['Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
      },
      yAxis: {
         ...chartOptions.yAxis,
         max: max,
         plotLines: [{
            color: 'var(--red)',
            width: 2,
            value: objectiu
         }],
         stackLabels: {
            enabled: true,
            style: {
               textOutline: 'none'
            },
            total: '',
            formatter: function () {
               return '<b>' + this.total + '</b>'
            },
            y: -3
         },
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
         }
      },
      tooltip: {
         pointFormat: '{series.name}: <b>{point.y}</b> ({point.percentage:.1f}%)<br/>'
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}