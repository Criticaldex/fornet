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
   const intervalMs = 30 * 60 * 1000; // 30 minutos
   const now = Date.now();
   const endTime = Math.floor(now / intervalMs) * intervalMs;
   const startTime = endTime - (8 * 60 * 60 * 1000);

   return fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${filter.line}/${filter.name}/${filter.interval}?startTime=${startTime}&endTime=${endTime}`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }
   )
      .then((res) => res.json())
      .then((data) => {
         if (data.length > 0 && Array.isArray(data[0]) && data[0].length === 2) {
            const ohlcData = convertTicksToOHLC(data, intervalMs);
            if (ohlcData.length === 0) {
               console.warn('No se generaron velas válidas a partir de los datos.');
               return [];
            }
            return ohlcData;
         }
         console.warn('Datos vacíos o formato incorrecto, devolviendo arreglo vacío.');
         return [];
      })
      .catch((error) => {
         console.error('Error:', error);
         throw error;
      });
};

function convertTicksToOHLC(
   data: Array<[number, number]>,
   intervalMs: number
): Array<[number, number, number, number, number]> {
   if (data.length === 0) return [];

   const sortedData = [...data].sort((a, b) => a[0] - b[0]);
   const ohlcData: Array<[number, number, number, number, number]> = [];
   let currentIntervalStart = Math.floor(sortedData[0][0] / intervalMs) * intervalMs;
   let pricesInInterval: number[] = [sortedData[0][1]];
   let currentOpen = sortedData[0][1];
   let lastClose = sortedData[0][1];

   for (let i = 1; i < sortedData.length; i++) {
      const [timestamp, price] = sortedData[i];
      const intervalStart = Math.floor(timestamp / intervalMs) * intervalMs;

      if (intervalStart === currentIntervalStart) {
         pricesInInterval.push(price);
      } else {
         const currentHigh = Math.max(...pricesInInterval, currentOpen);
         const currentLow = Math.min(...pricesInInterval, currentOpen);
         const currentClose = pricesInInterval[pricesInInterval.length - 1];
         ohlcData.push([currentIntervalStart, currentOpen, currentHigh, currentLow, currentClose]);

         currentIntervalStart = intervalStart;
         currentOpen = lastClose;
         pricesInInterval = [price];
         lastClose = price;
      }
   }

   // Procesar la última vela
   if (pricesInInterval.length > 0) {
      const currentHigh = Math.max(...pricesInInterval, currentOpen);
      const currentLow = Math.min(...pricesInInterval, currentOpen);
      const currentClose = pricesInInterval[pricesInInterval.length - 1];
      ohlcData.push([currentIntervalStart, currentOpen, currentHigh, currentLow, currentClose]);
   }

   // Validar todas las velas
   const validatedOhlcData = ohlcData.filter(([time, open, high, low, close], index) => {
      if (high < open || high < close || low > open || low > close) {
         console.warn(
            `Vela inválida en índice ${index}: [time=${time}, open=${open}, high=${high}, low=${low}, close=${close}]`
         );
         return false;
      }
      return true;
   });

   return validatedOhlcData;
}