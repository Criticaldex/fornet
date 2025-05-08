import { getSession } from "@/services/session";
import { GetLinksAdmin } from "./routing";
import { FaCog } from "react-icons/fa"
import Link from "next/link";

export default async function ContractsLayout({ children }: any) {
   const session = await getSession();
   return (
      <div>
         <title>Fornet | MQTT</title>
         <div className="mt-2 ml-4 bg-light text-right flex justify-between items-center">
            <div>
               <GetLinksAdmin />
            </div>
         </div>
         <hr className="m-auto border-b border-accent mx-4 rounded-md" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}