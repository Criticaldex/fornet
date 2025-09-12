'use client'
import React, { useEffect, useState } from 'react';
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
import { CandleChart } from './candleChart';

const GridLayout = WidthProvider(RGL);

const ExpandedComponent = ({ data }: any) => {
   const { data: session, update } = useSession();
   const [layoutConf, setLayoutConf] = useState([]);
   const [windowWidth, setWindowWidth] = useState(0); // Start with 0 to indicate not ready
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      // Set initial width and handle resize
      const handleResize = () => {
         setWindowWidth(window.innerWidth);
      };

      // Set initial width and mark as client-side
      handleResize();
      setIsClient(true);

      // Add resize listener
      window.addEventListener('resize', handleResize);

      // Cleanup
      return () => window.removeEventListener('resize', handleResize);
   }, []);

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

   if (layoutConf == undefined || !isClient || windowWidth === 0) return <Loading />

   const width = windowWidth - 105;

   async function saveUser(user: any) {
      await updateConfig(user);
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
               const key = index.toString();
               if (chart.type == 'line') {
                  return < div key={key} className='bg-bgLight rounded-md overflow-hidden flex flex-col h-full'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark shrink-0">
                        <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing truncate px-2">{chart.name} ({chart.unit})</span>
                        <FaXmark size={20} onClick={() => { handleDel(index); }} className='cursor-pointer mx-3 my-1 text-accent shrink-0'>Remove Graph</FaXmark>
                     </div>

                     <div className="flex-1 min-h-0 overflow-hidden p-2">
                        <LiveChart
                           i={key}
                           line={data.line}
                           name={chart.name}
                           unit={chart.unit}
                           interval={data.interval}
                        />
                     </div>
                  </div>
               } else if (chart.type == 'gauge') {
                  return < div key={key} className='bg-bgLight rounded-md overflow-hidden flex flex-col h-full'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark shrink-0">
                        <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing truncate px-2">{chart.name} ({chart.unit})</span>
                        <FaXmark size={20} onClick={() => { handleDel(index); }} className='cursor-pointer mx-3 my-1 text-accent shrink-0'>Remove Graph</FaXmark>
                     </div>
                     <div className="flex-1 min-h-0 overflow-hidden p-2">
                        <GaugeChart
                           i={key}
                           line={data.line}
                           name={chart.name}
                           unit={chart.unit}
                           minrange={chart.minrange}
                           maxrange={chart.maxrange}
                        />
                     </div>
                  </div>
               } else if (chart.type == 'bool') {
                  return < div key={key} className='bg-bgLight rounded-md overflow-hidden flex flex-col h-full'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark shrink-0">
                        <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing truncate px-2">{chart.name}</span>
                        <FaXmark size={20} onClick={() => { handleDel(index); }} className='cursor-pointer mx-3 my-1 text-accent shrink-0'>Remove Graph</FaXmark>
                     </div>
                     <div className="flex-1 min-h-0 overflow-hidden p-2">
                        <BoolChart
                           i={key}
                           line={data.line}
                           name={chart.name}
                        />
                     </div>
                  </div>
               } else if (chart.type == 'candle') {
                  return < div key={key} className='bg-bgLight rounded-md overflow-hidden flex flex-col h-full'>
                     <div className="flex flex-row justify-between rounded-t-md bg-gradient-to-b from-40% from-bgLight to bg-bgDark shrink-0">
                        <span className="flex-grow text-center dragHandle cursor-grab active:cursor-grabbing truncate px-2">{chart.name} ({chart.unit})</span>
                        <FaXmark size={20} onClick={() => { handleDel(index); }} className='cursor-pointer mx-3 my-1 text-accent shrink-0'>Remove Graph</FaXmark>
                     </div>
                     <div className="flex-1 min-h-0 overflow-hidden p-2">
                        <CandleChart
                           i={key}
                           line={data.line}
                           name={chart.name}
                           unit={chart.unit}
                           interval={data.interval}
                        />
                     </div>
                  </div>
               }
            })
         }
      </GridLayout >
   );
}

