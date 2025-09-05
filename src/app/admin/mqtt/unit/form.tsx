'use client';

import { MqttIface } from "@/schemas/mqtt";
import { getFilteredMqtts, upsertMqtt } from "@/services/mqtts";
import { patchNodes } from "@/services/nodes";
import { getSession } from "next-auth/react"

export const MqttForm = ({ register, handleSubmit, errors, setRows, toast, reset, clearErrors, setPlcName, plcNames, sensorNames, sensors }: any) => {

   const onSubmit = handleSubmit(async (data: MqttIface) => {
      const session = await getSession();
      const upsert = await upsertMqtt(data, session?.user.db);

      //const sync = await patchNodes({ name: data.node, synced: false }, session?.user.db);
      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else if (!upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Added!', { theme: "colored" });
      } else toast.error(upsert, { theme: "colored" });
      reset(data);

      setRows(await getFilteredMqtts(session?.user.db, { name: 'null' }));
   });

   return (
      <div className="flex flex-col">
         <form
            id="tableForm"
            className="flex flex-col gap-4 grow rounded-md p-4 mb-2 bg-bgLight"
            onSubmit={onSubmit}
         >

            <div className="inline-flex justify-end">
               <label htmlFor="line" className="flex self-center">Line:</label>
               <input id="line" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.line ? 'border-foreground' : 'border-red'}`}
                  {...register("line", { required: 'Field Required' })}
                  disabled />
            </div>
            {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

            <div className="inline-flex justify-end">
               <label htmlFor="plc" className="flex self-center">PLC:</label>
               <select id="plc"
                  className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-9/12 ${!errors.plc ? 'border-foreground' : 'border-red'}`}
                  {...register("plc", {
                     required: 'Field Required',
                     onChange: (e: any) => {
                        setPlcName(e.target.value)
                     }
                  })}>
                  <option key='' value=''>Select...</option>
                  {plcNames.map((name: any) => {
                     return <option key={name} value={`${name}`}>
                        {name}
                     </option>
                  })}
               </select>
            </div>
            {errors.plc && <p role="alert" className="text-red self-end">⚠ {errors.plc?.message}</p>}

            <div className="inline-flex justify-end">
               <label htmlFor="sensor" className="flex self-center">Sensor:</label>
               <select id="sensor"
                  className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-9/12 ${!errors.sensor ? 'border-foreground' : 'border-red'}`}
                  {...register("sensor", {
                     required: 'Field Required',
                     onChange: (e: any) => {
                        const selectedSensor = sensors.find((s: any) => s.name === e.target.value);
                        if (selectedSensor) {
                           // Set the sensorId in the form
                           reset((current: any) => ({
                              ...current,
                              sensor: selectedSensor.name,
                              sensorId: selectedSensor._id
                           }));
                        }
                     }
                  })}>
                  <option key='' value=''>Select...</option>
                  {sensorNames.map((name: any) => {
                     return <option key={name} value={`${name}`}>
                        {name}
                     </option>
                  })}
               </select>
            </div>
            {errors.sensor && <p role="alert" className="text-red self-end">⚠ {errors.sensor?.message}</p>}

            {/* Hidden field for sensorId */}
            <input type="hidden" {...register("sensorId")} />

            <div className="inline-flex justify-end">
               <label htmlFor="value" className="flex self-center">Value:</label>
               <input id="value" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.value ? 'border-foreground' : 'border-red'}`}
                  {...register("value", { required: 'Field Required' })} />
            </div>
            {errors.value && <p role="alert" className="text-red self-end">⚠ {errors.value?.message}</p>}

            <div className="inline-flex justify-around">
               <input type="reset" onClick={() => { clearErrors() }} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
               <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
            </div>
         </form >
      </div>
   );
};