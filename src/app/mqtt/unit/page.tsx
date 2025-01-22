import { getSession } from "@/services/session"
import { MqttTable } from "./table"
import { getMqtts, getFilteredMqtts } from "@/services/mqtts"
import { getNodeNames } from "@/services/nodes"

export default async function ValuesPage() {
   const session = await getSession();
   let mqtts = null;
   let nodes = null;
   if (session) {
      // mqtts = await getMqtts(session?.user.db);
      mqtts = await getFilteredMqtts(session?.user.db, { name: 'null' });
      nodes = await getNodeNames(session?.user.db)
   }

   return (
      <div className="flex flex-col">
         <MqttTable
            mqtts={mqtts}
            nodes={nodes}
            session={session}
         />
      </div >
   );
}