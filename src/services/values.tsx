import _ from "lodash"
import { getSession } from "@/services/session"

const getValues = async (filter: any, fields?: string[], db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = ['-_id'];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/values`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               db: db,
               fields: fields,
               filter: filter,
               sort: 'ordre'
            }
         ),
      }).then(res => res.json());
}

export const getChartValues = async (line: string, name: string) => {
   const filter = {
      "line": line, "name": name
   };
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

export const getLines = async (filtros?: any) => {
   const fields = ['-_id', 'line']
   const data = await getValues(filtros, fields);
   let groupBySec = _.groupBy(data, 'line');
   let lines: string[] = [];
   for (const [key, value] of (Object.entries(groupBySec) as [string, any][])) {
      lines.push(key);
   }
   return lines;
}

export const getNames = async (filtros?: any, db?: any) => {
   const fields = ['-_id', 'name', 'unit']
   const data = await getValues(filtros, fields, db);
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   let units: string[] = [];
   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
      units.push(value[0].unit);
   }

   return { names, units };
}