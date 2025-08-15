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

   try {
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
      );
   } catch (error) {
      return (
         <div className="h-full flex flex-col mx-2 mb-2">
            <div className="flex mt-auto flex-col grow justify-center items-center h-screen p-2 bg-bgLight rounded-md">
               <div className="text-center space-y-4">
                  <h2 className="text-red-500 text-xl font-bold">PowerBI Error</h2>
                  <p className="text-red-400">
                     Failed to load PowerBI dashboard. Please check your configuration.
                  </p>
                  <details className="text-left bg-red-50 p-4 rounded-md border border-red-200">
                     <summary className="cursor-pointer text-red-600 font-medium">Error Details</summary>
                     <pre className="mt-2 text-red-700 text-sm whitespace-pre-wrap">
                        {error instanceof Error ? error.message : String(error)}
                     </pre>
                  </details>
               </div>
            </div>
         </div>
      );
   }
}