const handleAdd = (row: any, session: any, update: any, selected: any, sensors: any) => async (event: any) => {
   // Check if sensors are available for this line
   if (!sensors[row.line] || sensors[row.line].length === 0) {
      alert('No sensors available for this line. Please add sensors first.');
      return;
   }

   // Check if a sensor is selected
   if (!selected[row.line]?.sensor) {
      alert('Please select a sensor before adding a chart.');
      return;
   }

   let user = session.user;

   // Determine dimensions based on chart type
   let chartWidth = 4, chartHeight = 11;
   switch (selected[row.line].type) {
      case 'gauge':
         chartWidth = 2;
         chartHeight = 7;
         break;
      case 'bool':
         chartWidth = 1;
         chartHeight = 3;
         break;
      default:
         chartWidth = 4;
         chartHeight = 11;
         break;
   }

   // Find the best available position
   const findBestPosition = (existingCharts: any[], width: number, height: number) => {
      const gridCols = 8; // Grid has 8 columns

      // Create a grid to track occupied spaces
      let maxY = 0;
      existingCharts.forEach(chart => {
         maxY = Math.max(maxY, chart.y + chart.h);
      });

      // Try to find space from top-left, row by row
      for (let y = 0; y <= maxY; y++) {
         for (let x = 0; x <= gridCols - width; x++) {
            // Check if this position is available
            let canPlace = true;

            for (let checkY = y; checkY < y + height && canPlace; checkY++) {
               for (let checkX = x; checkX < x + width && canPlace; checkX++) {
                  // Check if any existing chart occupies this space
                  for (const chart of existingCharts) {
                     if (checkX >= chart.x && checkX < chart.x + chart.w &&
                        checkY >= chart.y && checkY < chart.y + chart.h) {
                        canPlace = false;
                        break;
                     }
                  }
               }
            }

            if (canPlace) {
               return { x, y };
            }
         }
      }

      // If no space found, place at bottom
      return { x: 0, y: maxY };
   };

   const position = findBestPosition(session.user.config.live[row.line], chartWidth, chartHeight);

   let newData = {
      i: (user.config.live[row.line].length).toString(),
      x: position.x,
      y: position.y,
      w: chartWidth,
      h: chartHeight,
      type: selected[row.line].type,
      name: selected[row.line].sensor,
      unit: selected[row.line].unit,
      minrange: selected[row.line].minrange,
      maxrange: selected[row.line].maxrange
   };

   user.config.live[row.line].push(newData);
   update(user);
};

export function LinesTable({ lines, interval, sensors, types, selected: initialSelected }: any) {
   const { data: session, update } = useSession();
   const [isClient, setIsClient] = useState(false);

   // Initialize state for selected values
   const [selected, setSelected] = useState(() => {
      const init: any = {};
      lines.forEach((line: string) => {
         const lineSensors = sensors[line];
         const hasValidSensors = lineSensors && Array.isArray(lineSensors) && lineSensors.length > 0;

         init[line] = initialSelected[line] || {
            type: types[0] || 'line',
            sensor: hasValidSensors ? lineSensors[0]?.name : null,
            unit: hasValidSensors ? lineSensors[0]?.unit : null,
            minrange: hasValidSensors ? lineSensors[0]?.minrange : null,
            maxrange: hasValidSensors ? lineSensors[0]?.maxrange : null,
            noSensors: !hasValidSensors
         };
      });
      return init;
   });

   useEffect(() => {
      setIsClient(true);
   }, []);

   // Show loading until client-side is ready
   if (!isClient) {
      return <Loading />;
   }
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
         return (
            <div className='flex flex-row mr-2 justify-end items-center '>
               <select id="line" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
                  value={selected[row.line]?.type || types[0]}
                  onChange={e => {
                     setSelected((prev: any) => ({
                        ...prev,
                        [row.line]: {
                           ...prev[row.line],
                           type: e.target.value
                        }
                     }));
                  }}>
                  {types.map((type: any, i: number) => {
                     return <option key={i} value={`${type}`} tabIndex={i}>
                        {type}
                     </option>
                  })}
               </select>

               <select id="sensor" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 border-foreground'}
                  value={selected[row.line]?.sensor || ''}
                  disabled={!sensors[row.line] || sensors[row.line].length === 0}
                  onChange={e => {
                     const sensorName = e.target.value;

                     // Find the sensor data
                     const sensorData = sensors[row.line]?.find((s: any) => s.name === sensorName);
                     if (sensorData) {
                        setSelected((prev: any) => ({
                           ...prev,
                           [row.line]: {
                              ...prev[row.line],
                              sensor: sensorData.name,
                              unit: sensorData.unit,
                              maxrange: sensorData.maxrange,
                              minrange: sensorData.minrange
                           }
                        }));
                     }
                  }}>
                  {!sensors[row.line] || sensors[row.line].length === 0 ? (
                     <option value="">No sensors available</option>
                  ) : (
                     sensors[row.line].map((sensor: any, i: number) => {
                        return <option key={i} value={sensor.name} tabIndex={i}>
                           {sensor.name}
                        </option>
                     })
                  )}
               </select>
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
         );
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
         interval: interval,
         type: 'line',
         sensor: hasValidSensors ? lineSensors[0].name : null,
         hasValidSensors
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