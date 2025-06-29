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

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsData(Highcharts)
   HighchartsNoData(Highcharts)
   highchartsMore(Highcharts);
   solidGauge(Highcharts);
}

export function GaugeChart({ line, name, unit, maxrange, minrange }: any) {
   const [min, setMin] = useState(parseInt(minrange) || 0);
   const [max, setMax] = useState(parseInt(maxrange) || 0);
   // const [min, setMin] = useState(0);
   // const [max, setMax] = useState(5000);

   const options = {
      ...chartOptions,
      chart: {
         type: 'solidgauge',
         spacingTop: 0,
         height: '60%',
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
            [0.3, `var(--green)`],
            [0.6, `var(--yellow)`],
            [1, `var(--red)`]
         ],
         lineWidth: 0,
         tickWidth: 0,
         minorTickInterval: null,
         tickAmount: 5,
         max: max,
         min: min,
         labels: {
            y: 20
         }
      },
      plotOptions: {
         solidgauge: {
            dataLabels: {
               enabled: true,
               align: 'center',
               format: '<p style="font-size: 20px;color: {point.color}; font-weight: bold;">{point.y} ' + unit + '</p>',
               borderWidth: 0,
               style: {
                  textOutline: 'none'
               }
            },
            lineWidth: 0.5,
            radius: "95%",
            innerRadius: "90%"
         }
      },
      pane: {
         size: '150%',
         innerSize: '0%',
         startAngle: -90,
         endAngle: 90,
         center: ["50%", "80%"],
         background: {
            outerRadius: '95%',
            innerRadius: '90%',
            backgroundColor: `var(--bg-dark)`,
            borderWidth: 1,
            shape: 'arc'
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
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}