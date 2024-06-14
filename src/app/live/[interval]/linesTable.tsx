'use client'
import React, { Component, useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { useSession } from 'next-auth/react';
import { LiveChart } from "./liveChart";
import { createThemes } from "@/styles/themes";
import { getNames } from '@/services/values';
import { Loading } from "@/components/loading.component";

const ExpandedComponent = ({ data }: any) => {
   const { data: session, status } = useSession();
   const [names, setNames] = useState(null);
   const [isLoading, setLoading] = useState(true);


   useEffect(() => {
      getNames({ line: data.line }, session?.user.db)
         .then((res: any) => {
            setNames(res);
            setLoading(false)
         });
   }, [data, session?.user.db])

   if (isLoading) return <Loading />

   return (
      <>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
                  interval={data.interval}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
                  interval={data.interval}
               />
            </div>
         </div>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
                  interval={data.interval}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
                  interval={data.interval}
               />
            </div>
         </div>
      </>
   );
}

export function LinesTable({ lines, interval }: any) {
   let columns: any = [{
      name: 'Line',
      selector: (row: any) => row.line,
      sortable: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   }];

   const data = lines.map((line: String) => {
      return ({
         line: line,
         interval: interval
      })
   });

   data[0].defaultExpanded = true;

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