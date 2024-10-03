'use client'
import React, { MouseEventHandler, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSession } from 'next-auth/react';
import { LiveChart } from "./liveChart";
import { createThemes } from "@/styles/themes";
import { Loading } from "@/components/loading.component";
import { GaugeChart } from './gaugeChart';
import { BoolChart } from './boolChart';
import { FaPlus } from "react-icons/fa6";
import RGL, { WidthProvider } from "react-grid-layout";

const GridLayout = WidthProvider(RGL);


const ExpandedComponent = ({ data }: any) => {
   const { data: session, status, update } = useSession();
   const [layoutConf, setLayoutConf] = useState([]);

   useEffect(() => {
      setLayoutConf(session?.user.config.live[data.line] as any)
   }, [data, session])

   function handleDel(i: any): void {
      if (session) {
         let user = session.user;
         console.log('user: ', user);
         user.config.live[data.line].splice(i, 1);
         console.log('user: ', user);
         update(user);
      }

   }

   if (layoutConf == undefined) return <Loading />

   const width = window.innerWidth - 105;

   return (
      <GridLayout
         className="layout"
         layout={layoutConf}
         cols={16}
         rowHeight={30}
         width={width}
         draggableHandle=".dragHandle"
      >
         {layoutConf.map((chart: any, index: number) => {
            chart.i = index.toString();
            if (chart.type == 'line') {
               return < div key={chart.i}>
                  <div className="flex flex-row justify-between">
                     <span className=" flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">[DRAG HERE]</span>
                     <FaPlus size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaPlus>
                  </div>
                  <LiveChart
                     i={chart.i}
                     line={data.line}
                     name={chart.name}
                     unit={chart.unit}
                     interval={data.interval}
                  />
               </div>
            } else if (chart.type == 'gauge') {
               return < div key={chart.i}>
                  <div className="flex flex-row justify-between">
                     <span className=" flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">[DRAG HERE]</span>
                     <FaPlus size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaPlus>
                  </div>
                  <GaugeChart
                     i={chart.i}
                     line={data.line}
                     name={chart.name}
                     unit={chart.unit}
                  />
               </div>
            } else if (chart.type == 'bool') {
               return < div key={chart.i}>
                  <div className="flex flex-row justify-between">
                     <span className=" flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">[DRAG HERE]</span>
                     <FaPlus size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaPlus>
                  </div>
                  <BoolChart
                     i={chart.i}
                     line={data.line}
                     name={chart.name}
                  />
               </div>
            }
         })}
      </GridLayout >
   );
}

const handleAdd = (row: any, session: any, update: any) => async (event: any) => {
   let user = session.user;

   const newData = {
      i: (user.config.live[row.line].length).toString(),
      x: 8,
      y: 0,
      w: 4,
      h: 7,
      type: row.type,
      name: row.sensor
   };
   user.config.live[row.line].push(newData);
   update(user);
}

export function LinesTable({ lines, interval, sensors }: any) {
   const { data: session, status, update } = useSession();
   let columns: any = [{
      name: 'Line',
      selector: (row: any) => row.line,
      sortable: true,
      grow: 6,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Selects',
      cell: (row: any) => (
         <div className='flex flex-row mr-2'>
            <select id="line" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
               onChange={e => {
                  row.type = e.target.value;
               }}>
               <option key='line' value='line'>Line</option>
               <option key='gauge' value='gauge'>Gauge</option>
               <option key='bool' value='bool'>Bool</option>
            </select>

            <select className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
               onChange={e => {
                  row.sensor = e.target.value;
               }}>
               {sensors[row.line].map((sensor: any, i: number) => {
                  return <option key={i} value={`${sensor.name}`} tabIndex={i}>
                     {sensor.name}
                  </option>
               })}
            </select>
         </div>
      ),
      grow: 1,
      ignoreRowClick: true,
      button: false,
   },
   {
      name: 'Accions',
      cell: (row: any) => (
         <FaPlus size={20} onClick={handleAdd(row, session, update)} className='cursor-pointer mx-3 my-1 text-accent'>ADD Graph</FaPlus>
      ),
      grow: 1,
      ignoreRowClick: true,
      button: true,
   }];

   const data = lines.map((line: string) => {
      return ({
         line: line,
         interval: interval,
         type: 'line',
         sensor: sensors[line][0].name
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