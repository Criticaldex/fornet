import _ from "lodash"
import { PlcIface } from "@/schemas/plc";
import { getSession } from "./session";

export const getPlcs = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

const getFilteredPlcs = async (db?: string, filter?: any, fields?: string[], sort?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = [];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
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
               sort: sort
            }
         ),
      }).then(res => res.json());
}

export const getLines = async (db?: string, filter?: any) => {
   const data = await getFilteredPlcs(db, filter, ['-_id', 'line']);
   let groupByLine = _.groupBy(data, 'line');
   let lines: string[] = [];
   for (const [key, value] of (Object.entries(groupByLine) as [string, any][])) {
      lines.push(key);
   }
   return lines;
}

export const getNames = async (db: string) => {
   const data = await getFilteredPlcs(db, {}, ['-_id', 'name']);
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
   }
   return names;
}

export const upsertPlc = async (filter: PlcIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
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
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}