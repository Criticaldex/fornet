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
         <div className="flex flex-grow-max mx-2 mb-2">
            <div className="flex flex-col grow p-2 bg-bgLight rounded-md ">
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