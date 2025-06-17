import _ from "lodash"

export const getEntraToken = async (tenantId: string) => {
   const clientId = process.env.AZURE_CLIENTID!;
   const clientSecret = process.env.AZURE_CLIENTSECRET!;

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
      throw new Error(`Error al obtener el token: ${JSON.stringify(errorData, null, 2)}`);
   }

   const result = await response.json();
   return result.access_token;
};

export const getToken = async (dataset: string, report: string, Token: string) => {
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
                     'id': report
                  }
               ]
            }
         )
      })
   const result = await response.json();
   return result.token;
}

export const getEmbedUrl = async (groupId: string, reportId: string, Token: string) => {
   const response = await fetch(`https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${Token}`
         }
      })
   const result = await response.json();
   return result.embedUrl;
}