'use client'
import React, { Component, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSession } from 'next-auth/react';
import { LiveChart } from "./liveChart";
import { createThemes } from "@/styles/themes";
import { getNames } from '@/services/sensors';
import { Loading } from "@/components/loading.component";
import { GaugeChart } from './gaugeChart';
import { BoolChart } from './boolChart';
import { FaPlus } from "react-icons/fa6";
import GridLayout from "react-grid-layout";
import { GetLineSensors } from '../routing';

const ExpandedComponent = ({ data }: any) => {
   const { data: session, status } = useSession();
   const [names, setNames] = useState(null);
   const [units, setUnits] = useState(null);
   const [isLoading, setLoading] = useState(true);

   useEffect(() => {
      getNames(data.line, session?.user.db)
         .then((res: any) => {
            setNames(res.names);
            setUnits(res.units);
            setLoading(false)
         });
   }, [data, session?.user.db])

   if (isLoading) return <Loading />

   // const layoutConf: any = session?.user.config.live;
   const layoutConf: any = [
      { i: "1", x: 0, y: 0, w: 8, h: 12, type: 'line', name: 'PiezasOK', unit: 'UDs' },
      { i: "2", x: 8, y: 0, w: 4, h: 7, type: 'gauge', name: 'Velocidad', unit: 'RPM' },
      { i: "3", x: 12, y: 0, w: 2, h: 4, minW: 2, maxW: 4, type: 'bool', name: 'Inductivo' }
   ]

   const width = window.innerWidth - 105;

   return (
      <GridLayout
         className="layout"
         layout={layoutConf}
         cols={16}
         rowHeight={30}
         width={width}
      >
         {layoutConf.map((chart: any, index: number) => {
            if (chart.type == 'line') {
               return < div key={chart.i}>
                  <LiveChart
                     line={data.line}
                     name={chart.name}
                     unit={chart.unit}
                     interval={data.interval}
                  />
               </div>
            } else if (chart.type == 'gauge') {
               return < div key={chart.i}>
                  <GaugeChart
                     line={data.line}
                     name={chart.name}
                     unit={chart.unit}
                  />
               </div>
            } else if (chart.type == 'bool') {
               return < div key={chart.i}>
                  <BoolChart
                     line={data.line}
                     name={chart.name}
                  />
               </div>
            }
         })}
      </GridLayout >
   );
}

const handleAdd = (row: any) => (event: any) => {
   console.log('AAAAAAAAAAa');
}

export function LinesTable({ lines, interval, sensors }: any) {
   let columns: any = [{
      name: 'Line',
      selector: (row: any) => row.line,
      sortable: true,
      grow: 6,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      // name: 'Selects',
      cell: (row: any) => (
         <div className='flex flex-row mr-2'>
            <select id="line" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}>
               <option key='line' value='line'>Line</option>
               <option key='gauge' value='gauge'>Gauge</option>
               <option key='bool' value='bool'>Bool</option>
            </select>

            <GetLineSensors
               sensors={sensors[row.line]}
            />
            {/* <FaPlus size={20} onClick={handleAdd(row)} className='cursor-pointer mx-3 my-1 text-accent'>ADD Graph</FaPlus> */}
         </div>
      ),
      grow: 1,
      ignoreRowClick: true,
      button: false,
   },
   {
      // name: 'Accions',
      cell: (row: any) => (
         <FaPlus size={20} onClick={handleAdd(row)} className='cursor-pointer mx-3 my-1 text-accent'>ADD Graph</FaPlus>
      ),
      grow: 1,
      ignoreRowClick: true,
      button: true,
   }];

   const data = lines.map((line: String) => {
      return ({
         line: line,
         interval: interval
      })
   });

   if (data[0]) {
      data[0].defaultExpanded = true;
   }

   createThemes();

   return (
      <div className='flex-col grow'>
         <a className="flex justify-center text-xl font-bold">Production Lines</a>
         <DataTable
            className='flex'
            columns={columns}
            data={data}
            theme={'custom'}
            expandableRows
            expandOnRowClicked
            expandableRowsComponent={ExpandedComponent}
            expandableRowExpanded={(row: any) => row.defaultExpanded}
         />
      </div>
   )
};