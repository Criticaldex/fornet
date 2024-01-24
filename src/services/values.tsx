import _ from "lodash"
import { getSession } from "@/services/session"

const getValues = async (filter: any, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
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
               fields: [
                  "-_id"
               ],
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

export const splitbyTimeInterval = async (data: any, interval: number) => {
   let tornSegons = 8 * 60 * 60;
   let xAxis = [];
   let now = new Date();
   let hoursNow = now.getHours();
   let minutesNow = now.getMinutes();
   for (let i = 0; i < (tornSegons / interval); i++) {
      let timestamp = new Date();
      const element = '';
   }
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