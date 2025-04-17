import { getSession } from "@/services/session";
import { GetLinksYears } from "./routing";
import { FaCog } from "react-icons/fa"
import Link from "next/link";
import { getYears } from "@/services/summaries";

export default async function MqttLayout({ children }: any) {
   const session = await getSession();
   const years = await getYears();
   return (
      <div>
         <title>MQTT</title>
         <div className="mt-2 ml-4 bg-light text-right flex justify-between items-center">
            <div>
               <label>Display Hours: </label>
               <GetLinksYears
                  years={years}
               />
            </div>
            <div className="bg-light text-right flex justify-end items-center">
               <h1 className="right-0 w-auto mx-4 font-semibold text-2xl">Live Values</h1>
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