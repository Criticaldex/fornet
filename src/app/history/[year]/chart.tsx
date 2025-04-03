'use client'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsReact from 'highcharts-react-official'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import { chartOptions } from '@/components/chart.components'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsNoData(Highcharts)
   HighchartsAccessibility(Highcharts)
   HighchartsMore(Highcharts)
}

export function SummaryChart({ name, data }: any) {
   const options = {
      ...chartOptions,
      chart: {
         spacingTop: 10,
      },
      title: {
         text: name
      },
      series: data,
      xAxis: {
         type: 'category'
      },
      legend: {
         enabled: false,
      },
      tooltip: {
         crosshairs: true,
         shared: true,
         valueSuffix: ' dies'
      },
      plotOptions: {
         series: {
            borderWidth: 0,
            maxPointWidth: 0,
            dataLabels: {
               enabled: true,
               style: {
                  textOutline: 'none'
               },
            }
         }
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}