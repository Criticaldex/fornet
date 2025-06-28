'use client'
import { useEffect, useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';
import { createThemes } from "@/styles/themes"
import { LabelsForm } from "./form";
import { SensorIface } from "@/schemas/sensor";
import { useForm, UseFormReset } from "react-hook-form";
import { deleteSensor, getSensors } from '@/services/sensors';
import { confirmAlert } from 'react-confirm-alert';
import { FaTrashCan, FaPenToSquare } from "react-icons/fa6";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Loading } from "@/components/loading.component";
import { deleteValues } from '@/services/values';
import { getLines, getNames, getNodes, getTypes } from '@/services/plcs';

export function AdminTable({ sensors, session }: any) {

   const [rows, setRows] = useState(sensors);
   const [filterText, setFilterText] = useState('');
   const [isClient, setIsClient] = useState(false);
   const [plcName, setPlcName] = useState('');
   const [plcNames, setPlcNames] = useState(['-']);
   const [plcType, setPlcType] = useState('');
   const [modbusDataType, setModbusDataType] = useState(['Coil', 'Input', 'HoldingRegister', 'InputRegister']);
   const modbusRead = ['Coil', 'Input', 'HoldingRegister', 'InputRegister'];
   const modbusWrite = ['Coil', 'HoldingRegister', 'MCoils', 'MHoldingRegisters'];


   useEffect(() => {
      getTypes(session?.user.db, { name: plcName })
         .then((res: any) => {
            setPlcType(res[0])
         });
      getLines(session?.user.db, { name: plcName })
         .then((res: any) => {
            resetField("line", { defaultValue: res[0] })
         });
      getNodes(session?.user.db, { name: plcName })
         .then((res: any) => {
            resetField("node", { defaultValue: res[0] })
         });
   }, [plcName, session?.user.db])

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
   } = useForm<SensorIface>();

   const editHandler = (row: SensorIface, reset: UseFormReset<SensorIface>) => (event: any) => {
      switch (plcType) {
         case 'modbus':
            if (row.read) {
               setModbusDataType(modbusRead)
            } else if (row.write) {
               setModbusDataType(modbusWrite);
            }
            break;

         default:
            break;
      }
      setPlcName(row.plc_name);
      reset(row);
   }

   const deleteHandler = (row: any) => (event: any) => {
      confirmAlert({
         message: '⚠️ Deleting ' + row.name + ' in ' + row.line + ' line and ALL It\'s Values ⚠️ Are you sure?',
         buttons: [
            {
               label: 'Yes',
               onClick: async () => {
                  const dSensor = await deleteSensor({ line: row.line, name: row.name, plc_name: row.plc_name }, session?.user.db);
                  const dValue = await deleteValues({ line: row.line, name: row.name, plc_name: row.plc_name }, session?.user.db);
                  if (dSensor) {
                     toast.error('Sensor Deleted!!', { theme: "colored" });
                     setRows(await getSensors(session?.user.db));
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
         name: 'Read',
         selector: (row: any) => row.read ? "X" : "",
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Write',
         selector: (row: any) => row.write ? "X" : "",
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Modbus DataType',
         selector: (row: any) => row.dataType,
         sortable: true,
         style: { fontSize: 'var(--table-font)', backgroundColor: '', color: '' },
      },
      {
         name: 'Incremental',
         selector: (row: any) => row.autoinc ? "X" : "",
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
                     reset={reset}
                     resetField={resetField}
                     setPlcName={setPlcName}
                     plcNames={plcNames}
                     plcType={plcType}
                     setModbusDataType={setModbusDataType}
                     modbusDataType={modbusDataType}
                     modbusRead={modbusRead}
                     modbusWrite={modbusWrite}
                  />
               </div>
            </div>
            : <Loading />}
      </>
   )
};

