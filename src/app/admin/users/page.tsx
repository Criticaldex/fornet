import { getSession } from "@/services/session"
import { AdminTable } from "./table"
import { getUsers } from "@/services/users"

export default async function RegisterPage() {
   const session = await getSession();
   const users = await getUsers();

   return (
      <div className="flex flex-col">
         <AdminTable
            users={users}
            session={session}
         />
      </div >
   );
}