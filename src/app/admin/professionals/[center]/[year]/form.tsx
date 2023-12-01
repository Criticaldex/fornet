'use client';

import { ProfessionalIface } from "@/schemas/professional";
import { getAdminTable, updateProfessionals } from "@/services/professionals";
import { useSession, getSession } from "next-auth/react"

export const ProfessionalsForm = ({ register, handleSubmit, errors, clearErrors, setRows, toast, isDirty, dirtyFields, reset }: any) => {
   const onSubmit = handleSubmit(async (data: ProfessionalIface) => {
      if (isDirty) {
         const centre = data.centre as string;
         if (Object.hasOwn(dirtyFields, 'ordre')) {
            delete data.centre;
         }
         const session = await getSession();
         data.dbName = session?.user.db as string;
         data.objectiu = data.objectiu ? parseFloat(data.objectiu) : 0;
         const update = await updateProfessionals(data);
         if (update.acknowledged) {
            toast.success(`Indicador Modificat a ${update.modifiedCount} centres!`, { theme: "colored" });
         } else {
            toast.error('Error modificant l\'indicador', { theme: "colored" });
         }
         data.centre = centre;
         reset(data);
         setRows(await getAdminTable(data.any, data.centre, data.dbName));
      } else {
         toast.warning('No s\'ha Modificat cap camp!', { theme: "colored" });
      }
   });

   return (
      <form
         id="userForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="identificador" className="flex self-center">Id:</label>
            <input id="identificador"
               type="text"
               disabled
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.identificador ? 'border-foreground' : 'border-red'}`}
               {...register("identificador", {
                  required: 'Camp obligatori',
               })} />
         </div>
         {errors.identificador && <p role="alert" className="text-red self-end">⚠ {errors.identificador?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="indicador" className="self-center">Nom:</label>
            <input id="indicador"
               type="indicador"
               disabled
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.indicador ? 'border-foreground' : 'border-red'}`}
               {...register("indicador")} />
         </div>
         {errors.indicador && <p role="alert" className="text-red self-end">⚠ {errors.indicador?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="sector" className="self-center">Sector:</label>
            <input id="sector"
               type="sector"
               disabled
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.sector ? 'border-foreground' : 'border-red'}`}
               {...register("sector")} />
         </div>
         {errors.sector && <p role="alert" className="text-red self-end">⚠ {errors.sector?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="any" className="self-center">Any:</label>
            <input id="any"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.any ? 'border-foreground' : 'border-red'}`}
               disabled
               {...register("any", {
                  required: 'Camp obligatori',
               })} />
         </div>
         {errors.any && <p role="alert" className="text-red self-end">⚠ {errors.any?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="ordre" className="self-center">Ordre:</label>
            <input id="ordre"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12`}
               {...register("ordre", {
                  pattern: {
                     value: /^[0-9\.]*$/i,
                     message: "Ha de ser un Numero"
                  }
               })} />
         </div>
         {errors.actiu && <p role="alert" className="text-red self-end">⚠ {errors.actiu?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="objectiu" className="self-center">Objectiu:</label>
            <input id="objectiu"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.objectiu ? 'border-foreground' : 'border-red'}`}
               {...register("objectiu", {
                  pattern: {
                     value: /^[0-9\.]*$/i,
                     message: "Ha de ser un Numero"
                  }
               })} />
         </div>
         {errors.objectiu && <p role="alert" className="text-red self-end">⚠ {errors.objectiu?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="invers" className="self-center">Invers:</label>
            <input id="invers"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12`}
               {...register("invers")} type="checkbox" value="true" />
         </div>
         {errors.invers && <p role="alert" className="text-red self-end">⚠ {errors.invers?.message}</p>}

         <div className="inline-flex justify-around">
            <input type="reset" onClick={() => { clearErrors(); }} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark'} value="Netejar" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-darkBlue'} type="submit" value="Enviar" />
         </div>
      </form >
   );
};