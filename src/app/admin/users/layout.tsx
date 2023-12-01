import { redirect } from 'next/navigation';
import { getSession } from "@/services/session"
import { authOptions } from '@/lib/auth';

export default async function UsersLayout({ children }: any) {
   const session = await getSession();
   if (session?.user.role != "0") {
      redirect("/admin/profile");
   }
   return (
      <div>
         {children}
      </div>
   )
}