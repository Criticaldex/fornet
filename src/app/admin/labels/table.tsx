'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { LabelsForm } from "./form";
import { LabelIface } from "@/schemas/label";
import { useForm, UseFormReset } from "react-hook-form";
import { deleteLabel, getLabels } from '@/services/labels';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { deleteValues } from '@/services/values';

export function AdminTable({ labels, session }: any) {

   const [rows, setRows] = useState(labels);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true)
   }, [])

   const filteredItems = rows.filter(
      (item: any) => item._id && item._id.toLowerCase().includes(filterText.toLowerCase()),
   );

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex justify-end grow m-2">
            <input
               id="search"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4`}
               placeholder="ID"
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
   } = useForm<LabelIface>();

   const editHandler = (row: LabelIface, reset: UseFormReset<LabelIface>) => (event: any) => {
      reset(row)
   }

   const deleteHandler = (row: any) => (event: any) => {
      confirmAlert({
         message: 'Deleting ' + row.name + ' in ' + row.line + ' line\nAre you sure?',
         buttons: [
            {
               label: 'Eliminar',
               onClick: async () => {
                  const dLabel = await deleteLabel(row._id, session?.user.db);
                  const dValue = await deleteValues(row.line, row.name, session?.user.db);
                  if (dLabel) {
                     toast.error('Label Deleted!!', { theme: "colored" });
                     setRows(await getLabels(session?.user.db));
                  }
                  if (dValue.acknowledged) {
                     toast.error(dValue.deletedCount + ' values Deleted!!', { theme: "colored" });
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
         name: 'ID',
         selector: (row: any) => row._id,
         sortable: true,
         grow: 2,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Line',
         selector: (row: any) => row.line,
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
                  <LabelsForm
                     register={register}
                     handleSubmit={handleSubmit}
                     errors={errors}
                     clearErrors={clearErrors}
                     setRows={setRows}
                     toast={toast}
                     isDirty={isDirty}
                     dirtyFields={dirtyFields}
                     reset={reset}
                     session={session}
                  />
               </div>
            </div>
            : <Loading />}
      </>
   )
};

