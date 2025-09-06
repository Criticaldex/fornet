'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsData from 'highcharts/modules/data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { GetNames } from '../routing'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
}

export function LiveChart({ i, line, name, unit, interval }: any) {
   const { data: session, status, update } = useSession();
   const [user, setUser] = useState({});
   useEffect(() => {
      if (session) {
         setUser(session.user)
      }
   }, [session])
   const options = {
      ...chartOptions,
      chart: {
         type: 'spline',
         height: null, // Allow responsive height
         spacingTop: 5,
         spacingRight: 5,
         spacingBottom: 5,
         spacingLeft: 5,
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${session?.user.db}/${line}/${name}/${interval}`,
         enablePolling: true,
         dataRefreshRate: 60
      },
      title: {
         text: undefined
      },
      legend: {
         enabled: false
      },
      yAxis: {
         ...chartOptions.yAxis,
         title: null
      },
      responsive: {
         rules: [{
            condition: {
               maxWidth: 300
            },
            chartOptions: {
               legend: {
                  enabled: false
               },
               yAxis: {
                  labels: {
                     enabled: false
                  }
               }
            }
         }]
      },
      tooltip: {
         formatter: function (this: any) {
            const time = new Date(this.point.x)
            return `<b>${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}</b>: ${this.point.y} ${unit}<br/>`
         },
      },
   }

   return (
      <div className="w-full h-full">
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
            containerProps={{ style: { height: '100%', width: '100%' } }}
         />
      </div>
   )
}