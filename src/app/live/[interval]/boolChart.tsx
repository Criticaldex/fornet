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
import { sendTelegram, sendMail } from "@/services/alertes";

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
   HighchartsNoData(Highcharts)
   highchartsMore(Highcharts);
   solidGauge(Highcharts);
}

export function BoolChart({ line, name }: any) {

   const options = {
      ...chartOptions,
      chart: {
         animation: false,
         type: 'solidgauge',
         spacingTop: 0,
         height: '30%',
         margin: [20, 0, 0, 0],
         spacing: [0, 0, 0, 0],
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/lastValue`,
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
            radius: "20%",
            innerRadius: "0%"
         }
      },
      pane: {
         size: '400%',
         innerSize: '0%',
         center: ["50%", "50%"],
         background: {
            outerRadius: '20%',
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
      <div className="m-2">
         <button
            onClick={() => {
               sendTelegram();
            }}
            className="bg-orange-500 text-white px-4 py-1 rounded hover:bg-orange-600 mr-4">
            Test Telegram
         </button>
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}