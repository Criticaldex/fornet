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

export const getMappedCandleValues = async (filter: { line: string; name: string; interval: number }, db?: any) => {
   // Intervalo de cada vela en milisegundos (30 minutos)
   const candleIntervalMs = 30 * 60 * 1000; // 30 minutos
   // Intervalo total de datos en milisegundos (filter.interval en horas)
   const totalIntervalMs = filter.interval * 60 * 60 * 1000; // e.g., 8 horas

   // Alinear endTime al intervalo de 30 minutos más reciente
   const now = new Date();
   const endTime = Math.floor(
      new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), now.getMinutes()).getTime() / candleIntervalMs
   ) * candleIntervalMs;
   // Calcular startTime restando el intervalo total
   const startTime = endTime - totalIntervalMs;

   console.log('startTime:', new Date(startTime).toISOString());
   console.log('endTime:', new Date(endTime).toISOString());

   try {
      const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${filter.line}/${filter.name}/${filter.interval}?startTime=${startTime}&endTime=${endTime}`,
         {
            method: 'GET',
            headers: {
               'Content-type': 'application/json',
               token: `${process.env.NEXT_PUBLIC_API_KEY}`,
            },
         }
      );
      const data = await response.json();
      console.log('Datos de la API:', data);

      if (!data || !Array.isArray(data) || data.length === 0 || !Array.isArray(data[0]) || data[0].length !== 2) {
         console.warn('Datos vacíos o formato incorrecto, devolviendo arreglo vacío.');
         return [];
      }

      const ohlcData = convertTicksToOHLC(data, candleIntervalMs, startTime, endTime);
      if (ohlcData.length === 0) {
         console.warn('No se generaron velas válidas a partir de los datos.');
         return [];
      }

      console.log('Velas generadas:', ohlcData.map(([time, o, h, l, c]) => ({
         time: new Date(time).toISOString(),
         open: o,
         high: h,
         low: l,
         close: c
      })));

      return ohlcData;
   } catch (error) {
      console.error('Error al obtener datos:', error);
      throw error;
   }
};

function convertTicksToOHLC(
   data: Array<[number, number]>,
   candleIntervalMs: number,
   startTime: number,
   endTime: number
): Array<[number, number, number, number, number]> {
   if (data.length === 0) return [];

   // 1. Ordenar datos por timestamp
   const sortedData = [...data].sort((a, b) => a[0] - b[0]);

   // 2. Generar intervalos
   const intervals = [];
   const firstIntervalStart = Math.floor(startTime / candleIntervalMs) * candleIntervalMs;
   for (let time = firstIntervalStart; time <= endTime; time += candleIntervalMs) {
      intervals.push(time);
   }

   const ohlcData: Array<[number, number, number, number, number]> = [];
   let lastClose: number | null = null;
   let currentDataIndex = 0;

   // 3. Procesar cada intervalo
   for (const intervalStart of intervals) {
      const intervalEnd = intervalStart + candleIntervalMs;
      const prices: number[] = [];
      let firstPrice: number | null = null;
      let lastPrice: number | null = null;

      // 4. Recolectar precios del intervalo actual
      while (currentDataIndex < sortedData.length) {
         const [timestamp, price] = sortedData[currentDataIndex];
         if (timestamp >= intervalEnd) break;

         if (timestamp >= intervalStart) {
            if (firstPrice === null) {
               firstPrice = price;
            }
            lastPrice = price;
            prices.push(price);
         }
         currentDataIndex++;
      }

      // 5. Calcular OHLC con reglas estrictas
      let open, high, low, close;

      if (prices.length > 0) {
         // Primera vela (sin lastClose)
         if (lastClose === null) {
            open = firstPrice!;
            close = lastPrice!;
            high = Math.max(...prices);
            low = Math.min(...prices);
         }
         // Velas siguientes
         else {
            open = lastClose;
            close = lastPrice!;

            // High debe ser ≥ max(open, close, precios)
            high = Math.max(open, close, ...prices);

            // Low debe ser ≤ min(open, close, precios)
            low = Math.min(open, close, ...prices);
         }
      } else {
         // Sin datos en el intervalo
         open = lastClose !== null ? lastClose : (sortedData[0]?.[1] || 0);
         high = open;
         low = open;
         close = open;
      }

      ohlcData.push([intervalStart, open, high, low, close]);
      lastClose = close;
   }

   return ohlcData;
}