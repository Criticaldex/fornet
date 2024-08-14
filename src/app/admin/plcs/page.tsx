import { getSession } from "@/services/session"
import { PlcTable } from "./table"
import { getPlcs } from "@/services/plcs"

export default async function ValuesPage() {
   const session = await getSession();
   let plcs = null;
   if (session) {
      plcs = await getPlcs(session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <PlcTable
            plcs={plcs}
            session={session}
         />
      </div >
   );
}