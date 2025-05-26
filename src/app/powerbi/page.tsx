import { PowerBi } from "./powerbi";
import { PbiForm } from "./form";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { getEmbedUrl, getToken } from "@/services/powerbi";
import { delay } from "lodash";
export default async function Dashboard() {

   const { token } = await getToken("fbca2019-9f7d-4355-bc45-d0a909660154", "5615fe53-6829-41c9-913c-60f82bf0bb8e");
   const { embedUrl } = await getEmbedUrl('d8792594-3b20-4154-9892-77fe3e41f43e', '5615fe53-6829-41c9-913c-60f82bf0bb8e');

   return (
      <>
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-end h-screen p-2 bg-bgLight rounded-md">
               <PbiForm
                  setEntraToken={setEntraToken}
                  setEmbedURL={setEmbedURL}
               />
               <PowerBi
                  entraToken={token}
                  embedURL={embedUrl}
               />
            </div>
         </div>
      </>
   )
}