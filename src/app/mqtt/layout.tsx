import { getSession } from "@/services/session";
import { GetLinksAdmin } from "./routing";
import { FaCog } from "react-icons/fa"
import Link from "next/link";

export default async function ContractsLayout({ children }: any) {
   const session = await getSession();
   return (
      <div>
         <title>MQTT</title>
         <div className="mt-2 ml-4 bg-light text-right flex justify-between items-center">
            <div>
               <GetLinksAdmin />
            </div>
            <div className="bg-light text-right flex justify-end items-center">
               <h1 className="right-0 w-auto mx-4 font-semibold text-2xl">MQTT</h1>
               <Link key={"/admin/plcs"} href={'/admin/plcs'} className={'hover:text-accent mr-8'}>
                  <FaCog size={19} />
               </Link>
            </div>
         </div>
         <hr className="m-auto border-b border-accent mx-4 rounded-md" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}