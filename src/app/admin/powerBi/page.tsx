import { getPowerBIConfig, upsertPowerBIConfig } from "@/services/powerbi";
import { PowerBIForm } from "./form";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default async function PowerBIPage() {
   const powerBIConfig = await getPowerBIConfig();

   return (
      <div className="flex place-content-center mt-2">
         <ToastContainer />
         <div className="flex basis-1/3 rounded-md bg-light">
            <PowerBIForm
               powerBIConfig={powerBIConfig}
               toast={toast}
            />
         </div>
      </div>
   )
};