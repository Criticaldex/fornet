'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { useState } from 'react'

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
         rowsURL: `http://localhost:3000/api/liveValues/${line}/${name}`,
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
         title: null
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}