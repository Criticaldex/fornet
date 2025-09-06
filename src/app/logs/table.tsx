'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { SensorIface } from "@/schemas/sensor";
import { useForm, UseFormReset } from "react-hook-form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";

export function LogsTable({ sensors, session }: any) {

   const [rows, setRows] = useState(sensors);
   const [filterText, setFilterText] = useState('');

   const filteredItems = rows.filter(
      (item: any) => item.name && item.name.toLowerCase().includes(filterText.toLowerCase()),
   );

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex grow m-2">
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
      resetField,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<SensorIface>();

   let columns: any = [
      {
         name: 'Line',
         selector: (row: any) => row.line,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Node',
         selector: (row: any) => row.node,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'PLC Name',
         selector: (row: any) => row.plc_name,
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
         name: 'Unit',
         selector: (row: any) => row.unit,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Address',
         selector: (row: any) => row.address,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Modbus DataType',
         selector: (row: any) => row.dataType,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      }
   ];

   createThemes();

   return (
      <>
         {
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
         }
      </>
   )
};

