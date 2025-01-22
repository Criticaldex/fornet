import _ from "lodash"
import { MqttIface } from "@/schemas/mqtt";
import { getSession } from "./session";

export const getMqtts = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mqtt/${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

export const getFilteredMqtts = async (db?: string, filter?: any, fields?: string[], sort?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = [];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mqtt/${db}`,
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

export const getMqttConfigs = async (db?: string, filter?: any) => {
   const data = await getFilteredMqtts(db, filter);
   let groupByName = _.groupBy(data, 'name');
   let tableData: object[] = [];


   for (const [name, nameGrouped] of (Object.entries(groupByName) as [string, any][])) {
      let groupByLine = _.groupBy(nameGrouped, 'line');
      for (const [line, lineGrouped] of (Object.entries(groupByLine) as [string, any][])) {
         let subtableData: object[] = [];
         lineGrouped.map((config: any) => {
            subtableData.push(config);
         });
         tableData.push({ name: name, line: line, subtable: subtableData });
      }
   }

   return tableData;
}

export const getNodes = async (db?: string, filter?: any) => {
   const data = await getFilteredMqtts(db, filter, ['-_id', 'node']);
   let groupByLine = _.groupBy(data, 'node');
   let nodes: string[] = [];
   for (const [key, value] of (Object.entries(groupByLine) as [string, any][])) {
      nodes.push(key);
   }
   return nodes;
}

export const getNames = async (db: string) => {
   const data = await getFilteredMqtts(db, {}, ['-_id', 'name']);
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
   }
   return names;
}

export const upsertMqtt = async (filter: MqttIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mqtt/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deleteMqtt = async (filter: MqttIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mqtt/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}