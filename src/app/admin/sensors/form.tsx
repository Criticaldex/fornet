'use client';

import { SensorIface } from "@/schemas/sensor";
import { getNames, getLines, getNodes } from '@/services/plcs';
import { getSensors, upsertSensor } from "@/services/sensors";
import { patchNodes } from "@/services/nodes";
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react";

export const LabelsForm = ({ register, handleSubmit, errors, clearErrors, setRows, toast, isDirty, dirtyFields, reset, resetField, session }: any) => {
   const [plcName, setPlcName] = useState('');
   const [plcNames, setPlcNames] = useState(['-']);


   useEffect(() => {
      getLines(session?.user.db, { name: plcName })
         .then((res: any) => {
            resetField("line", { defaultValue: res[0] })
         });
      getNodes(session?.user.db, { name: plcName })
         .then((res: any) => {
            resetField("node", { defaultValue: res[0] })
         });
   }, [plcName, resetField, session?.user.db])

   useEffect(() => {
      getNames(session?.user.db)
         .then((res: any) => {
            setPlcNames(res);
         });
   }, [session?.user.db])

   const onSubmit = handleSubmit(async (data: SensorIface) => {
      const session = await getSession();
      const upsert = await upsertSensor(data, session?.user.db);
      const sync = await patchNodes({ name: data.node, synced: false }, session?.user.db);

      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else {
         toast.success('Object Added!', { theme: "colored" });
      }
      if (sync.lastErrorObject?.updatedExisting) {
         toast.success('Syncing node ' + sync.value.name, { theme: "colored" });
      } else {
         toast.error('Error Syncing!', { theme: "colored" });
      }
      reset(data);
      setRows(await getSensors(session?.user.db));
   });

   return (
      <form
         id="labelForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="line" className="flex self-center">Line:</label>
            <input id="line"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.line ? 'border-foreground' : 'border-red'}`}
               disabled
               {...register("line")} />
         </div>
         {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="node" className="flex self-center">Node:</label>
            <input id="node"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.node ? 'border-foreground' : 'border-red'}`}
               disabled
               {...register("node")} />
         </div>
         {errors.node && <p role="alert" className="text-red self-end">⚠ {errors.node?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="plc_name" className="flex self-center">PLC Name:</label>
            <select id="plc_name"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.plc_name ? 'border-foreground' : 'border-red'}`}
               {...register("plc_name", { required: 'Field Required' })}
               onChange={e => {
                  setPlcName(e.target.value)
               }}>
               <option key='' value=''>Select...</option>
               {plcNames.map((name: any) => {
                  return <option key={name} value={`${name}`}>
                     {name}
                  </option>
               })}
            </select>
         </div>
         {errors.plc_name && <p role="alert" className="text-red self-end">⚠ {errors.plc_name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="name" className="self-center">Name:</label>
            <input id="name" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`}
               {...register("name", { required: 'Field Required' })} />
         </div>
         {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="unit" className="self-center">Unit:</label>
            <input id="unit" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("unit")} />
         </div>
         {errors.unit && <p role="alert" className="text-red self-end">⚠ {errors.unit?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="address" className="self-center">Address:</label>
            <input id="address" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.address ? 'border-foreground' : 'border-red'}`}
               {...register("address", { required: 'Field Required' })} />
         </div>
         {errors.address && <p role="alert" className="text-red self-end">⚠ {errors.address?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="active" className="self-center">Active:</label>
            <input id="active"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12`}
               {...register("active")} type="checkbox" value={true} />
         </div>
         {errors.active && <p role="alert" className="text-red self-end">⚠ {errors.active?.message}</p>}

         <div className="inline-flex justify-around">
            <input type="reset" onClick={() => { clearErrors() }} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
         </div>
      </form >
   );
};
