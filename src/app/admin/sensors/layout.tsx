import { redirect } from 'next/navigation';
import { getSession } from "@/services/session"
import { authOptions } from '@/lib/auth';

export default async function LabelsLayout({ children }: any) {
   const session = await getSession();
   if (session?.user.role == "2") {
      redirect("/admin/profile");
   }
   return (
      <div>
         {children}
      </div>
   )
}