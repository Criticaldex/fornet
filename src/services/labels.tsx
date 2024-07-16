import _ from "lodash"
import { LabelIface } from "@/schemas/label";

export const getLabels = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${db}`,
      {
         method: 'GET'
      }).then(res => res.json());
}

export const upsertLabel = async (filter: LabelIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deleteLabel = async (filter: LabelIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/labels/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}