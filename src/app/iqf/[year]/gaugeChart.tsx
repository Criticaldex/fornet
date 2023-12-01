'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import highchartsMore from "highcharts/highcharts-more"
import solidGauge from "highcharts/modules/solid-gauge";

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   highchartsMore(Highcharts);
   solidGauge(Highcharts);
}

export function GaugeChart({ data, numColor }: any) {

   const options = {
      ...chartOptions,
      chart: {
         type: 'solidgauge',
         spacingTop: 30,
         height: '50%',
         margin: [0, 0, 0, 0],
         spacing: [0, 0, 0, 0],
      },
      title: {
         text: ""
      },
      series: [{
         name: data.name,
         data: [{
            color: numColor,
            radius: '90%',
            innerRadius: '70%',
            y: data.data[data.data.length - 1]
         }]
      }],
      yAxis: {
         ...chartOptions.yAxis,
         lineWidth: 0,
         tickPositions: [],
         max: 100,
         min: 0,
      },
      plotOptions: {
         solidgauge: {
            dataLabels: {
               enabled: true,
               align: 'center',
               format: '<p style="font-size: 35px;color: {point.color}; font-weight: bold;">{point.y}</p>',
               borderWidth: 0,
               style: {
                  textOutline: 'none'
               }
            },
            linecap: 'round',
            stickyTracking: false,
            rounded: true
         }
      },
      pane: {
         size: '100%',
         background: {
            outerRadius: '90%',
            innerRadius: '70%',
            backgroundColor: numColor + '50',
            borderWidth: 0
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
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}