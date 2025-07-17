import { getSession } from "@/services/session"
import { LogTable } from "./table"
import { getTableValues } from "@/services/logs"

export default async function LogsPage() {
   const session = await getSession();
   let logs = null;
   if (session) {
      logs = await getTableValues({} as any, undefined, session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <LogTable
            logs={logs}
            session={session}
         />
      </div >
   );
}