'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { MqttForm } from "./form";
import { MqttIface } from "@/schemas/mqtt";
import { useForm, UseFormReset } from "react-hook-form";
import { deleteMqtt, getFilteredMqtts, getMqttConfigs, sendMqtt } from '@/services/mqtts';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare, FaShareFromSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { getLines, getNames } from '@/services/plcs';
import { getNames as getNamesSensors, getSensorsWithIds } from '@/services/sensors';
import Link from "next/link";
import { usePathname } from 'next/navigation';

export function MqttTable({ mqtts, nodes, session }: any) {

   const [rows, setRows] = useState(mqtts);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);
   const [formLoaded, setformLoaded] = useState(false);
   const [plcName, setPlcName] = useState('');
   const [plcNames, setPlcNames] = useState(['-']);
   const [sensorNames, setSensorNames] = useState(['-']);
   const [sensors, setSensors] = useState<{ _id: string, name: string }[]>([]);
   const pathname = usePathname();

   useEffect(() => {
      getNames(session?.user.db)
         .then((res: any) => {
            setPlcNames(res);
         });
   }, [session?.user.db])

   useEffect(() => {
      setIsClient(true)
   }, [])


   const filteredItems = rows.filter(
      (item: any) => {
         const searchText = filterText.toLowerCase();
         return (
            (item.line && item.line.toLowerCase().includes(searchText)) ||
            (item.plc && item.plc.toLowerCase().includes(searchText)) ||
            (item.sensor && item.sensor.toLowerCase().includes(searchText)) ||
            (item.value && item.value.toLowerCase().includes(searchText))
         );
      }
   );

   const subHeaderComponentMemo = useMemo(() => {
      return (
         <div className="flex flex-col gap-2 p-2 w-full">
            <div className="flex flex-wrap gap-2 items-center justify-between">
               {/* Search Input */}
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

               {/* Navigation Links */}
               <div className="flex items-center gap-2">
                  <Link
                     className={`py-2 px-4 rounded-md text-textColor font-bold border border-accent
                        ${pathname?.includes('/admin/mqtt/group') ? 'bg-accent text-textColor' : 'bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40'}`}
                     href="/admin/mqtt/group"
                  >
                     Group
                  </Link>
                  <Link
                     className={`py-2 px-4 rounded-md text-textColor font-bold border border-accent
                        ${pathname?.includes('/admin/mqtt/unit') ? 'bg-accent text-textColor' : 'bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40'}`}
                     href="/admin/mqtt/unit"
                  >
                     Unit
                  </Link>
               </div>

               {/* Refresh Button */}
               <button
                  className={`bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40 my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-accent`}
                  onClick={async () => {
                     setRows(await getFilteredMqtts(session?.user.db, { name: 'null' }));
                  }}
               >
                  Refresh
               </button>
            </div>

            {/* Results Count */}
            <div className="flex justify-between items-center">
               <div className="text-sm text-textColor">
                  Showing {filteredItems.length} of {rows?.length || 0} MQTT configs
               </div>
            </div>
         </div>
      );
   }, [filterText, filteredItems.length, rows?.length, pathname, session?.user.db]);

   const {
      register,
      handleSubmit,
      reset,
      resetField,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<MqttIface>({
      defaultValues: {
         name: '',
         line: '',
         ip: '',
         plc: '',
         sensor: '',
         sensorId: '',
         value: ''
      }
   });

   useEffect(() => {
      if (plcName && plcName !== '') {
         setformLoaded(false);
         getLines(session?.user.db, { name: plcName })
            .then((res: any) => {
               // Only reset line field if it's currently empty or if we're not in an edit scenario
               resetField("line", { defaultValue: res[0] })
            });

         // Get sensor names for backward compatibility
         getNamesSensors(plcName, session?.user.db)
            .then((res: any) => {
               setSensorNames(res);
            });

         // Get sensors with IDs for the new functionality
         getSensorsWithIds(plcName, session?.user.db)
            .then((res: any) => {
               setSensors(res);
               setformLoaded(true);
            });
      }
   }, [plcName, session?.user.db, resetField])

   const mqttHandler = (row: MqttIface, reset: UseFormReset<MqttIface>) => (event: any) => {
      if (row.sensorId && row.value) {
         sendMqtt(row.sensorId, row.value);
      }
   }

   const editHandler = (row: MqttIface, reset: UseFormReset<MqttIface>) => (event: any) => {
      setPlcName(row.plc);
      reset(row)
   }

   const deleteHandler = (row: any) => (event: any) => {
      confirmAlert({
         message: '⚠️ Deleting mqtt for ' + row.sensor + ' from ' + row.plc + ' plc ⚠️ Are you sure?',
         buttons: [
            {
               label: 'Yes',
               onClick: async () => {
                  const mqtt = await deleteMqtt(row, session?.user.db);
                  if (mqtt) {
                     toast.error('Value Deleted!!', { theme: "colored" });
                     setRows(await getFilteredMqtts(session?.user.db, { name: 'null' }));
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
         name: 'Plc',
         selector: (row: any) => row.plc,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Sensor',
         selector: (row: any) => row.sensor,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Value',
         selector: (row: any) => row.value,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Accions',
         cell: (row: any) => (
            <div className='flex flex-row'>
               <FaShareFromSquare onClick={mqttHandler(row, reset)} className='cursor-pointer m-1'>Send</FaShareFromSquare>
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
                  {(formLoaded || plcName === '') ?
                     <MqttForm
                        register={register}
                        handleSubmit={handleSubmit}
                        errors={errors}
                        setRows={setRows}
                        toast={toast}
                        reset={reset}
                        clearErrors={clearErrors}
                        resetField={resetField}
                        setPlcName={setPlcName}
                        plcNames={plcNames}
                        sensorNames={sensorNames}
                        sensors={sensors}
                     />
                     : <Loading />}
               </div>
            </div>
            : <Loading />}
      </>
   )
};

