import _ from "lodash"
import { getSession } from "@/services/session"

const getEqas = async (filter: any) => {
   const session = await getSession();
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/eqas`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               db: session?.user.db,
               fields: [
                  "-_id"
               ],
               filter: filter,
            }
         ),
      }).then(res => res.json());
}

export const getEqasContracts = async (year: string, centers: any) => {
   const filter = { 'any': year }
   const data = await getEqas(filter);

   return data.map((i: any) => {
      return {
         name: centers[i.centre].name,
         data: i.punts
      }
   })
}