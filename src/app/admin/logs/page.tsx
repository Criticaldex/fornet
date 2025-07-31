import { getSession } from "@/services/session"
import { LogTable } from "./table"
import { getTableValues } from "@/services/logs"
import { LogsAnalytics } from "@/components/logs-analytics"

export default async function LogsPage() {
   const session = await getSession();
   let logs: any[] = [];

   if (session) {
      logs = await getTableValues({} as any, undefined, session?.user.db);
   }

   return (
      <div className="flex flex-col space-y-6">
         <LogsAnalytics logs={logs} />
         <LogTable
            logs={logs}
            session={session}
         />
      </div >
   );
}