'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { UsersForm } from "./form";
import { UserIface } from "@/schemas/user";
import { useForm, UseFormReset } from "react-hook-form";
import { deleteUser, getUsers, getUsersbyDB } from '@/services/users';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";

export function AdminTable({ users, session }: any) {

   const [rows, setRows] = useState(users);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true)
   }, [])

   const filteredItems = rows.filter(
      (item: any) => item.email && item.email.toLowerCase().includes(filterText.toLowerCase()),
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
                     setRows(await getUsers());
                  }}
               >
                  Refresh
               </button>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
               <div className="text-sm text-textColor">
                  Showing {filteredItems.length} of {rows?.length || 0} users
               </div>
            </div>
         </div>
      );
   }, [filterText, filteredItems.length, rows?.length]);

   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<UserIface>();

   const editHandler = (row: UserIface, reset: UseFormReset<UserIface>) => (event: any) => {
      reset(row)
   }

   const deleteHandler = (row: any) => (event: any) => {
      confirmAlert({
         message: 'Do you want to delete the user: \n' + row.email + ' ?',
         buttons: [
            {
               label: 'Delete',
               onClick: async () => {
                  const del = await deleteUser(row.email);
                  if (del) {
                     toast.error('User Deleted!!', { theme: "colored" });
                     if (session?.user.role == '1') {
                        setRows(await getUsersbyDB(session?.user.db));
                     } else if (session?.user.role == '0') {
                        setRows(await getUsers());
                     }
                  }
               }
            },
            {
               label: 'Better not touch anything :S',
            }
         ]
      });
   }

   let columns: any = [
      {
         name: 'Email',
         selector: (row: any) => row.email,
         sortable: true,
         grow: 2,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Name',
         selector: (row: any) => row.name,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Last Name',
         selector: (row: any) => row.lastname,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'database',
         selector: (row: any) => row.db,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'role',
         selector: (row: any) => row.role,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'License',
         selector: (row: any) => Intl.DateTimeFormat("es-ES").format(new Date(row.license?.start)) + ' - ' + Intl.DateTimeFormat("es-ES").format(new Date(row.license?.end)),
         sortable: true,
         grow: 2,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Alerts',
         selector: (row: any) => row.alert ? "X" : "",
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
                  <UsersForm
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

