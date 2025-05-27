import _ from "lodash"
import { getSession } from "@/services/session"
import { ValueIface } from "@/schemas/value";

const getValues = async (filter: any, fields?: string[], db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = ['-_id'];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${db}`,
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

export const getChartValues = async (filter: ValueIface) => {
   const data: [] = await getValues(filter);
   const values = [{
      name: 'Productividad',
      data: [] as any
   }];

   data.forEach((i: any) => {
      let val = [i.timestamp, i.value];
      values[0].data.push(val);
   })
   return values;
}

export const getLines = async (db?: any) => {
   const fields = ['-_id', 'line']
   const data = await getValues({}, fields, db);
   let groupBySec = _.groupBy(data, 'line');
   let lines: string[] = [];
   for (const [key, value] of (Object.entries(groupBySec) as [string, any][])) {
      lines.push(key);
   }
   return lines;
}

export const getNames = async (filter?: ValueIface, db?: any) => {
   const fields = ['-_id', 'name', 'unit']
   const data = await getValues(filter, fields, db);
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   let units: string[] = [];
   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
      units.push(value[0].unit);
   }
   return { names, units };
}

export const deleteValues = async (filter: ValueIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const getMappedCandleValues = async (filter?: any, db?: any) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${filter.line}/${filter.name}/${filter.interval}`, {
      method: 'GET',
      headers: {
         'Content-type': 'application/json',
         token: `${process.env.NEXT_PUBLIC_API_KEY}`,
      }
   })
      .then(res => res.json())
      .then(data => {
         // Si los datos son históricos (array de [timestamp, price]), los convertimos a OHLC
         if (data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) {
            return convertTicksToOHLC(data, filter.interval * 60000); // Convertir minutos a ms
         }
         // Si ya están en formato OHLC, los devolvemos tal cual
         return data;
      })
      .catch(error => {
         console.error('Error:', error);
         throw error; // Opcional: re-lanzar el error si quieres manejarlo después
      });
}

function convertTicksToOHLC(data: Array<[number, number]>, intervalMs: number): Array<[number, number, number, number, number]> {
   if (data.length === 0) return [];

   const sortedData = [...data].sort((a, b) => a[0] - b[0]);
   const ohlcData: Array<[number, number, number, number, number]> = [];
   let currentIntervalStart = Math.floor(sortedData[0][0] / intervalMs) * intervalMs;
   let currentOpen = sortedData[0][1];
   let currentHigh = sortedData[0][1];
   let currentLow = sortedData[0][1];
   let currentClose = sortedData[0][1];

   for (let i = 1; i < sortedData.length; i++) {
      const [timestamp, price] = sortedData[i];
      const intervalStart = Math.floor(timestamp / intervalMs) * intervalMs;

      // Mismo intervalo: actualiza high, low y close
      if (intervalStart === currentIntervalStart) {
         currentHigh = Math.max(currentHigh, price);
         currentLow = Math.min(currentLow, price);
         currentClose = price;
      }
      // Nuevo intervalo: guarda la vela actual y comienza una nueva
      else {
         ohlcData.push([currentIntervalStart, currentOpen, currentHigh, currentLow, currentClose]);
         currentIntervalStart = intervalStart;
         currentOpen = price;
         currentHigh = price;
         currentLow = price;
         currentClose = price;
      }
   }

   // Añadir la última vela
   ohlcData.push([currentIntervalStart, currentOpen, currentHigh, currentLow, currentClose]);
   return ohlcData;
}