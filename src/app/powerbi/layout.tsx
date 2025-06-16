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
         <title>Fornet | PowerBi</title>
         <hr className="m-auto border-b border-accent mx-4 rounded-md" />
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}