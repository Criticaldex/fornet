import { getSession } from "@/services/session";
import { PowerBi } from "./powerbi";

export default async function Dashboard() {
   const session = await getSession();

   return (
      <>
         <div className="flex mx-2 mb-2">
            <div className="flex grow p-2 bg-bgLight rounded-md ">
               <PowerBi />
            </div>
         </div>
      </>
   )

}