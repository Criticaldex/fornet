'use client'
import Highcharts from 'highcharts'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsReact from 'highcharts-react-official'
import { chartOptions } from '@/components/chart.components'
import { useEffect } from 'react'

if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
}

export function Chart({ name, data, objectiu, categories, setter }: any) {

   let colors = ["#2caffe", "#544fc5", "#00e272", "#fe6a35", "#6b8abc", "#d568fb", "#2ee0ca", "#fa4b42", "#feb56a", "#91e8e12"]
   let centrosClass = ['centrosUniversals', 'centrosHiper', 'centrosSeleccio']
   useEffect(() => {
      centrosClass.forEach(clase => {
         let contenedor = document.getElementsByClassName(clase)
         for (var i = 0; i < contenedor.length; i++) {
            let p = contenedor[i].getElementsByTagName('p')
            p[0].style.borderColor = colors[i].toString()
         };
      })
   }, [])

   let max = 0;
   data.forEach((elem: any) => {
      elem.data.map((i: any) => {
         max = (i > max) ? i : max;
      });
   });
   max = (objectiu > max) ? objectiu : max;
   const options = {
      ...chartOptions,
      chart: {
         type: 'column',
         spacingTop: 30
      },
      title: {
         text: name
      },
      series: data,
      yAxis: {
         ...chartOptions.yAxis,
         max: max
      },
      xAxis: {
         categories: categories,
      },
      legend: {
         enabled: false,
      },
      tooltip: {
         pointFormat: '{series.name}: <b>{point.y} punts</b><br/>'
      },
      plotOptions: {
         series: {
            ...chartOptions.plotOptions.series,
            dataLabels: {
               enabled: true,
               style: {
                  textOutline: 'none'
               }
            },
            events: {
               click: function (event: any) {
                  setter(event.point.category);
               }
            }
         },
      }
   }

   return (
      <HighchartsReact
         highcharts={Highcharts}
         options={options}
      />
   )
}

