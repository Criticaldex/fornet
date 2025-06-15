import { PowerBi } from "./powerbi";
import { PbiForm } from "./form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { getEmbedUrl, getToken, getEntraToken } from "@/services/powerbi";
import { delay } from "lodash";
export default async function Dashboard() {

   const response1 = await getEntraToken(process.env.AZURE_TENANTID);
   const response = await getToken('26c2b827-3906-46c7-98a5-b1affecfe86a', '756c3a2c-6b3e-4877-b488-2409fa990d15', response1);
   const response2 = await getEmbedUrl('f0f6519f-717e-4881-a515-7b76fbd0e7e4', '756c3a2c-6b3e-4877-b488-2409fa990d15', response1);

   return (
      <>
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-end h-screen p-2 bg-bgLight rounded-md">
               <PowerBi
                  // entraToken={'token'}
                  // embedURL={'embedUrl'}
                  entraToken={response.token}
                  embedURL={response2.embedUrl}
               />
            </div>
         </div>
      </>
   )
}