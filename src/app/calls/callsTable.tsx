'use client'
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { CallsChart } from "./callsChart";
import { IntervalsChart } from "./intervalsChart";
import { createThemes } from "@/styles/themes";
import { getDashboardChart } from "@/services/calls";
import { getHoursChart, getHoursDrilldown, getIntervalsChart, getIntervalsDrilldown } from "@/services/call_intervals";
import { Loading } from "@/components/loading.component";
import { when } from 'jquery';

let hoursChart: any = null;
let intervalsChart: any = null;

const hoursChartCreated = (chart: any) => {
   if (!chart.options.chart.forExport) {
      hoursChart = chart;
   }
}

const intervalsChartCreated = (chart: any) => {
   if (!chart.options.chart.forExport) {
      intervalsChart = chart;
   }
}

const monthHandler = (month: number, setMonth: any, setMonthString: any, year: number, setYear: any, modifier: string) => (event: any) => {
   const pad = '00';
   switch (modifier) {
      case '<':
         if (month == 0) {
            setMonth(11)
            setMonthString('12')
            setYear(year - 1)
         } else {
            setMonth(month - 1)
            setMonthString((pad + month).slice(-pad.length));
         }
         break;
      case '>':
         if (month == 11) {
            setMonth(0)
            setMonthString('1')
            setYear(year + 1)
         } else {
            setMonth(month + 1);
            setMonthString((pad + (month + 2)).slice(-pad.length));
         }
         break;
      default:
         break;
   }
};

const ExpandedComponent = ({ data }: any) => {
   // const year = new Date().getFullYear().toString();
   const monthName = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
   const hoy = new Date()
   const ayer = new Date(hoy)
   ayer.setDate(hoy.getDate() - 1)
   const pad = '00';


   const [day, setDay] = useState(ayer.getDate());
   const [month, setMonth] = useState(ayer.getMonth());
   const [year, setYear] = useState(ayer.getFullYear());
   const [dayString, setDayString] = useState((pad + day).slice(-pad.length));
   const [monthString, setMonthString] = useState((pad + (month + 1).toString()).slice(-pad.length));
   const [detallMes, setDetallMes] = useState(null);
   const [hores, setHores] = useState(null);
   const [horesDD, setHoresDD] = useState(null);
   const [intervals, setIntervals] = useState(null);
   const [intervalsDD, setIntervalsDD] = useState(null);
   const [isLoading, setLoading] = useState(true);

   useEffect(() => {
      getDashboardChart(year.toString(), monthString, data.centro)
         .then((res: any) => {
            setDetallMes(res);
         });
   }, [year, monthString, data.centro])

   useEffect(() => {
      if (hoursChart) {
         hoursChart.drillUp();
      }

      if (intervalsChart) {
         intervalsChart.drillUp();
      }

      when(
         getHoursChart(year.toString(), monthString, dayString, data.centro)
            .then((res: any) => {
               setHores(res);
            }),
         getIntervalsChart(year.toString(), monthString, dayString, data.centro)
            .then((res: any) => {
               // console.log('intervals. ', res);
               setIntervals(res);
            }),
         getHoursDrilldown(year.toString(), monthString, dayString, data.centro)
            .then((res: any) => {
               setHoresDD(res);
            }),
         getIntervalsDrilldown(year.toString(), monthString, dayString, data.centro)
            .then((res: any) => {
               // console.log('intervalsDD. ', res);
               setIntervalsDD(res);
            })
      ).done(() => {
         setLoading(false)
      })
   }, [data.centro, dayString, monthString, year])

   if (isLoading) return <Loading />

   return (
      <>
         <div className='flex justify-center'>
            <button className='m-1 px-2 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight' onClick={monthHandler(month, setMonth, setMonthString, year, setYear, '<')}>&lt;</button>
            <button className='m-1 px-2 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight' onClick={monthHandler(month, setMonth, setMonthString, year, setYear, '>')}>&gt;</button>
         </div>
         <CallsChart
            name={monthName[month] + ' ' + year}
            data={detallMes}
            setter={setDayString}
         />
         <div className='flex'>
            <div className='basis-1/2'>
               <IntervalsChart
                  name={'Hores ' + dayString + '/' + monthString + '/' + year.toString()}
                  data={hores}
                  dd={horesDD}
                  callback={hoursChartCreated}
               />
            </div>
            <div className='basis-1/2'>
               <IntervalsChart
                  name={'Intervals ' + dayString + '/' + monthString + '/' + year.toString()}
                  data={intervals}
                  dd={intervalsDD}
                  callback={intervalsChartCreated}
               />
            </div>
         </div>
      </>
   );
}

export function CallsTable({ date, data, centros }: any) {
   let columns: any = [{
      name: 'Centre',
      selector: (row: any) => row.centroName,
      sortable: true,
      grow: 3,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Abandonades',
      selector: (row: any) => row.abandoned,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Contestades',
      selector: (row: any) => row.answered,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Totals',
      selector: (row: any) => row.offered,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Desviades',
      selector: (row: any) => row.overflowed,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Temps Resposta',
      selector: (row: any) => row.answered_time,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Temps Abandó',
      selector: (row: any) => row.abandoned_time,
      sortable: true,
      minWidth: '50px',
      right: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   }];

   data.map((call: any) => {
      centros.map((centro: any) => {
         if (call.centro == centro.id) {
            call.centroName = centro.name;
         } else if (call.centro == 'GS-PEDIATRIA') {
            call.centroName = 'Pediatria';

         }
      });
   });

   createThemes();

   return (
      <div className='flex-col grow'>
         <a className="flex justify-center text-xl font-bold">Trucades {date}</a>
         <DataTable
            className='flex'
            columns={columns}
            data={data}
            theme={'custom'}
            expandableRows
            expandOnRowClicked
            expandableRowsComponent={ExpandedComponent}
         />
      </div>
   )
};