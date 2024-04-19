'use client'
import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';
import { LiveChart } from "./liveChart";
import { createThemes } from "@/styles/themes";
import { getNames } from '@/services/values';
import { Loading } from "@/components/loading.component";

const ExpandedComponent = ({ data }: any) => {
   const [names, setNames] = useState(null);
   const [isLoading, setLoading] = useState(true);

   useEffect(() => {
      getNames({ line: data.line })
         .then((res: any) => {
            setNames(res);
            console.log('res: ', res);
            setLoading(false)
         });
   }, [data.line])

   if (isLoading) return <Loading />

   return (
      <>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
               />
            </div>
         </div>
         <div className="flex flex-nowrap mt-2">
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
               />
            </div>
            <div className="m-2 basis-2/4 bg-bgLight rounded-md">
               <LiveChart
                  title={'productividad'}
                  line={data.line}
                  names={names}
               />
            </div>
         </div>
      </>
   );
}

export function LinesTable({ lines }: any) {
   console.log('lines: ', lines);

   let columns: any = [{
      name: 'Line',
      selector: (row: any) => row.line,
      sortable: true,
      style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
   }];

   const data = lines.map((line: String) => {
      console.log('line: ', line);
      return ({ line: line })
   });

   console.log('data: ', data);


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
         />
      </div>
   )
};