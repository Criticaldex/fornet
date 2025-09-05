'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { PlcForm } from "./form";
import { PlcIface } from "@/schemas/plc";
import { useForm, UseFormReset } from "react-hook-form";
import { deletePlc, getPlcs } from '@/services/plcs';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { deleteValues } from '@/services/values';
import { deleteMqtt, sendMqtt } from '@/services/mqtts';
import { mongo } from 'mongoose';
import { deleteSensor } from '@/services/sensors';

export function PlcTable({ plcs, nodes, session }: any) {

   const [rows, setRows] = useState(plcs);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true)
   }, [])

   const filteredItems = rows.filter(
      (item: any) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()),
   );

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex flex-col gap-2 p-2 w-full">
            <div className="flex flex-wrap gap-2 items-center justify-between">
               {/* Text Search */}
               <div className="flex items-center gap-2">
                  <input
                     id="search"
                     type="text"
                     className="text-textColor border-b-2 bg-bgDark rounded-md p-2 min-w-64"
                     placeholder="Search..."
                     aria-label="Search Input"
                     value={filterText}
                     onChange={(e: any) => setFilterText(e.target.value)}
                  />
               </div>

               {/* Refresh Button */}
               <button
                  className={`bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40 my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-accent`}
                  onClick={async () => {
                     setRows(await getPlcs(session?.user.db));
                  }}
               >
                  Refresh
               </button>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
               <div className="text-sm text-textColor">
                  Showing {filteredItems.length} of {rows?.length || 0} PLCs
               </div>
            </div>
         </div>
      );
   }, [filterText, filteredItems.length, rows?.length, session?.user.db]);

   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<PlcIface>();

   const editHandler = (row: PlcIface, reset: UseFormReset<PlcIface>) => (event: any) => {
      reset(row)
   }

   const deleteHandler = (row: any) => (event: any) => {
      confirmAlert({
         message: '⚠️ Deleting ' + row.name + ' in ' + row.line + ' line and ALL sensors, values, and MQTT entries attached to this plc ⚠️ Are you sure?',
         buttons: [
            {
               label: 'Yes',
               onClick: async () => {
                  const dPlc = await deletePlc(row, session?.user.db);
                  const dSensor = await deleteSensor({ line: row.line, plc_name: row.name }, session?.user.db);
                  const dValue = await deleteValues({ line: row.line, plc_name: row.name }, session?.user.db);
                  const dMqtt = await deleteMqtt({ line: row.line, plc: row.name }, session?.user.db);

                  // Send MQTT notification about PLC deletion
                  if (dPlc && row.node) {
                     sendMqtt(session.user.db + row.node, 'true');
                  }

                  if (dPlc) {
                     toast.error('PLC Deleted!!', { theme: "colored" });
                     setRows(await getPlcs(session?.user.db));
                  }
                  if (dSensor.acknowledged) {
                     toast.error(dSensor.deletedCount + ' Sensors Deleted!!', { theme: "colored" });
                  }
                  if (dValue.acknowledged) {
                     toast.error(dValue.deletedCount + ' Values Deleted!!', { theme: "colored" });
                  }
                  if (dMqtt.acknowledged) {
                     toast.error(dMqtt.deletedCount + ' MQTT entries Deleted!!', { theme: "colored" });
                  }
               }
            },
            {
               label: 'No',
            }
         ]
      });
   }

   let columns: any = [
      {
         name: 'Line',
         selector: (row: any) => row.line,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'node',
         selector: (row: any) => row.node,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Name',
         selector: (row: any) => row.name,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'IP',
         selector: (row: any) => row.ip,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Type',
         selector: (row: any) => row.type,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Actions',
         cell: (row: any) => (
            <div className='flex flex-row'>
               <FaPenToSquare onClick={editHandler(row, reset)} className='cursor-pointer m-1'>Edit</FaPenToSquare>
               <FaTrashCan onClick={deleteHandler(row)} className='cursor-pointer m-1'>Delete</FaTrashCan>
            </div>
         ),
         ignoreRowClick: true,
         button: true,
      }
   ];

   createThemes();

   return (
      <>
         {isClient ?
            <div className="flex mt-2">
               <ToastContainer />
               <div className="mr-2 basis-3/4 rounded-md">
                  <DataTable
                     columns={columns}
                     data={filteredItems}
                     theme={'custom'}
                     pagination
                     subHeader
                     subHeaderComponent={subHeaderComponentMemo}
                     persistTableHead
                  />
               </div>
               <div className="flex basis-1/4 rounded-md bg-light">
                  <PlcForm
                     register={register}
                     handleSubmit={handleSubmit}
                     errors={errors}
                     setRows={setRows}
                     toast={toast}
                     reset={reset}
                     clearErrors={clearErrors}
                     session={session}
                     nodes={nodes}
                  />
               </div>
            </div>
            : <Loading />}
      </>
   )
};

