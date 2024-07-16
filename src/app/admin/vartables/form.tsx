'use client';

import { VartableIface } from "@/schemas/vartable";
import { getVartables, upsertVartable } from "@/services/vartables";
import { getSession } from "next-auth/react"

export const VartablesForm = ({ register, handleSubmit, errors, setRows, toast, reset }: any) => {

   const onSubmit = handleSubmit(async (data: VartableIface) => {
      const session = await getSession();
      const upsert = await upsertVartable(data, session?.user.db);
      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else {
         toast.success('Object Added!', { theme: "colored" });
      }
      reset(data);

      setRows(await getVartables(session?.user.db));
   });

   return (
      <form
         id="vartableForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="line" className="flex self-center">Line:</label>
            <input id="line" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("line", { required: 'Field Required' })} />
         </div>
         {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="name" className="flex self-center">Name:</label>
            <input id="name" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("name", { required: 'Field Required' })} />
         </div>
         {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="plc_name" className="flex self-center">PLC Name:</label>
            <input id="plc_name" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("plc_name", { required: 'Field Required' })} />
         </div>
         {errors.plc_name && <p role="alert" className="text-red self-end">⚠ {errors.plc_name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="unit" className="self-center">Unit:</label>
            <input id="unit" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("unit")} />
         </div>
         {errors.unit && <p role="alert" className="text-red self-end">⚠ {errors.unit?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="address" className="self-center">Address:</label>
            <input id="address" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("address")} />
         </div>
         {errors.unit && <p role="alert" className="text-red self-end">⚠ {errors.unit?.message}</p>}

         <div className="inline-flex justify-around">
            <input type="reset" onClick={reset} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
         </div>
      </form >
   );
};