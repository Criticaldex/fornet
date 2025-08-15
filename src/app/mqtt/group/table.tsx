'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { MqttForm } from "./form";
import { MqttIface } from "@/schemas/mqtt";
import { useForm, UseFormReset } from "react-hook-form";
import { deleteMqtt, getMqttConfigs } from '@/services/mqtts';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { getLines, getNames } from '@/services/plcs';
import { getNames as getNamesSensors } from '@/services/sensors';


export function MqttTable({ mqtts, session }: any) {

   const [rows, setRows] = useState(mqtts);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);
   const [formLoaded, setformLoaded] = useState(false);
   const [plcName, setPlcName] = useState('');
   const [plcNames, setPlcNames] = useState(['-']);
   const [sensorNames, setSensorNames] = useState(['-']);

   useEffect(() => {
      getNames(session?.user.db)
         .then((res: any) => {
            setPlcNames(res);
         });
   }, [session?.user.db])

   useEffect(() => {
      setIsClient(true)
   }, [])

   const ExpandedComponent = ({ data }: any) => {
      if (data.subtable) {
         let columns: any = [
            {
               name: 'Name',
               selector: (row: any) => row.name,
               sortable: true,
               style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
            },
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
            <div className="flex rounded-md p-4 pl-12 bg-bgDark">
               <DataTable
                  className='border-2 border-accent'
                  columns={columns}
                  data={data.subtable}
                  theme={'custom'}
               />
            </div>
         )
      }
      return <Loading />
   }

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
      resetField,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<MqttIface>();

   useEffect(() => {
      setformLoaded(false);
      getLines(session?.user.db, { name: plcName })
         .then((res: any) => {
            resetField("line", { defaultValue: res[0] })
         });
      getNamesSensors(plcName, session?.user.db)
         .then((res: any) => {
            setSensorNames(res);
            setformLoaded(true);
         });
   }, [plcName, session?.user.db, resetField])

   const editHandler = (row: MqttIface, reset: UseFormReset<MqttIface>) => (event: any) => {
      setPlcName(row.plc);
      reset(row)
   }

   const deleteHandler = (row: any) => (event: any) => {
      let filter = row;
      let message = '⚠️ Deleting mqtt for ' + row.sensor + ' from ' + row.plc + ' plc ⚠️ Are you sure?'
      if (row.subtable) {
         filter = { line: row.line, name: row.name }
         message = '⚠️ Deleting ' + row.name + ' in ' + row.line + ' line ⚠️ Are you sure?'
      }
      confirmAlert({
         message: message,
         buttons: [
            {
               label: 'Yes',
               onClick: async () => {
                  const mqtt = await deleteMqtt(filter, session?.user.db);
                  if (mqtt) {
                     toast.error('Value Deleted!!', { theme: "colored" });
                     setRows(await getMqttConfigs(session?.user.db, { name: { '$not': { $eq: 'null' } } }));
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
         name: 'Name',
         selector: (row: any) => row.name,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Line',
         selector: (row: any) => row.line,
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
                     expandableRows
                     expandOnRowClicked
                     expandableRowsComponent={ExpandedComponent}
                  />
               </div>
               <div className="flex basis-1/4 rounded-md bg-light">
                  {formLoaded ?
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
                     />
                     : <Loading />}
               </div>
            </div>
            : <Loading />}
      </>
   )
};

