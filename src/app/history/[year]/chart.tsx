'use client'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsReact from 'highcharts-react-official'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import highchartsDrilldown from "highcharts/modules/drilldown";
import { chartOptions } from '@/components/chart.components'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsNoData(Highcharts)
   HighchartsAccessibility(Highcharts)
   HighchartsMore(Highcharts)
   highchartsDrilldown(Highcharts);
}

export function SummaryChart({ name, data, dd }: any) {
   const options = {
      ...chartOptions,
      chart: {
         spacingTop: 10,
      },
      title: {
         text: name
      },
      series: data,
      drilldown: dd,
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
   console.log('options: ', options);

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}
