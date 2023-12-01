'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import highchartsDrilldown from "highcharts/modules/drilldown";
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   highchartsDrilldown(Highcharts);
}

export function IntervalsChart({ name, data, dd, callback }: any) {

   const options = {
      ...chartOptions,
      chart: {
         type: 'column',
         spacingTop: 10,
      },
      title: {
         text: name
      },
      series: data,
      drilldown: dd,
      yAxis: [{
         title: {
            text: 'Nº Trucades'
         }
      }, {
         title: {
            text: 'Persones'
         },
         opposite: true
      }],
      xAxis: {
         type: 'category'
      },
      legend: {
         enabled: false,
      },
      plotOptions: {
         column: {
            stacking: 'normal'
         },
         series: {
            borderWidth: 0,
            maxPointWidth: 50,
            dataLabels: {
               enabled: true,
               style: {
                  textOutline: 'none'
               },
            },
         }
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
         callback={callback}
      />
   )
}