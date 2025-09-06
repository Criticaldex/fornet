'use client';

import { PowerBIIface } from "@/schemas/powerbi";
import { upsertPowerBIConfig } from "@/services/powerbi";
import { getSession } from "next-auth/react"
import { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { useLogs } from "@/hooks/useLogs";

export const PowerBIForm = ({ powerBIConfig, toast }: any) => {
   const { logCreate, logUpdate, logError, logAction } = useLogs();
   const {
      register,
      handleSubmit,
      reset,
      clearErrors,
      formState: { errors, isDirty, dirtyFields }
   } = useForm<PowerBIIface>();

   useEffect(() => {
      if (powerBIConfig) {
         reset(powerBIConfig);
      }
   }, [reset, powerBIConfig])

   const onSubmit: SubmitHandler<PowerBIIface> = async (data) => {
      const session = await getSession();
      if (isDirty) {
         try {
            console.log('before submit');

            // Check if this is an update or create by seeing if powerBIConfig exists
            const isUpdate = powerBIConfig && Object.keys(powerBIConfig).length > 0;

            const result = await upsertPowerBIConfig(data, session);
            console.log('result: ', result);

            if (isUpdate) {
               // Log PowerBI update (non-blocking)
               logUpdate('PowerBI', powerBIConfig, data);
               toast.success('PowerBI configuration updated successfully!', { theme: "colored" });
            } else {
               // Log PowerBI creation (non-blocking)
               logCreate('PowerBI', data);
               toast.success('PowerBI configuration created successfully!', { theme: "colored" });
            }

            // Log which fields were changed (non-blocking)
            if (dirtyFields && Object.keys(dirtyFields).length > 0) {
               logAction('PowerBI', 'FIELD_UPDATE', {
                  message: `Updated PowerBI fields: ${Object.keys(dirtyFields).join(', ')}`,
                  newValue: { modifiedFields: Object.keys(dirtyFields) },
                  severity: 'INFO'
               });
            }

            reset(data);
         } catch (error) {
            console.error('Error saving PowerBI configuration:', error);

            // Log error (non-blocking)
            logError('PowerBI', `Failed to save PowerBI configuration: ${error}`);

            toast.error('Failed to save PowerBI configuration.', { theme: "colored" });
         }
      } else {
         toast.warning('No fields have been modified!', { theme: "colored" });
      }
   };

   return (
      <form
         id="powerBIForm"
         className="flex flex-col gap-4 grow rounded-md p-4 bg-bgLight"
         onSubmit={handleSubmit(onSubmit)}
      >
         <div className="inline-flex justify-end">
            <label htmlFor="clientId" className="flex self-center">Client ID:</label>
            <input
               id="clientId"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.entraToken?.clientId ? 'border-foreground' : 'border-red'}`}
               {...register("entraToken.clientId", {
                  required: 'Client ID is required',
                  minLength: {
                     value: 10,
                     message: 'Client ID is too short'
                  }
               })}
            />
         </div>
         {errors.entraToken?.clientId && <p role="alert" className="text-red self-end">⚠ {errors.entraToken?.clientId?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="clientSecret" className="self-center">Client Secret:</label>
            <input
               id="clientSecret"
               type="password"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.entraToken?.clientSecret ? 'border-foreground' : 'border-red'}`}
               {...register("entraToken.clientSecret", {
                  required: 'Client Secret is required',
                  minLength: {
                     value: 10,
                     message: 'Client Secret is too short'
                  }
               })}
            />
         </div>
         {errors.entraToken?.clientSecret && <p role="alert" className="text-red self-end">⚠ {errors.entraToken?.clientSecret?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="tenantId" className="self-center">Tenant ID:</label>
            <input
               id="tenantId"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.entraToken?.tenantId ? 'border-foreground' : 'border-red'}`}
               {...register("entraToken.tenantId", {
                  required: 'Tenant ID is required',
                  pattern: {
                     value: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                     message: 'Invalid Tenant ID format'
                  }
               })}
            />
         </div>
         {errors.entraToken?.tenantId && <p role="alert" className="text-red self-end">⚠ {errors.entraToken?.tenantId?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="dataset" className="self-center">Dataset ID:</label>
            <input
               id="dataset"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.dataset ? 'border-foreground' : 'border-red'}`}
               {...register("dataset", {
                  required: 'Dataset ID is required',
                  pattern: {
                     value: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                     message: 'Invalid Dataset ID format'
                  }
               })}
            />
         </div>
         {errors.dataset && <p role="alert" className="text-red self-end">⚠ {errors.dataset?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="reportId" className="self-center">Report ID:</label>
            <input
               id="reportId"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.reportId ? 'border-foreground' : 'border-red'}`}
               {...register("reportId", {
                  required: 'Report ID is required',
                  pattern: {
                     value: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                     message: 'Invalid Report ID format'
                  }
               })}
            />
         </div>
         {errors.reportId && <p role="alert" className="text-red self-end">⚠ {errors.reportId?.message}</p>}
         <div className="inline-flex justify-end">
            <label htmlFor="groupId" className="self-center">Group ID:</label>
            <input
               id="groupId"
               type="text"
               className={`text-textColor border-b-2 bg-bgDark rounded-md p-1 ml-4 basis-8/12 ${!errors.groupId ? 'border-foreground' : 'border-red'}`}
               {...register("groupId", {
                  required: 'Group ID is required',
                  pattern: {
                     value: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
                     message: 'Invalid Group ID format'
                  }
               })}
            />
         </div>
         {errors.groupId && <p role="alert" className="text-red self-end">⚠ {errors.groupId?.message}</p>}
         <div className="inline-flex justify-around">
            <input
               className="my-1 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-accent"
               type="submit"
               value="Save Configuration"
            />
         </div>
      </form >
   );
};
