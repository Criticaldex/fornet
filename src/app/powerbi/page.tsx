import { PowerBi } from "./powerbi";
import { getEmbedUrl, getToken, getEntraToken, getPowerBIConfig } from "@/services/powerbi";

export default async function Dashboard() {
   // Fetch PowerBI configuration from database
   const powerBIConfig = await getPowerBIConfig();

   if (!powerBIConfig) {
      return (
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-center items-center h-screen p-2 bg-bgLight rounded-md">
               <p className="text-red-500 text-lg">PowerBI configuration not found. Please configure PowerBI in the admin panel.</p>
            </div>
         </div>
      );
   }

   // Use the configuration data to get tokens and URLs
   const AzureEntraToken = await getEntraToken(powerBIConfig.entraToken);
   const Token = await getToken(powerBIConfig.dataset, powerBIConfig.reportId, AzureEntraToken);
   const EmbededUrl = await getEmbedUrl(powerBIConfig.groupId, powerBIConfig.reportId, AzureEntraToken);

   return (
      <>
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-end h-screen p-2 bg-bgLight rounded-md">
               <PowerBi
                  entraToken={Token}
                  embedURL={EmbededUrl}
               />
            </div>
         </div>
      </>
   )
}