import React from "react";
import { getCenters } from "@/services/centros"
import { GetLinksView, GetLinksCentro, GetLinksYears, GetLinksSection } from "./routing"
import { getSections, getYears } from "@/services/professionals";

export default async function ProfessionalsLayout({ children }: any) {
   const centros = await getCenters();
   const years = await getYears();

   return (
      <div>
         <title>Professionals</title>
         <div className="mt-2 bg-light flex-col items-center">
            <div className="flex justify-between grow mb-2 mx-2">
               <div className="flex justify-between grow">
                  <GetLinksView />
                  <GetLinksYears
                     years={years}
                  />
                  <GetLinksCentro
                     centros={centros}
                  />
               </div>
               <div className="bg-light text-right flex items-center">
                  <h1 className="mx-10 font-semibold text-2xl italic">Professionals</h1>
               </div>
            </div>
         </div>
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}
