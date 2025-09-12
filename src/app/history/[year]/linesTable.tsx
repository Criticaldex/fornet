'use client'
import React, { MouseEventHandler, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { updateConfig } from "@/services/users";
import { useSession } from 'next-auth/react';
import { createThemes } from "@/styles/themes";
import { FaPlus, FaXmark } from "react-icons/fa6";
import RGL, { WidthProvider } from "react-grid-layout";
import { SummaryChart } from './chart';

const GridLayout = WidthProvider(RGL);

const ExpandedComponent = ({ data }: any) => {

   const { data: session, status, update } = useSession();
   const [layoutConf, setLayoutConf] = useState([]);
   const [lineCharts, setLineCharts] = useState(data.chartsData);
   const [drilldown, setDrilldown] = useState(data.drilldown);

   useEffect(() => {
      if (session) {
         let user = session.user;
         if (user.config.summary[data.line] != undefined) {
            // Use the server-side fetched data instead of making new API calls
            setLineCharts(data.chartsData);
            setDrilldown(data.drilldown);
            setLayoutConf(session?.user.config.summary[data.line] as any);
         } else {
            user.config.summary[data.line] = [];
            update(user);
         }
      }
   }, [data.line, data.year, session, update, data.chartsData, data.drilldown])

   function handleDel(chartId: any): void {
      if (session) {
         let user = session.user;
         // Find the chart by its 'i' property, not array index
         const chartIndex = user.config.summary[data.line].findIndex((chart: any) => chart.i === chartId);
         if (chartIndex !== -1) {
            user.config.summary[data.line].splice(chartIndex, 1);
            update(user);
            console.log(`Deleted chart with id: ${chartId}`);
         } else {
            console.error(`Chart with id ${chartId} not found`);
         }
      }
   }

   const width = window.innerWidth - 105;

   async function saveUser(user: any) {
      const upsert = await updateConfig(user);
   }

   return (
      <GridLayout
         className="layout bg-bgDark rounded-md mt-2"
         layout={layoutConf}
         cols={8}
         rowHeight={width / 50}
         width={width}
         onLayoutChange={(layout) => {
            if (session && layout.length > 0) {
               let user = session.user;
               // Update each chart by matching the layout item's i property with chart's i property
               layout.forEach((layoutItem: any) => {
                  const chart = user.config.summary[data.line].find((c: any) => c.i === layoutItem.i);
                  if (chart) {
                     chart.w = layoutItem.w;
                     chart.h = layoutItem.h;
                     chart.x = layoutItem.x;
                     chart.y = layoutItem.y;
                  }
               });
               update(user);
               saveUser(user);
            }
         }}
         draggableHandle=".dragHandle"
      >
         {
            layoutConf.map((chart: any, index: number) => {
               const key = chart.i;
               return < div key={key} className='bg-bgLight rounded-md overflow-hidden flex flex-col h-full'>
                  <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark shrink-0">
                     <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing truncate px-2">{chart.name}</span>
                     <FaXmark size={20} onClick={() => { handleDel(key); }} className='cursor-pointer mx-3 my-1 text-accent shrink-0'>Remove Graph</FaXmark>
                  </div>
                  <div className="flex-1 min-h-0 overflow-hidden p-2">
                     <SummaryChart
                        i={chart.i}
                        name={chart.name}
                        data={lineCharts[chart.name]}
                        dd={drilldown[chart.name]}
                     />
                  </div>
               </div>
            })
         }
      </GridLayout >
   );
}

const handleAdd = (row: any, session: any, update: any, selected: any, sensors: any) => async (event: any) => {
   const lineSensors = sensors[row.line];
   const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

   if (!hasValidSensors) {
      return; // Don't add chart if no sensors available
   }

   let user = session.user;
   let maxY = 0;
   session.user.config.summary[row.line].forEach((element: { h: number; y: number; }) => {
      const suma = element.y + element.h
      maxY = (maxY < suma) ? suma : maxY;
   });

   // Generate unique ID by finding the highest existing ID and adding 1
   const existingIds = user.config.summary[row.line].map((chart: any) => parseInt(chart.i) || 0);
   const nextId = existingIds.length === 0 ? 0 : Math.max(...existingIds) + 1;

   let newData = {
      i: nextId.toString(),
      x: 0,
      y: maxY,
      w: 4,
      h: 11,
      name: selected[row.line].sensor,
      unit: selected[row.line].unit
   };

   user.config.summary[row.line].push(newData);
   update(user);
}

export function LinesTable({ lines, year, sensors, selected, chartsData, drilldown }: any) {
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
      cell: (row: any) => {
         const lineSensors = sensors[row.line];
         const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

         return (
            <div className='flex flex-row mr-2 justify-end items-center '>
               {hasValidSensors ? (
                  <select id="sensor" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
                     onChange={e => {
                        row.sensor = e.target.value;
                        let fields = e.target.value.split('/');
                        selected[row.line].sensor = fields[0];
                        selected[row.line].unit = fields[1];
                     }}>
                     {lineSensors.map((sensor: any, i: number) => {
                        return <option key={i} value={`${sensor.name}/${sensor.unit}`} tabIndex={i}>
                           {sensor.name}
                        </option>
                     })}
                  </select>
               ) : (
                  <span className="text-gray-400 text-sm p-1 ml-4">
                     No sensors available
                  </span>
               )}
            </div>
         )
      },
      grow: 2,
      ignoreRowClick: true,
      button: false,
      center: true
   },
   {
      name: 'Accions',
      cell: (row: any) => {
         const hasValidSensors = sensors[row.line] && sensors[row.line].length > 0;
         return (
            <FaPlus
               size={20}
               onClick={hasValidSensors ? handleAdd(row, session, update, selected, sensors) : undefined}
               className={`mx-3 my-1 ${hasValidSensors ? 'cursor-pointer text-accent hover:text-accent-dark' : 'cursor-not-allowed text-gray-400'}`}
               title={hasValidSensors ? 'Add Graph' : 'No sensors available'}
            >
               ADD Graph
            </FaPlus>
         )
      },
      grow: 1,
      ignoreRowClick: true,
      button: true,
      center: true
   }];

   const data = lines.map((line: string) => {
      const lineSensors = sensors[line];
      const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

      return ({
         line: line,
         type: 'line',
         year: year,
         sensor: hasValidSensors ? lineSensors[0].name : null,
         chartsData: chartsData[line],
         drilldown: drilldown[line],
         hasValidSensors: hasValidSensors
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