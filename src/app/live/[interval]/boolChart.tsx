'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import HighchartsData from 'highcharts/modules/data'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import { chartOptions } from '@/components/chart.components'
import highchartsMore from "highcharts/highcharts-more"
import solidGauge from "highcharts/modules/solid-gauge";
import { GetNames } from '../routing'
import { useState } from 'react'
import { useSession } from 'next-auth/react'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
   HighchartsNoData(Highcharts)
   highchartsMore(Highcharts);
   solidGauge(Highcharts);
}

export function BoolChart({ line, name }: any) {
   const { data: session } = useSession();

   const options = {
      ...chartOptions,
      chart: {
         animation: false,
         type: 'solidgauge',
         height: null, // Allow responsive height
         spacingTop: 0,
         spacingRight: 0,
         spacingBottom: 0,
         spacingLeft: 0,
         margin: [5, 5, 5, 5],
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${session?.user.db}/${line}/${name}/lastValue`,
         enablePolling: true,
         dataRefreshRate: 1
      },
      title: {
         text: undefined
      },
      yAxis: {
         ...chartOptions.yAxis,
         stops: [
            [1, `var(--green)`]
         ],
         lineWidth: 0,
         tickWidth: 0,
         minorTickInterval: null,
         tickAmount: 0,
         max: 1,
         min: 0,
         labels: {
            enabled: false,
            y: 0
         }
      },
      plotOptions: {
         solidgauge: {
            dataLabels: {
               enabled: false
            },
            lineWidth: 1,
            radius: "40%",
            innerRadius: "0%"
         }
      },
      pane: {
         size: '100%',
         innerSize: '0%',
         center: ["50%", "50%"],
         background: {
            outerRadius: '40%',
            innerRadius: '0%',
            backgroundColor: `var(--bg-dark)`,
            borderWidth: 1,
            shape: 'circle'
         }
      },
      tooltip: {
         enabled: false
      },
      exporting: {
         enabled: false
      }
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