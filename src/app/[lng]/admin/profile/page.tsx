import { getSession } from "@/services/session"
import { getUser } from "@/services/users";
import { UsersForm } from "./form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function ProfilePage() {
   const session = await getSession();
   const email: any = session?.user.email;
   const user = await getUser(email);

   return (
      <div className="flex place-content-center mt-2">
         <ToastContainer />
         <div className="flex basis-1/4 rounded-md bg-light">
            <UsersForm
               user={user}
               toast={toast}
            />
         </div>
      </div>
   )
};