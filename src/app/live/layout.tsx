import { getSession } from "@/services/session";
import { GetTimeIntervals } from "./routing";

export default async function ContractsLayout({ children }: any) {
   const session = await getSession();
   return (
      <div>
         <title>Live Values</title>
         <div className="mt-2 bg-light text-right flex justify-end items-center">
            <div className="bg-light text-right flex justify-end items-center">
               <GetTimeIntervals />
               <h1 className="right-0 mx-5 font-semibold text-lg">DB: {session?.user.db}</h1>
               <h1 className="right-0 mx-5 font-semibold text-lg">Collection: values</h1>
               <h1 className="right-0 w-auto mx-10 font-semibold text-2xl italic">Quadre Comandament</h1>
            </div>
         </div>
         <hr className="w-11/12 m-auto border-b border-accent" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}