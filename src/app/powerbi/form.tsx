'use client';

import { PlcIface } from "@/schemas/plc";
import { getPlcs, upsertPlc } from "@/services/plcs";
import { patchNodes } from "@/services/nodes";
import { getSession } from "next-auth/react"
import { updateSensors } from "@/services/sensors";
import { useForm } from "react-hook-form";

export const PbiForm = ({ setEntraToken, setEmbedURL }: any) => {

   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<any>();

   const onSubmit = handleSubmit(async (data: any) => {
      setEntraToken(data.entraToken);
      setEmbedURL(data.embedURL);
   });

   return (
      <form
         id="vartableForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="entraToken" className="flex self-center">entraToken:</label>
            <input id="entraToken" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.entraToken ? 'border-foreground' : 'border-red'}`}
               {...register("entraToken", { required: 'Field Required' })} />
         </div>
         {/* {errors.entraToken && <p role="alert" className="text-red self-end">⚠ {errors.entraToken?.message}</p>} */}

         <div className="inline-flex justify-end">
            <label htmlFor="embedURL" className="flex self-center">embedURL:</label>
            <input id="embedURL" type="text" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.embedURL ? 'border-foreground' : 'border-red'}`}
               {...register("embedURL", { required: 'Field Required' })} />
         </div>
         {/* {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.embedURL?.message}</p>} */}

         <div className="inline-flex justify-around">
            <input type="reset" onClick={() => { clearErrors() }} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
         </div>
      </form >
   );
};