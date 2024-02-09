import { getSession } from "@/services/session"
import { AdminTable } from "./table"
import { getUsers, getUsersbyDB } from "@/services/users"

export default async function RegisterPage() {
   const session = await getSession();
   let users = null;
   if (session?.user.role == '1') {
      users = await getUsersbyDB(session?.user.db);
   } else if (session?.user.role == '0') {
      users = await getUsers();
   }

   return (
      <div className="flex flex-col">
         <AdminTable
            users={users}
            session={session}
         />
      </div >
   );
}