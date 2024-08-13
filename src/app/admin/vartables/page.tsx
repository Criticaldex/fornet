import { getSession } from "@/services/session"
import { PlcTable } from "./table"
import { getPlcs } from "@/services/plcs"

export default async function ValuesPage() {
   const session = await getSession();
   let vartables = null;
   if (session) {
      vartables = await getPlcs(session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <PlcTable
            vartables={vartables}
            session={session}
         />
      </div >
   );
}