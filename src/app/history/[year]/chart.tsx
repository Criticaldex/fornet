'use client'
import Highcharts from 'highcharts'
import HighchartsMore from 'highcharts/highcharts-more'
import HighchartsExporting from 'highcharts/modules/exporting'
import HighchartsExportData from 'highcharts/modules/export-data'
import HighchartsAccessibility from 'highcharts/modules/accessibility'
import HighchartsReact from 'highcharts-react-official'
import HighchartsNoData from 'highcharts/modules/no-data-to-display'
import highchartsDrilldown from "highcharts/modules/drilldown";
import { chartOptions } from '@/components/chart.components'
import { useEffect, useState } from 'react'
import { Loading } from "@/components/loading.component";


if (typeof Highcharts === "object") {
   HighchartsExporting(Highcharts)
   HighchartsExportData(Highcharts)
   HighchartsNoData(Highcharts)
   HighchartsAccessibility(Highcharts)
   HighchartsMore(Highcharts)
   highchartsDrilldown(Highcharts);
}

export function SummaryChart({ name, data, dd }: any) {

   const [isLoading, setIsLoading] = useState(true);
   useEffect(() => {
      if (dd && data) {
         setIsLoading(false);
      }
   }, [dd, data]);

   const options = {
      ...chartOptions,
      chart: {
         spacingTop: 10,
         height: 400, // Increased height for better shift visualization
      },
      title: {
         text: name,
         style: {
            color: 'var(--textColor)',
            fontSize: '16px',
            fontWeight: 'bold'
         }
      },
      subtitle: {
         text: 'Click on data points to see details by day and shift',
         style: {
            color: 'var(--textColor)',
            fontSize: '12px'
         }
      },
      series: data,
      drilldown: {
         ...dd,
         breadcrumbs: {
            position: {
               align: 'right'
            },
            buttonTheme: {
               fill: 'var(--bgLight)',
               stroke: 'var(--accent)',
               'stroke-width': 1,
               style: {
                  color: 'var(--textColor)',
                  fontSize: '12px'
               },
               states: {
                  hover: {
                     fill: 'var(--bgLight)',
                     stroke: 'var(--accent)',
                     style: {
                        color: 'var(--textColor)'
                     }
                  }
               }
            }
         }
      },
      xAxis: {
         type: 'category',
         labels: {
            style: {
               color: 'var(--textColor)'
            }
         }
      },
      yAxis: {
         labels: {
            style: {
               color: 'var(--textColor)'
            }
         },
         title: {
            style: {
               color: 'var(--textColor)'
            }
         }
      },
      legend: {
         enabled: true, // Enable legend to show shift data
         itemStyle: {
            color: 'var(--textColor)'
         }
      },
      tooltip: {
         crosshairs: true,
         shared: true,
         backgroundColor: 'var(--bgLight)',
         borderColor: 'var(--accent)',
         style: {
            color: 'var(--textColor)'
         },
         formatter: function (this: any) {
            let tooltip = `<b>${this.x}</b><br/>`;
            this.points.forEach((point: any) => {
               if (point.series.type === 'columnrange') {
                  tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: ${point.point.low} - ${point.point.high}<br/>`;
               } else {
                  tooltip += `<span style="color:${point.color}">●</span> ${point.series.name}: ${point.y}<br/>`;
               }
            });
            return tooltip;
         }
      },
      plotOptions: {
         series: {
            borderWidth: 0,
            maxPointWidth: 50, // Increased for better visibility
            dataLabels: {
               enabled: true,
               style: {
                  textOutline: 'none',
                  color: 'var(--textColor)',
                  fontSize: '11px'
               },
               formatter: function (this: any) {
                  // Show different formats based on series type
                  if (this.series.type === 'columnrange') {
                     return `${this.point.low}-${this.point.high}`;
                  }
                  return Math.round(this.y * 100) / 100;
               }
            }
         },
         column: {
            colorByPoint: false,
            colors: ['var(--accent)', 'var(--accent-hover)', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#2196F3']
         },
         columnrange: {
            grouping: false,
            pointPadding: 0.1
         }
      }
   }

   return (
      <>
         {!isLoading ?
            <HighchartsReact
               highcharts={Highcharts}
               options={options}
            />
            : <Loading />}
      </>
   )
}
