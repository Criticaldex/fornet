'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import { chartOptions } from '@/components/chart.components'
import highchartsMore from "highcharts/highcharts-more"
import solidGauge from "highcharts/modules/solid-gauge";
import { GetNames } from '../routing'
import { useState } from 'react'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsNoData(Highcharts)
   highchartsMore(Highcharts);
   solidGauge(Highcharts);
}

export function GaugeChart({ line, names, index, units, interval }: any) {
   const [name, setName] = useState(names[index]);
   const [unit, setUnit] = useState(units[index]);

   const options = {
      ...chartOptions,
      chart: {
         type: 'solidgauge',
         spacingTop: 0,
         height: '50%',
         margin: [0, 0, 0, 0],
         spacing: [0, 0, 0, 0],
      },
      data: {
         rowsURL: `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${line}/${name}/lastValue`,
         enablePolling: true,
         dataRefreshRate: 1
      },
      title: {
         text: ""
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
         tickAmount: 2,
         max: 2000,
         min: 0,
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
            lineWidth: 1,
            radius: "99%",
            innerRadius: "81%"
         }
      },
      pane: {
         size: '150%',
         innerSize: '0%',
         startAngle: -90,
         endAngle: 90,
         center: ["50%", "80%"],
         background: {
            outerRadius: '100%',
            innerRadius: '80%',
            backgroundColor: `var(--bg-dark)`,
            borderWidth: 4,
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