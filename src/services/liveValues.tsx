import _ from "lodash"
import { getSession } from "@/services/session"
import { ValueIface } from "@/schemas/value";

export const getMappedCandleValues = async (filter: { line: string; name: string; interval: number }, db?: string | undefined) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${db}/${filter.line}/${filter.name}/${filter.interval}/candle`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         }
      }).then(res => res.json());
}

export const getCandleLastValue = async (filter: { line: string; name: string; }, db?: string | undefined) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }
   return await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/liveValues/${db}/${filter.line}/${filter.name}/lastValue`,
      {
         method: 'GET',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
      }).then(res => res.json());
};