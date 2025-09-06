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
         )
      }).then(res => res.json());
}

export const getChartSummaries = async (filter: SummaryIface, session: any) => {
   const data: [] = await getSummaries(filter, ['-id'], session.user.db);
   const dataByMonth = _.groupBy(data, 'month')
   let chartData: any = [{
      type: 'spline',
      name: 'Average',
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
      name: 'Range',
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

   let monthStr: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
   for (const [month, monthData] of (Object.entries(dataByMonth) as unknown as [number, any][])) {
      // Group daily data by shift to calculate aggregated values
      const shiftGroups = _.groupBy(monthData, 'shift');

      // Calculate monthly averages across all shifts
      let totalAvgSum = 0;
      let monthMin = Number.MAX_VALUE;
      let monthMax = Number.MIN_VALUE;
      let totalDays = 0;

      // For each day, we want the aggregate of all shifts
      const dailyAggregates = _.chain(monthData)
         .groupBy('day')
         .mapValues((dayData: any[]) => {
            const dayAvg = _.meanBy(dayData, 'avg');
            const dayMin = _.minBy(dayData, 'min')?.min || 0;
            const dayMax = _.maxBy(dayData, 'max')?.max || 0;
            return { avg: dayAvg, min: dayMin, max: dayMax };
         })
         .values()
         .value();

      dailyAggregates.forEach((day: any) => {
         totalAvgSum += day.avg;
         monthMin = Math.min(monthMin, day.min);
         monthMax = Math.max(monthMax, day.max);
         totalDays++;
      });

      const monthAvg = totalDays > 0 ? (totalAvgSum / totalDays) : 0;

      chartData[0].data.push({
         name: monthStr[month],
         y: monthAvg,
         drilldown: 'M' + monthStr[month]
      });
      chartData[1].data.push({
         name: monthStr[month],
         high: monthMax,
         low: monthMin,
         drilldown: 'R' + monthStr[month]
      });
   };
   return chartData;
}

export const getLineSummaries = async (line: string, year: number, session: any) => {
   let lineData: any = {};
   for await (const lineConf of session?.user.config.summary[line]) {
      lineData[lineConf.name] = await getChartSummaries({
         line: line,
         name: lineConf.name,
         year: year
      }, session);
   }
   return lineData;
}

export const getChartDrilldown = async (filter: SummaryIface, session: any) => {
   const data: [] = await getSummaries(filter, ['-id'], session.user.db);
   const dataByMonth = _.groupBy(data, 'month')
   let chartData: any = {
      breadcrumbs: {
         position: {
            align: 'right'
         }
      },
      series: []
   };

   let monthStr: string[] = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

   for (const [month, monthData] of (Object.entries(dataByMonth) as unknown as [number, any][])) {
      // Monthly drill-down to days (aggregated by day)
      let mitja = {
         type: 'spline',
         name: 'Daily Average',
         id: '',
         color: 'var(--accent)',
         zIndex: 1,
         marker: {
            fillColor: 'white',
            lineWidth: 2,
            lineColor: 'var(--accent)'
         },
         data: [] as any[]
      }
      let rang = {
         type: 'columnrange',
         name: 'Daily Range',
         id: '',
         color: 'var(--accent)',
         lineWidth: 0,
         opacity: 0.6,
         zIndex: 0,
         marker: {
            enabled: false
         },
         data: [] as any[]
      }

      // Group by day and aggregate shifts
      const dayGroups = _.groupBy(monthData, 'day');
      const orderedDays = _.orderBy(Object.keys(dayGroups), (day) => parseInt(day));

      orderedDays.forEach((dayKey) => {
         const dayData = dayGroups[dayKey];
         const dayAvg = _.meanBy(dayData, 'avg');
         const dayMin = _.minBy(dayData, 'min')?.min || 0;
         const dayMax = _.maxBy(dayData, 'max')?.max || 0;

         mitja.data.push({
            name: `Day ${dayKey}`,
            y: dayAvg,
            drilldown: `D${monthStr[month]}_${dayKey}` // Enable drill-down to shifts
         });
         rang.data.push({
            name: `Day ${dayKey}`,
            high: dayMax,
            low: dayMin,
            drilldown: `DR${monthStr[month]}_${dayKey}`
         });
      });

      mitja.id = 'M' + monthStr[month];
      rang.id = 'R' + monthStr[month];
      chartData.series.push(rang);
      chartData.series.push(mitja);

      // Add shift-level drill-down data for each day
      orderedDays.forEach((dayKey) => {
         const dayData = dayGroups[dayKey];

         let shiftMitja = {
            type: 'column',
            name: 'Average by Shift',
            id: `D${monthStr[month]}_${dayKey}`,
            color: 'var(--accent)',
            data: [] as any[]
         };

         let shiftRang = {
            type: 'columnrange',
            name: 'Range by Shift',
            id: `DR${monthStr[month]}_${dayKey}`,
            color: 'var(--accent)',
            opacity: 0.6,
            data: [] as any[]
         };

         // Get unique shifts for this day and sort them
         const shifts = _.uniqBy(dayData, 'shift').map(d => d.shift).sort();

         shifts.forEach((shift) => {
            const shiftData = dayData.find((d: any) => d.shift === shift);
            if (shiftData) {
               shiftMitja.data.push({
                  name: shift,
                  y: shiftData.avg
               });
               shiftRang.data.push({
                  name: shift,
                  high: shiftData.max,
                  low: shiftData.min
               });
            }
         });

         chartData.series.push(shiftRang);
         chartData.series.push(shiftMitja);
      });
   };

   return chartData;
}

export const getLineDrilldown = async (line: string, year: number, session: any) => {
   let lineData: any = {};
   for await (const lineConf of session?.user.config.summary[line]) {
      lineData[lineConf.name] = await getChartDrilldown({
         line: line,
         name: lineConf.name,
         year: year
      }, session);
   }
   return lineData;
}

// Debug function to check shift data structure
export const getShiftDataSummary = async (filter: SummaryIface, db?: string) => {
   const data: any[] = await getSummaries(filter, ['-id'], db);
   const shiftSummary = {
      totalRecords: data.length,
      shifts: _.uniq(data.map(d => d.shift)).sort(),
      dateRange: {
         from: _.minBy(data, d => `${d.year}-${d.month}-${d.day}`),
         to: _.maxBy(data, d => `${d.year}-${d.month}-${d.day}`)
      },
      recordsByShift: _.countBy(data, 'shift'),
      sampleData: data.slice(0, 3)
   };
   console.log('Shift Data Summary:', shiftSummary);
   return shiftSummary;
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