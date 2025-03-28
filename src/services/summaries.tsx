import _ from "lodash"
import { getSession } from "@/services/session"
import { SummaryIface } from "@/schemas/summary";

const getSummaries = async (filter: any, fields?: string[], db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   if (!fields) {
      fields = ['-_id'];
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summaries/${db}`,
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

export const getChartSummaries = async (filter: SummaryIface) => {
   const data: [] = await getSummaries(filter);
   const dataByMonth = _.groupBy(data, 'month')
   let chartData: any = [{
      type: 'spline',
      name: 'Mitjana',
      color: 'var(--accent)',
      zIndex: 1,
      marker: {
         fillColor: 'white',
         lineWidth: 2,
         lineColor: 'var(--accent)'
      },
      data: []
   }, {
      type: 'columnrange',
      name: 'Rang',
      color: 'var(--accent)',
      lineWidth: 0,
      linkedTo: ':previous',
      opacity: 0.6,
      zIndex: 0,
      marker: {
         enabled: false
      },
      data: []
   }];

   for (const [month, monthData] of (Object.entries(dataByMonth) as [string, any][])) {
      let avgSum = 0;
      let min = monthData[0].min;
      let max = monthData[0].max;
      monthData.map((dia: any) => {
         avgSum += dia.avg;
         min = (dia.min < min) ? dia.min : min;
         max = (dia.max > max) ? dia.max : max;
      })
      const avg = (avgSum / monthData.length);
      chartData[0].data.push({
         name: month,
         y: avg,
      });
      chartData[1].data.push({
         name: month,
         high: max,
         low: min,
      });
   };
   return chartData;
}

export const getLineSummaries = async (line: string, year: number) => {
   const session = await getSession();
   let lineData: any = {};
   for await (const lineConf of session?.user.config.summary[line]) {
      // await session?.user.config.summary[line].forEach(async (lineConf: any) => {
      lineData[lineConf.name] = await getChartSummaries({
         line: line,
         name: lineConf.name,
         year: year
      });
   }
   return lineData;
}

export const getLines = async (db?: any) => {
   const fields = ['-_id', 'line']
   const data = await getSummaries({}, fields, db);
   let groupBySec = _.groupBy(data, 'line');
   let lines: string[] = [];
   for (const [key, value] of (Object.entries(groupBySec) as [string, any][])) {
      lines.push(key);
   }
   return lines;
}

export const getNames = async (filter?: SummaryIface, db?: any) => {
   const fields = ['-_id', 'name', 'unit']
   const data = await getSummaries(filter, fields, db);
   let groupByName = _.groupBy(data, 'name');

   let names: string[] = [];
   let units: string[] = [];
   for (const [key, value] of (Object.entries(groupByName) as [string, any][])) {
      names.push(key);
      units.push(value[0].unit);
   }
   return { names, units };
}

export const deleteSummaries = async (filter: SummaryIface, db: string | undefined) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/summaries/${db}`,
      {
         method: 'DELETE',
         headers: {
            'Content-type': 'application/json',
            token: `${process.env.NEXT_PUBLIC_API_KEY}`,
         },
         body: JSON.stringify(filter)
      }).then(res => res.json());
}

export const getYears = async () => {
   const data = await getSummaries({}, ['year']);
   const yearsGroup = _.groupBy(data, 'year');
   let years: string[] = []
   for (const [key, value] of (Object.entries(yearsGroup) as [string, any][])) {
      years.push(key);
   }
   return years;
}