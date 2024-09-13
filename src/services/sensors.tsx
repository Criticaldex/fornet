import _ from "lodash"
import { SensorIface } from "@/schemas/sensor";
import { getSession } from "./session";

export const getSensors = async (db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
}

const getFilteredSensors = async (db?: string, filter?: any, fields?: string[], sort?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = [];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
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

export const getNames = async (line: string, db?: string) => {
   const data = await getFilteredSensors(db, { line: line }, ['-_id', 'name', 'unit'], 'name');
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   let units: string[] = [];

   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
      units.push(value[0].unit);
   }
   return { names, units };
}

export const getSensorsbyLine = async (db?: string) => {
   const data = await getSensors(db);
   return _.groupBy(data, 'line');
}

export const upsertSensor = async (filter: SensorIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const deleteSensor = async (filter: SensorIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}