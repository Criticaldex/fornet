'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { GetNames } from '../routing'
import { useState } from 'react'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
}

export function LiveChart({ line, name, unit, interval }: any) {

   const options = {
      ...chartOptions,
      chart: {
         type: 'spline',
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/${interval}`,
         enablePolling: true,
         dataRefreshRate: 1
      },
      title: {
         text: name + ` (${unit})`
      },
      legend: {
         enabled: false
      },
      yAxis: {
         ...chartOptions.yAxis,
         title: null
      },
      tooltip: {
         formatter: function (this: any) {
            const time = new Date(this.point.x)
            return `<b>${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</b>: ${this.point.y} ${unit}<br/>`
         },
      },
   }

   return (
      <div className="m-2">
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}