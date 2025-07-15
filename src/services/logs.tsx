import _ from "lodash"
import { getSession } from "@/services/session"
import { LogIface } from "@/schemas/log";

const getValues = async (filter: LogIface, fields?: string[], db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = ['-_id'];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(
            {
               fields: fields,
               filter: filter,
               sort: 'timestamp'
            }
         ),
      }).then(res => res.json());
}

const insertValue = async (body: LogIface, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!body) {
      throw new Error('Body is required');
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(body),
      }).then(res => res.json());
}

export const getTableValues = async (filter: LogIface, fields?: string[], db?: string) => {
   const data: [] = await getValues(filter, fields, db);
   return data;
}

export const deleteValues = async (filter: LogIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logs/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}