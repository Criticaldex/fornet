'use client'
import { PowerBi } from "./powerbi";
import { PbiForm } from "./form";
import { useForm } from "react-hook-form";
import { useState } from "react";
export default function Dashboard() {

   const [entraToken, setEntraToken] = useState('');
   const [embedURL, setEmbedURL] = useState('');

   return (
      <>
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-end h-screen p-2 bg-bgLight rounded-md">
               <PbiForm
                  setEntraToken={setEntraToken}
                  setEmbedURL={setEmbedURL}
               />
               <PowerBi
                  entraToken={entraToken}
                  embedURL={embedURL}
               />
            </div>
         </div>
      </>
   )
}