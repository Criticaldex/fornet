import { getLines, getNames } from "@/services/values";
import { getSession } from "@/services/session";
import { GetNames, GetLines } from "./routing";

export default async function ContractsLayout({ children }: any) {
   const session = await getSession();
   const lines = await getLines();
   const names = await getNames();
   return (
      <div>
         <title>Quadre Comandament</title>
         <div className="mt-2 bg-light text-right flex justify-between items-center">
            <div className="flex justify-start grow mb-2 mx-2">
               <GetLines
                  lines={lines}
               />
               <GetNames
                  names={names}
               />
            </div>
            <div className="bg-light text-right flex justify-end items-center">
               <h1 className="right-0 mx-5 font-semibold text-lg">DB: {session?.user.db}</h1>
               <h1 className="right-0 mx-5 font-semibold text-lg">Collection: values</h1>
               <h1 className="right-0 w-auto mx-10 font-semibold text-2xl italic">Quadre Comandament</h1>
            </div>
         </div>
         <hr className="w-11/12 m-auto border-b border-darkBlue" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}