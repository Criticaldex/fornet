import _ from "lodash"
import { SensorIface } from "@/schemas/sensor";
import { getSession } from "./session";
import valueSchema, { ValueIface } from '@/schemas/value';

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

export const getNames = async (plc: string, db?: string) => {
   const data = await getFilteredSensors(db, { plc_name: plc }, ['-_id', 'name'], 'name');
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];

   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
   }
   return names;
}

export const getSensorsWithIds = async (plc: string, db?: string) => {
   const data = await getFilteredSensors(db, { plc_name: plc }, ['_id', 'name'], 'name');
   let groupByName = _.groupBy(data, 'name');

   let sensors: { _id: string, name: string }[] = [];

   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      if (value.length > 0) {
         sensors.push({ _id: value[0]._id, name: key });
      }
   }
   return sensors;
}

export const getNamesUnits = async (line: string, db?: string) => {
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
   const data = await getFilteredSensors(db, { read: true }, ['-_id', 'name', 'unit', 'line', 'minrange', 'maxrange'], 'name');
   return _.groupBy(data, 'line');
}

export const upsertSensor = async (filter: SensorIface, db: string | undefined, plcType?: string | undefined) => {
   let data = filter;
   if (plcType != 'modbus') {
      const { dataType, ...dataWithoutType } = filter;
      data = dataWithoutType;
   } else {
      data = filter
   }
   if (data.autoinc) {
      const body: ValueIface = {
         line: data.line,
         plc_name: data.plc_name,
         name: data.name,
         unit: data.unit,
         value: 0,
         timestamp: new Date().getTime()
      }
      const value = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${db}`,
         {
            method: 'PATCH',
            headers: {
               'Content-type': 'application/json',
               token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
            body: JSON.stringify(body)
         }).then(res => res.json());
      console.log('value: ', value);
   }
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sensors/${db}`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(data)
      }).then(res => res.json());
}

export const updateSensors = async (filter: SensorIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/plcs/${db}/sensors`,
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