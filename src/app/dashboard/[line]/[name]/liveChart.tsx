'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
}

export function LiveChart({ title, line, name }: any) {
   const options = {
      chart: {
         type: 'spline',
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}`,
         enablePolling: true,
         dataRefreshRate: 1
      },
      title: {
         text: title
      },
      subtitle: {
         text: 'Dades en directe de Producció'
      },
      legend: {
         enabled: false
      },
      yAxis: {
         title: null,
         min: 0
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}