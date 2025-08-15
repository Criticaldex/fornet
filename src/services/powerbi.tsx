import _ from "lodash"
import { PowerBIIface } from "@/schemas/powerbi";
import { getSession } from "@/services/session";
import { insertValue as insertLog } from "@/services/logs";

export const getPowerBIConfig = async (): Promise<PowerBIIface | null> => {
   const session = await getSession();
   if (!session?.user?.db) {
      throw new Error('No database context found');
   }

   try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/powerbi/${session.user.db}`, {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      });

      if (!response.ok) {
         insertLog({
            user: session.user.email,
            resource: 'PowerBI',
            timestamp: Date.now(),
            message: `Failed to fetch PowerBI config: ${response.status}`,
            severity: 'ERROR'
         });
         throw new Error('Failed to fetch PowerBI config');
      }

      insertLog({
         user: session.user.email,
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'PowerBI config fetched successfully',
         severity: 'INFO'
      });

      return response.json();
   } catch (error) {
      insertLog({
         user: session.user.email,
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error fetching PowerBI config: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
};

export const upsertPowerBIConfig = async (data: PowerBIIface, session?: any) => {

   console.log('session: ', session);


   if (!session) {
      console.log('getting session');

      session = await getSession();
   }

   try {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/powerbi/${session?.user.db}`, {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
   } catch (error) {
      insertLog({
         user: session?.user.email || 'unknown',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error updating PowerBI configuration: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
}

export const getEntraToken = async (entraToken?: { clientId: string; clientSecret: string; tenantId: string }) => {
   const session = await getSession();

   let clientId, clientSecret, tenantId;

   if (entraToken) {
      clientId = entraToken.clientId;
      clientSecret = entraToken.clientSecret;
      tenantId = entraToken.tenantId;
   } else {
      // Fallback to environment variables for backward compatibility
      clientId = process.env.AZURE_CLIENTID!;
      clientSecret = process.env.AZURE_CLIENTSECRET!;
      tenantId = process.env.AZURE_TENANTID!;
   }

   const scope = "https://analysis.windows.net/powerbi/api/.default";

   const data = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
      claims: JSON.stringify({
         access_token: {
            nbf: { essential: true, value: Math.floor(Date.now() / 1000) }
         }
      })
   });

   try {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'Attempting to get Entra token for PowerBI',
         severity: 'INFO'
      });

      const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
         method: "POST",
         headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
         },
         body: data,
      });

      if (!response.ok) {
         const errorData = await response.json();
         insertLog({
            user: session?.user?.email || 'system',
            resource: 'PowerBI',
            timestamp: Date.now(),
            message: `Failed to get Entra token: ${JSON.stringify(errorData)}`,
            severity: 'ERROR'
         });
         throw new Error(`Error al obtener el token: ${JSON.stringify(errorData, null, 2)}`);
      }

      const result = await response.json();

      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'Entra token obtained successfully',
         severity: 'INFO'
      });

      return result.access_token;
   } catch (error) {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error getting Entra token: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
};

export const getToken = async (dataset: string, reportId: string, Token: string) => {
   const session = await getSession();

   try {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Attempting to get PowerBI embed token for dataset: ${dataset}, report: ${reportId}`,
         severity: 'INFO'
      });

      const response = await fetch('https://api.powerbi.com/v1.0/myorg/GenerateToken',
         {
            method: 'POST',
            headers: {
               'Content-type': 'application/json',
               'Authorization': `Bearer ${Token}`
            },
            body: JSON.stringify(
               {
                  'datasets': [
                     {
                        'id': dataset
                     }
                  ],
                  'reports': [
                     {
                        'allowEdit': true,
                        'id': reportId
                     }
                  ]
               }
            )
         });

      if (!response.ok) {
         insertLog({
            user: session?.user?.email || 'system',
            resource: 'PowerBI',
            timestamp: Date.now(),
            message: `Failed to get PowerBI embed token: ${response.status}`,
            severity: 'ERROR'
         });
         throw new Error(`Failed to get PowerBI embed token: ${response.status}`);
      }

      const result = await response.json();

      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'PowerBI embed token obtained successfully',
         severity: 'INFO'
      });

      return result.token;
   } catch (error) {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error getting PowerBI embed token: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
}

export const getEmbedUrl = async (groupId: string, reportId: string, Token: string) => {
   const session = await getSession();

   try {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Attempting to get PowerBI embed URL for group: ${groupId}, report: ${reportId}`,
         severity: 'INFO'
      });

      const response = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
         {
            method: 'GET',
            headers: {
               'Content-type': 'application/json',
               'Authorization': `Bearer ${Token}`
            }
         });

      if (!response.ok) {
         insertLog({
            user: session?.user?.email || 'system',
            resource: 'PowerBI',
            timestamp: Date.now(),
            message: `Failed to get PowerBI embed URL: ${response.status}`,
            severity: 'ERROR'
         });
         throw new Error(`Failed to get PowerBI embed URL: ${response.status}`);
      }

      const result = await response.json();

      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'PowerBI embed URL obtained successfully',
         severity: 'INFO'
      });

      return result.embedUrl;
   } catch (error) {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error getting PowerBI embed URL: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
}

// Convenience function that gets config from database and generates all required tokens
export const getPowerBIEmbedData = async () => {
   const session = await getSession();

   try {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'Attempting to get complete PowerBI embed data',
         severity: 'INFO'
      });

      const config = await getPowerBIConfig();
      if (!config) {
         insertLog({
            user: session?.user?.email || 'system',
            resource: 'PowerBI',
            timestamp: Date.now(),
            message: 'PowerBI configuration not found',
            severity: 'ERROR'
         });
         throw new Error('PowerBI configuration not found');
      }

      const entraToken = await getEntraToken(config.entraToken);
      const embedToken = await getToken(config.dataset, config.reportId, entraToken);
      const embedUrl = await getEmbedUrl(config.groupId, config.reportId, entraToken);

      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: 'PowerBI embed data generated successfully',
         severity: 'INFO'
      });

      return {
         config,
         entraToken,
         embedToken,
         embedUrl
      };
   } catch (error) {
      insertLog({
         user: session?.user?.email || 'system',
         resource: 'PowerBI',
         timestamp: Date.now(),
         message: `Error getting PowerBI embed data: ${error}`,
         severity: 'ERROR'
      });
      throw error;
   }
};