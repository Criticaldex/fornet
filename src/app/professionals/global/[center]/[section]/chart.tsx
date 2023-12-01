'use client'
import Highcharts from 'highcharts/highstock'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import React from 'react'


if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
}

var objetivos: any[] = []

function renderMarkers(this: any) {
   if (!isNaN(objetivos[0])) {
      var positions = objetivos.map(objetivo => Math.abs(objetivo))
      var objetivosTxt = objetivos.map(objetivo => {
         if (objetivo < 0) return '< ' + objetivo.toString().substring(1)
         else return objetivo.toString()
      })
      var chart: any
      if (Highcharts.charts[Highcharts.charts.length - 1] != undefined) {
         chart = Highcharts.charts[Highcharts.charts.length - 1]
      } else {
         chart = this
      }
      var xAxis = chart.xAxis[0],
         yAxis = chart.yAxis[0],
         renderer = chart.renderer,
         tempArray: any[] = [],
         singleMarkerPath;

      if (chart.additionalMarkers) {
         chart.additionalMarkers.forEach(function (marker: any, index: any) {
            marker.attr({
               d: "" // Cambia el nuevo path de la marca
            });
            marker.dataLabel.attr({
               text: ""
            });
         });
      }

      positions.forEach(function (position: any, index: any) {
         singleMarkerPath = [
            'M', xAxis.toPixels(-0.35 + index), yAxis.toPixels(position),
            'L', xAxis.toPixels(0.34 + index), yAxis.toPixels(position)
         ];

         if (!chart.additionalMarkers) {
            var marker = renderer.path(singleMarkerPath)
               .attr({
                  'stroke-width': 1.5,
                  stroke: 'var(--red)',
               })
               .add();

            var label = renderer.label(objetivosTxt[index], xAxis.toPixels(-0.40 + index), yAxis.toPixels(position) - 20)
               .css({
                  color: 'black',
                  fontSize: '12px'
               })
               .add();

            marker.dataLabel = label; // Asociar la etiqueta al marcador
            tempArray.push(marker)
         } else {
            chart.additionalMarkers[index].attr({
               d: singleMarkerPath
            })
            var label = renderer.label(objetivosTxt[index].toString(), xAxis.toPixels(-0.40 + index), yAxis.toPixels(position) - 20)
               .css({
                  color: 'black',
                  fontSize: '12px'
               })
               .add();
            chart.additionalMarkers[index].dataLabel.destroy()
            chart.additionalMarkers[index].dataLabel = label;
         }
      });

      if (!chart.additionalMarkers) {
         chart.additionalMarkers = tempArray;
      }
   }
}

export function Chart({ name, data, index, objectius }: any) {
   React.useEffect(() => {
      window.addEventListener('resize', () => {
         setTimeout(function () {
            renderMarkers()
         }, 200)
      })
      return () => window.addEventListener('resize', () => {
         setTimeout(function () {
            renderMarkers()
         }, 200)
      })
   });

   objetivos = objectius

   const options = {
      ...chartOptions,
      chart: {
         ...chartOptions.chart,
         type: 'column',
         spacingTop: 20,
         events: {
            load: renderMarkers
         }
      },
      series: data,
      title: {
         text: name
      },
      xAxis: {
         categories: index,
         zoomEnabled: false
      },
      legend: {
         enabled: false
      },
   }

   return (
      <div className="bg-bgLight rounded-md px-3">
         <HighchartsReact
            highcharts={Highcharts}
            options={options}
         />
      </div>
   )
}