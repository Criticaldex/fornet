'use client';

import { PlcIface } from "@/schemas/plc";
import { getPlcs, upsertPlc } from "@/services/plcs";
import { patchNodes } from "@/services/nodes";
import { getSession } from "next-auth/react"
import { updateSensors } from "@/services/sensors";
import { useLogs } from "@/hooks/useLogs";
import { sendMqtt } from "@/services/mqtts";

export const PlcForm = ({ register, handleSubmit, errors, setRows, toast, reset, clearErrors, session, nodes }: any) => {
   const { logCreate, logUpdate, logError, logAction } = useLogs();

   const onSubmit = handleSubmit(async (data: PlcIface) => {
      const session = await getSession();

      try {
         // Get existing PLC data for comparison in case of update
         const existingPlcs = await getPlcs(session?.user.db);
         const existingPlc = existingPlcs.find((plc: PlcIface) => plc.name === data.name);

         const upsert = await upsertPlc(data, session?.user.db);
         const sync = await patchNodes({ name: data.node, synced: false }, session?.user.db);
         if (data.node && session?.user?.db) {
            sendMqtt(session.user.db + data.node, 'true');
         }

         if (upsert.lastErrorObject?.updatedExisting) {
            // Log PLC update
            await logUpdate('PLC', existingPlc, data);

            toast.success('Object Modified!', { theme: "colored" });
            const updateSens = await updateSensors({
               line: upsert.value.line,
               node: upsert.value.node,
               plc_name: upsert.value.name
            }, session?.user.db);

            if (updateSens.modifiedCount) {
               // Log sensor updates
               await logAction('SENSORS', 'BULK_UPDATE', {
                  message: `Updated ${updateSens.modifiedCount} sensors for PLC ${data.name}`,
                  newValue: { count: updateSens.modifiedCount, plc: data.name },
                  severity: 'INFO'
               });
               toast.success(updateSens.modifiedCount + ' Sensors modified!', { theme: "colored" });
            }
         } else {
            // Log PLC creation
            await logCreate('PLC', data);
            toast.success('Object Added!', { theme: "colored" });
         }

         if (sync.lastErrorObject?.updatedExisting) {
            // Log node sync action
            await logAction('NODE', 'SYNC_REQUEST', {
               message: `Requested sync for node ${sync.value.name}`,
               newValue: { node: sync.value.name, synced: false },
               severity: 'INFO'
            });
            toast.success('Syncing node ' + sync.value.name, { theme: "colored" });
         } else {
            // Log sync error
            await logError('NODE', `Failed to sync node ${data.node}`);
            toast.error('Error Syncing!', { theme: "colored" });
         }

         reset(data);
         setRows(await getPlcs(session?.user.db));

      } catch (error) {
         // Log any errors during the process
         await logError('PLC', `Failed to save PLC: ${error}`);
         toast.error('Error saving PLC!', { theme: "colored" });
      }
   });

   return (
      <form
         id="vartableForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="line" className="flex self-center">Line:</label>
            <input id="line" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.line ? 'border-foreground' : 'border-red'}`}
               {...register("line", { required: 'Field Required' })} />
         </div>
         {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="node" className="flex self-center">Node:</label>
            <select id="node"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.node ? 'border-foreground' : 'border-red'}`}
               {...register("node", { required: 'Field Required' })}>
               <option key='' value=''>Select...</option>
               {nodes.map((name: any) => {
                  return <option key={name} value={`${name}`}>
                     {name}
                  </option>
               })}
            </select>
         </div>
         {errors.node && <p role="alert" className="text-red self-end">⚠ {errors.node?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="name" className="flex self-center">Name:</label>
            <input id="name" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`}
               {...register("name", { required: 'Field Required' })} />
         </div>
         {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="ip" className="flex self-center">IP:</label>
            <input id="ip" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.ip ? 'border-foreground' : 'border-red'}`}
               {...register("ip", { required: 'Field Required' })} />
         </div>
         {errors.ip && <p role="alert" className="text-red self-end">⚠ {errors.ip?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="type" className="self-center">Type:</label>
            <select id="type"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.type ? 'border-foreground' : 'border-red'}`}
               {...register("type", { required: 'Field Required' })}>
               <option key='' value=''>Select...</option>
               <option key='siemens' value='siemens'>Siemens</option>
               <option key='modbus' value='modbus'>Modbus</option>
               <option key='omron' value='omron'>Omron</option>
            </select>
         </div>
         {errors.type && <p role="alert" className="text-red self-end">⚠ {errors.type?.message}</p>}

         <div className="inline-flex justify-around">
            <button type="button" onClick={() => {
               clearErrors();
               reset({
                  ip: '',
                  name: '',
                  type: ''
               });
            }} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-opacity-80'}>Clear</button>
            <button className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent hover:bg-accent-hover'} type="submit">Send</button>
         </div>
      </form >
   );
};