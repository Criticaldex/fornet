import _ from "lodash"
import { NodeIface } from "@/schemas/node";
import { getSession } from "./session";
// const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSIsImtpZCI6IkNOdjBPSTNSd3FsSEZFVm5hb01Bc2hDSDJYRSJ9.eyJhdWQiOiJodHRwczovL2FuYWx5c2lzLndpbmRvd3MubmV0L3Bvd2VyYmkvYXBpIiwiaXNzIjoiaHR0cHM6Ly9zdHMud2luZG93cy5uZXQvMWMzYzdhN2MtM2ZlNS00NmM0LTg0YTktMTY3OWRiZjQzNGE0LyIsImlhdCI6MTc1MDAxMjE3OSwibmJmIjoxNzUwMDEyMTc5LCJleHAiOjE3NTAwMTYwNzksImFpbyI6ImsyUmdZRERjVW4zRmMxc2VrNTJHamtIVkJ6MEdBQT09IiwiYXBwaWQiOiJiMDU3OWI1YS1kM2FlLTQwODItYjNhOC0xZDNmZGY3NTRhNWYiLCJhcHBpZGFjciI6IjEiLCJpZHAiOiJodHRwczovL3N0cy53aW5kb3dzLm5ldC8xYzNjN2E3Yy0zZmU1LTQ2YzQtODRhOS0xNjc5ZGJmNDM0YTQvIiwiaWR0eXAiOiJhcHAiLCJvaWQiOiI0ZThmYjcwZC03ODcxLTQ0NzEtOWFiZC04MWIzYjlkZjdhMGQiLCJyaCI6IjEuQVU4QWZIbzhIT1VfeEVhRXFSWjUyX1EwcEFrQUFBQUFBQUFBd0FBQUFBQUFBQUE1QVFCUEFBLiIsInJvbGVzIjpbIlRlbmFudC5SZWFkV3JpdGUuQWxsIiwiVGVuYW50LlJlYWQuQWxsIl0sInN1YiI6IjRlOGZiNzBkLTc4NzEtNDQ3MS05YWJkLTgxYjNiOWRmN2EwZCIsInRpZCI6IjFjM2M3YTdjLTNmZTUtNDZjNC04NGE5LTE2NzlkYmY0MzRhNCIsInV0aSI6InE0LXVEbFBMT0VxRHZQcUowM2dVQUEiLCJ2ZXIiOiIxLjAiLCJ4bXNfZnRkIjoiVVlaUTd5NllJLVVyN3JodGRDMzQzVnAwb283LXoxZHNrWlB5TXNnZURNMEJabkpoYm1ObFl5MWtjMjF6IiwieG1zX2lkcmVsIjoiNyAxNiIsInhtc19yZCI6IjAuNDJMbFlCSmk5QmNTNFdBWEV0Z2xrX0hXOFdLaDl6NHRucnM2MGVIUGdLS2NRZ0pXLTJkcEJaMzc1N1ozLXB1Ylo5MlAxUUpGT1lRRU9Ca2c0QUNVQmdBIn0.KBcA8rRJDpIapPbSDr9lMbqH1azV7a8T2IhwE27Zk1H-nnaTQ0JKwM_zZXF880v7Ks7BkdaQ2UqclqvJf2EQkSYSxGq2F_RBeS-s41mxtt8TGovGtKsZ3nIzSG7wM8dRs541H8oq07mUKpu1ZvCYKwy6h5fYjKOK8WlZNcuAjjxirCkjQxLMOMrYGXNUNSK7qqR0ViovnsVEoVTrYxSA8Xc-9KejVbFe2LhHAdnAYQtU4_Qp16OyzZedbJhBEni4-YSRrkGedrft3lhw6raVSwTba2o0MyAwTg4iChQgCjccjzW7YowFiSfsu5v0S5mPxp3UWDIPNEO1Q7M0M5p9Ug'

export const getEntraToken = async (tenantId: string) => {
   const clientId = process.env.AZURE_CLIENTID;
   const clientSecret = process.env.AZURE_CLIENTSECRET;
   const scope = "https://analysis.windows.net/powerbi/api/.default";

   const data = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope,
   });

   const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
      method: "POST",
      headers: {
         "Content-Type": "application/x-www-form-urlencoded",
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
   return fetch('https://api.powerbi.com/v1.0/myorg/GenerateToken',
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
      }).then(res => res.json());
}

export const getEmbedUrl = async (groupId: string, reportId: string, Token: string) => {
   return fetch(`https://api.powerbi.com/v1.0/myorg/groups/${groupId}/reports/${reportId}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            'Authorization': `Bearer ${Token}`
         }
      }).then(res => res.json());
}