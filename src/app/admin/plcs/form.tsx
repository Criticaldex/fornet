'use client';

import { PlcIface } from "@/schemas/plc";
import { getPlcs, upsertPlc } from "@/services/plcs";
import { getSession } from "next-auth/react"

export const PlcForm = ({ register, handleSubmit, errors, setRows, toast, reset }: any) => {

   const onSubmit = handleSubmit(async (data: PlcIface) => {
      const session = await getSession();
      const upsert = await upsertPlc(data, session?.user.db);
      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else {
         toast.success('Object Added!', { theme: "colored" });
      }
      reset(data);

      setRows(await getPlcs(session?.user.db));
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
            <input id="type" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.type ? 'border-foreground' : 'border-red'}`}
               {...register("type", { required: 'Field Required' })} />
         </div>
         {errors.type && <p role="alert" className="text-red self-end">⚠ {errors.type?.message}</p>}

         <div className="inline-flex justify-around">
            <input type="reset" onClick={reset} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
         </div>
      </form >
   );
};