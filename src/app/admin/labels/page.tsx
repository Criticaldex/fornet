import { getSession } from "@/services/session"
import { AdminTable } from "./table"
import { getLabelsbyDB } from "@/services/labels"

export default async function ValuesPage() {
   const session = await getSession();
   let labels = null;
   if (session) {
      labels = await getLabelsbyDB(session?.user.db);
   }

   return (
      <div className="flex flex-col">
         <AdminTable
            labels={labels}
            session={session}
         />
      </div >
   );
}