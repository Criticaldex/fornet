import { getSession } from "@/services/session"
import { UsersForm } from "./form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


export default async function ProfilePage() {
   const session = await getSession();

   return (
      <div className="flex place-content-center mt-2">
         <ToastContainer />
         <div className="flex basis-1/4 rounded-md bg-light">
            <UsersForm
               session={session}
               toast={toast}
            />
         </div>
      </div>
   )
};

