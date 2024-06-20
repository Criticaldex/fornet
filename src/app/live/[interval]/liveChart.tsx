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

export function LiveChart({ line, names, units, interval }: any) {
   const [name, setName] = useState(names[0]);
   const [unit, setUnit] = useState(units[0]);
   const timestamp = useState(Math.floor(Date.now() - (interval * 60 * 60 * 1000)).toString());

   const options = {
      ...chartOptions,
      chart: {
         type: 'spline',
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/${timestamp}`,
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
         title: null,
         min: 0
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
         <div className="flex justify-start grow mb-2 mx-2">
            <GetNames
               names={names}
               units={units}
               name={name}
               setter={setName}
               setUnit={setUnit}
            />
         </div>
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}