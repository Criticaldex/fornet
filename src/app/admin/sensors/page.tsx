import { getSession } from "@/services/session"
import { AdminTable } from "./table"
import { getSensors } from "@/services/sensors"

export default async function ValuesPage() {
   const session = await getSession();
   let sensors = null;
   if (session) {
      sensors = await getSensors(session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <AdminTable
            sensors={sensors}
            session={session}
         />
      </div >
   );
}