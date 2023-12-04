import _ from "lodash"
import { getSession } from "@/services/session"

const getValues = async (filter: any, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               db: db,
               fields: [
                  "-_id"
               ],
               filter: filter,
               sort: 'ordre'
            }
         ),
      }).then(res => res.json());
}

export const getChartValues = async (year: string, center: string) => {
   const filter = { "any": year, "centre": center };
   const data = await getValues(filter);

   return data.map((i: any) => {
      return {
         name: i.identificador,
         data: i.resultat
      }
   })
}