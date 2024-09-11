import { getSession } from "@/services/session"
import { PlcTable } from "./table"
import { getPlcs } from "@/services/plcs"
import { getNodeNames } from "@/services/nodes"

export default async function ValuesPage() {
   const session = await getSession();
   let plcs = null;
   let nodes = null;
   if (session) {
      plcs = await getPlcs(session?.user.db);
      nodes = await getNodeNames(session?.user.db)
   }

   return (
      <div className="flex flex-col">
         <PlcTable
            plcs={plcs}
            nodes={nodes}
            session={session}
         />
      </div >
   );
}