import _ from "lodash"
import { getSession } from "@/services/session"

const getIndicators = async (filter: any, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators`,
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

export const updateIndicators = async (data: any) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/indicators`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
}

export const getChartIndicators = async (year: string, center: string) => {
   const filter = { "any": year, "centre": center };
   const data = await getIndicators(filter);

   return data.map((i: any) => {
      return {
         name: i.identificador,
         data: i.resultat
      }
   })
}

export const getTableIndicatorsGeneral = async (year: string) => {
   const filter: any = {
      grup: "general",
      any: year
   };
   const data = await getIndicators(filter);
   return _.groupBy(data, 'codi');
}

export const getTableIndicatorsNoCpr = async (year: string) => {
   const filter: any = {
      grup: "nocpr",
      any: year
   };
   const data = await getIndicators(filter);
   return _.groupBy(data, 'codi');
}

export const getTableIndicatorsCpr = async (year: string) => {
   const filter: any = {
      grup: "cpr",
      any: year,
   };
   const data = await getIndicators(filter);
   return _.groupBy(data, 'codi');
}

export const getYears = async () => {
   const data = await getIndicators({});
   const yearsGroup = _.groupBy(data, 'any');
   let years: string[] = []
   for (const [key, value] of (Object.entries(yearsGroup) as [string, any][])) {
      years.push(key);
   }
   return years;
}

export const getAdminTable = async (year: string, center: string, db?: string) => {
   const filter: any = {
      any: year,
      centre: center
   };
   return await getIndicators(filter, db);
}