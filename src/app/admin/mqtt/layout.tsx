import { getSession } from "@/services/session";
import { FaCog } from "react-icons/fa"
import Link from "next/link";

export default async function ContractsLayout({ children }: any) {
   const session = await getSession();
   return (
      <div>
         <title>Fornet | MQTT</title>
         <main className="m-2">
            {children}
         </main>
      </div>
   )
}