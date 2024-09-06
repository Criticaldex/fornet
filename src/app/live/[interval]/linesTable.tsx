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
      { i: "line", x: 0, y: 0, w: 8, h: 9 },
      { i: "gauge", x: 8, y: 0, w: 4, h: 6 },
      { i: "bool", x: 12, y: 0, w: 2, h: 3, minW: 2, maxW: 4 },
      { i: "bool2", x: 14, y: 0, w: 2, h: 3, minW: 2, maxW: 4 },
      { i: "gauge2", x: 8, y: 3, w: 4, h: 6 },
      { i: "gauge3", x: 12, y: 3, w: 4, h: 6 },
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
         <div key="line">
            <LiveChart
               // key={i}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'5'}
               units={units}
               interval={data.interval}
            />
         </div>
         <div key="gauge">
            <GaugeChart
               // key={'1'}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'9'}
               units={units}
               min={0}
               max={2000}
            />
         </div>
         <div key="bool">
            <BoolChart
               // key={i}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'1'}
               units={units}
               interval={data.interval}
            />
         </div>
         <div key="bool2">
            <BoolChart
               // key={i}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'1'}
               units={units}
               interval={data.interval}
            />
         </div>
         <div key="gauge2">
            <GaugeChart
               // key={'1'}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'9'}
               units={units}
               min={0}
               max={2000}
            />
         </div>
         <div key="gauge3">
            <GaugeChart
               // key={'1'}
               title={'productividad'}
               line={data.line}
               names={names}
               index={'9'}
               units={units}
               min={0}
               max={2000}
            />
         </div>
      </GridLayout >
   );
}

const handleAdd = (row: any) => (event: any) => {
   console.log('AAAAAAAAAAa');
}

export function LinesTable({ lines, interval }: any) {
   let columns: any = [{
      name: 'Line',
      selector: (row: any) => row.line,
      sortable: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   },
   {
      name: 'Accions',
      cell: (row: any) => (
         <div className='flex flex-row mr-4'>
            <select id="line" className={'text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 border-foreground'}>
               <option key='line' value='line'>Line</option>
               <option key='gauge' value='gauge'>Gauge</option>
               <option key='bool' value='bool'>Bool</option>
            </select>
            <FaPlus size={20} onClick={handleAdd(row)} className='cursor-pointer mx-3 my-1 text-accent'>ADD Graph</FaPlus>
            {/* <FaTrashCan onClick={deleteHandler(row)} className='cursor-pointer m-1'>Delete</FaTrashCan> */}
         </div>
      ),
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