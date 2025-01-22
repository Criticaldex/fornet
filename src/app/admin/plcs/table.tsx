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
         <div className="flex justify-end grow m-2">
            <input
               id="search"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4`}
               placeholder="Name"
               aria-label="Search Input"
               value={filterText}
               onChange={(e: any) => setFilterText(e.target.value)}
            />
         </div>
      );
   }, [filterText]);

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
         message: '⚠️ Deleting ' + row.name + ' in ' + row.line + ' line and ALL sensors and values attached to this plc ⚠️ Are you sure?',
         buttons: [
            {
               label: 'Yes',
               onClick: async () => {
                  const dPlc = await deletePlc(row, session?.user.db);
                  const dSensor = await deleteSensor({ line: row.line, plc_name: row.name }, session?.user.db);
                  const dValue = await deleteValues({ line: row.line, plc_name: row.name }, session?.user.db);

                  if (dPlc) {
                     toast.error('PLC Deleted!!', { theme: "colored" });
                     setRows(await getPlcs(session?.user.db));
                  }
                  if (dSensor.acknowledged) {
                     toast.error(dSensor.deletedCount + 'Sensors Deleted!!', { theme: "colored" });
                  }
                  if (dValue.acknowledged) {
                     toast.error(dValue.deletedCount + ' Values Deleted!!', { theme: "colored" });
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
         name: 'Accions',
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

