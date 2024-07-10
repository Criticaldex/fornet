'use client';

import { LabelIface } from "@/schemas/label";
import { getNames, getLines } from '@/services/values';
import { getLabels, upsertLabel } from "@/services/labels";
import { getSession } from "next-auth/react"
import { useEffect, useState } from "react";

export const LabelsForm = ({ register, handleSubmit, errors, clearErrors, setRows, toast, isDirty, dirtyFields, reset, session }: any) => {
   const [lines, setLines] = useState(['-']);
   const [linia, setLinia] = useState('');
   const [names, setNames] = useState(['-']);


   useEffect(() => {
      getLines(session?.user.db)
         .then((res: any) => {
            setLines(res);
            setLinia(res[0]);
         });
   }, [session?.user.db])

   useEffect(() => {
      getNames({ 'line': linia }, session?.user.db)
         .then((res: any) => {
            setNames(res.names);
         });
   }, [linia, session?.user.db])

   const onSubmit = handleSubmit(async (data: LabelIface) => {
      const session = await getSession();
      const upsertData = {
         _id: data._id,
         line: data.line,
         name: data.name,
         unit: data.unit
      }
      const upsert = await upsertLabel(upsertData, session?.user.db);
      if (upsert.lastErrorObject?.updatedExisting) {
         toast.success('Object Modified!', { theme: "colored" });
      } else {
         toast.success('Object Added!', { theme: "colored" });
      }
      reset(data);

      setRows(await getLabels(session?.user.db));
   });

   return (
      <form
         id="labelForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={onSubmit}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="id" className="flex self-center">ID:</label>
            <input id="id" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.id ? 'border-foreground' : 'border-red'}`}
               disabled
               {...register("_id")} />
         </div>

         <div className="inline-flex justify-end">
            <label htmlFor="line" className="flex self-center">Line:</label>
            <select id="line"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.line ? 'border-foreground' : 'border-red'}`}
               {...register("line", { required: 'Field Required' })}
               onChange={e => {
                  setLinia(e.target.value)
               }}>
               <option key='' value=''>Select...</option>
               {lines.map((line: any) => {
                  return <option key={line} value={`${line}`}>
                     {line}
                  </option>
               })}
            </select>
         </div>
         {errors.line && <p role="alert" className="text-red self-end">⚠ {errors.line?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="name" className="flex self-center">Name:</label>
            <select id="name"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.name ? 'border-foreground' : 'border-red'}`}
               {...register("name", { required: 'Field Required' })}>
               <option key='' value=''>Select...</option>
               {names.map((name: any) => {
                  return <option key={name} value={`${name}`}>
                     {name}
                  </option>
               })}
            </select>
         </div>
         {errors.name && <p role="alert" className="text-red self-end">⚠ {errors.name?.message}</p>}

         <div className="inline-flex justify-end">
            <label htmlFor="unit" className="self-center">Unit:</label>
            <input id="unit" type="unit" className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.unit ? 'border-foreground' : 'border-red'}`}
               {...register("unit", { required: 'Field Required' })} />
         </div>
         {errors.unit && <p role="alert" className="text-red self-end">⚠ {errors.unit?.message}</p>}
         <div className="inline-flex justify-around">
            <input type="reset" onClick={reset} className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark'} value="Clean" />
            <input className={'my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent'} type="submit" value="Send" />
         </div>
      </form >
   );
};