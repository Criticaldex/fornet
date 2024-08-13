import _ from "lodash"
import { PlcIface } from "@/schemas/plc";

export const getPlcs = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

export const upsertPlc = async (filter: PlcIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deletePlc = async (filter: PlcIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}