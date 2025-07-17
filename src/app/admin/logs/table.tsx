'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { LogIface } from "@/schemas/log";
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { deleteValues, getTableValues } from '@/services/logs';

export function LogTable({ logs, session }: any) {

   const [rows, setRows] = useState(logs);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);

   useEffect(() => {
      setIsClient(true)
   }, [])

   const filteredItems = rows?.filter(
      (item: any) => (item.user && item.user.toLowerCase().includes(filterText.toLowerCase())) ||
         (item.resource && item.resource.toLowerCase().includes(filterText.toLowerCase())) ||
         (item.message && item.message.toLowerCase().includes(filterText.toLowerCase()))
   ) || [];

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex justify-end grow">
            <input
               id="search"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4`}
               placeholder="Search user, resource, or message"
               aria-label="Search Input"
               value={filterText}
               onChange={(e: any) => setFilterText(e.target.value)}
            />
         </div>
      );
   }, [filterText]);

   let columns: any = [
      {
         name: 'User',
         selector: (row: any) => row.user,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Resource',
         selector: (row: any) => row.resource,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Timestamp',
         selector: (row: any) => new Date(row.timestamp).toLocaleString(),
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Old Value',
         selector: (row: any) => row.oldValue || '-',
         sortable: false,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'New Value',
         selector: (row: any) => row.newValue || '-',
         sortable: false,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Message',
         selector: (row: any) => row.message || '-',
         sortable: false,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
         wrap: true,
      },
   ];

   createThemes();

   if (!isClient) {
      return <Loading />
   }

   return (
      <div className="flex flex-col rounded-md">
         <div className="flex flex-col grow">
            <DataTable
               title="System Logs"
               columns={columns}
               data={filteredItems}
               pagination
               paginationPerPage={20}
               paginationRowsPerPageOptions={[10, 20, 50, 100]}
               subHeader
               subHeaderComponent={subHeaderComponentMemo}
               persistTableHead
               theme={'custom'}
               defaultSortFieldId={3}
               defaultSortAsc={false}
            />
         </div>
      </div>
   );
};

