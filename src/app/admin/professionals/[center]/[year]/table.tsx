'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { ProfessionalsForm } from "./form";
import { ProfessionalIface } from "@/schemas/professional";
import { useForm, UseFormReset } from "react-hook-form";
import { FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GetLinksCenters, GetLinksYears } from '../../routing';

export function AdminTable({ data, centers, years }: any) {

   const [rows, setRows] = useState(data);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false)

   useEffect(() => {
      setIsClient(true)
   }, [])

   const filteredItems = rows.filter(
      (item: any) => item.identificador && item.identificador.toLowerCase().includes(filterText.toLowerCase())
   );

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex justify-between grow m-2">
            <GetLinksCenters
               centros={centers}
            />
            <GetLinksYears
               years={years}
            />
            <input
               id="search"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4`}
               placeholder="Filtrar per id"
               aria-label="Search Input"
               value={filterText}
               onChange={(e: any) => setFilterText(e.target.value)}
            />
         </div>
      );
   }, [filterText, centers, years]);

   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<ProfessionalIface>();

   const editHandler = (row: ProfessionalIface, reset: UseFormReset<ProfessionalIface>) => (event: any) => {
      reset()
      reset(row)
   }

   let columns: any = [
      {
         name: 'id',
         selector: (row: any) => row.identificador,
         grow: 2,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Nom',
         selector: (row: any) => row.indicador,
         grow: 12,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Sector',
         selector: (row: any) => row.sector,
         grow: 4,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Ordre',
         selector: (row: any) => row.ordre,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Objectiu',
         selector: (row: any) => row.objectiu,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Invers',
         selector: (row: any) => row.invers ? "X" : "",
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Accions',
         cell: (row: any) => (
            <div className='flex flex-row'>
               <FaPenToSquare onClick={editHandler(row, reset)} className='cursor-pointer m-1'>Edit</FaPenToSquare>
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
            <div className="flex mt-2 rounded-md">
               < ToastContainer />
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
                  <ProfessionalsForm
                     register={register}
                     handleSubmit={handleSubmit}
                     errors={errors}
                     clearErrors={clearErrors}
                     setRows={setRows}
                     toast={toast}
                     isDirty={isDirty}
                     dirtyFields={dirtyFields}
                     reset={reset}
                  />
               </div>
            </div >
            : null}
      </>
   )
};