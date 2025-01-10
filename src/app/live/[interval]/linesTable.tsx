'use client'
import React, { MouseEventHandler, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { updateConfig } from "@/services/users";
import { useSession } from 'next-auth/react';
import { LiveChart } from "./liveChart";
import { createThemes } from "@/styles/themes";
import { Loading } from "@/components/loading.component";
import { GaugeChart } from './gaugeChart';
import { BoolChart } from './boolChart';
import { FaPlus, FaXmark } from "react-icons/fa6";
import RGL, { WidthProvider } from "react-grid-layout";

const GridLayout = WidthProvider(RGL);

const ExpandedComponent = ({ data }: any) => {
   const { data: session, status, update } = useSession();
   const [layoutConf, setLayoutConf] = useState([]);

   useEffect(() => {
      if (session) {
         let user = session.user;
         if (user.config.live[data.line] != undefined) {
            setLayoutConf(session?.user.config.live[data.line] as any)
         } else {
            user.config.live[data.line] = [];
            update(user);
         }
      }
   }, [data, session, update])

   function handleDel(i: any): void {
      if (session) {
         let user = session.user;
         user.config.live[data.line].splice(i, 1);
         update(user);
      }
   }

   if (layoutConf == undefined) return <Loading />

   const width = window.innerWidth - 105;

   async function saveUser(user: any) {
      const upsert = await updateConfig(user);
      console.log('upsert OK: ', upsert.ok);
   }

   return (
      <GridLayout
         className="layout bg-bgDark rounded-md mt-2"
         layout={layoutConf}
         cols={8}
         rowHeight={width / 50}
         width={width}
         onLayoutChange={(layout) => {
            if (session && layout[0]) {
               let user = session.user;
               user.config.live[data.line].forEach((ele: any, i: number) => {
                  ele.w = layout[i].w;
                  ele.h = layout[i].h;
                  ele.x = layout[i].x;
                  ele.y = layout[i].y;
               });
               update(user);
               saveUser(user);
            }
         }}
         draggableHandle=".dragHandle"
      >
         {
            layoutConf.map((chart: any, index: number) => {
               chart.i = index.toString();
               if (chart.type == 'line') {
                  return < div key={chart.i} className='bg-bgLight rounded-md'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark">
                        <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">{chart.name} ({chart.unit})</span>
                        <FaXmark size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaXmark>
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
                  return < div key={chart.i} className='bg-bgLight rounded-md'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark">
                        <span className=" flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">{chart.name} ({chart.unit})</span>
                        <FaXmark size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaXmark>
                     </div>
                     <GaugeChart
                        i={chart.i}
                        line={data.line}
                        name={chart.name}
                        unit={chart.unit}
                     />
                  </div>
               } else if (chart.type == 'bool') {
                  return < div key={chart.i} className='bg-bgLight rounded-md'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark">
                        <span className=" flex-grow text-center dragHandle cursor-grab active:cursor-grabbing">{chart.name}</span>
                        <FaXmark size={20} onClick={() => { handleDel(chart.i); }} className='cursor-pointer mx-3 my-1 text-accent'>Remove Graph</FaXmark>
                     </div>
                     <BoolChart
                        i={chart.i}
                        line={data.line}
                        name={chart.name}
                     />
                  </div>
               }
            })
         }
      </GridLayout >
   );
}

const handleAdd = (row: any, session: any, update: any, selected: any) => async (event: any) => {
   let user = session.user;
   let maxY = 0;
   session.user.config.live[row.line].forEach((element: { h: number; y: number; }) => {
      const suma = element.y + element.h
      maxY = (maxY < suma) ? suma : maxY;
   });
   let newData = {
      i: (user.config.live[row.line].length).toString(),
      x: 0,
      y: maxY,
      w: 4,
      h: 11,
      type: selected[row.line].type,
      name: selected[row.line].sensor,
      unit: selected[row.line].unit
   };
   switch (selected[row.line].type) {
      case 'gauge':
         newData.w = 2;
         newData.h = 7
         break;
      case 'bool':
         newData.w = 1;
         newData.h = 3
         break;
      default:
         break;
   }

   user.config.live[row.line].push(newData);
   update(user);
}

export function LinesTable({ lines, interval, sensors, types, selected }: any) {
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
         <div className='flex flex-row mr-2 justify-end items-center '>
            <select id="line" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
               onChange={e => {
                  row.type = e.target.value;
                  selected[row.line].type = e.target.value;
               }}>
               {types.map((type: any, i: number) => {
                  return <option key={i} value={`${type}`} tabIndex={i}>
                     {type}
                  </option>
               })}
            </select>

            <select id="sensor" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
               onChange={e => {
                  row.sensor = e.target.value;
                  let fields = e.target.value.split('/');
                  selected[row.line].sensor = fields[0];
                  selected[row.line].unit = fields[1];
               }}>
               {sensors[row.line].map((sensor: any, i: number) => {
                  return <option key={i} value={`${sensor.name}/${sensor.unit}`} tabIndex={i}>
                     {sensor.name}
                  </option>
               })}
            </select>
         </div>
      ),
      grow: 2,
      ignoreRowClick: true,
      button: false,
      center: true
   },
   {
      name: 'Accions',
      cell: (row: any) => (
         <FaPlus size={20} onClick={handleAdd(row, session, update, selected)} className='cursor-pointer mx-3 my-1 text-accent'>ADD Graph</FaPlus>
      ),
      grow: 1,
      ignoreRowClick: true,
      button: true,
      center: true
   }];

   const data = lines.map((line: string) => {
      return ({
         line: line,
         interval: interval,
         type: 'line',
         sensor: sensors[line] ? sensors[line][0].name : null
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