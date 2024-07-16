import { getSession } from "@/services/session"
import { AdminTable } from "./table"
import { getVartables } from "@/services/vartables"

export default async function ValuesPage() {
   const session = await getSession();
   let vartables = null;
   if (session) {
      vartables = await getVartables(session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <AdminTable
            vartables={vartables}
            session={session}
         />
      </div >
   );
}