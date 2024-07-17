import _ from "lodash"
import { VartableIface } from "@/schemas/vartable";

export const getVartables = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vartables/${db}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

export const upsertVartable = async (filter: VartableIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vartables/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deleteVartable = async (filter: VartableIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/vartables/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}