'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { GetLines, GetNames } from './routing'
import { useState } from 'react'


if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
}

export function LiveChart({ session, lines, names }: any) {
   const [line, setLine] = useState(lines[0]);
   const [name, setName] = useState(names[0]);
   const options = {
      ...chartOptions,
      chart: {
         type: 'spline',
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}`,
         enablePolling: true,
         dataRefreshRate: 1
      },
      title: {
         text: name
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
      <div className="m-2">
         <div className="flex justify-start grow mb-2 mx-2">
            <GetLines
               lines={lines}
               line={line}
               setter={setLine}
            />
            <GetNames
               names={names}
               name={name}
               setter={setName}
            />
         </div>
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}