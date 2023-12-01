import _ from "lodash"

const getIntervals = async (filter: any, sort?: any) => {

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/call_intervals`,
      {
         method: 'POST',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(
            {
               db: 'Capsbe',
               fields: [
                  "-_id"
               ],
               filter: filter,
               sort: sort
            }
         ),
      }).then(res => res.json());
}

export const getIntervalsDay = async (date: string, month: string, year: string, center: string) => {
   // const pad = '00';
   // const date = (pad + (new Date().getDate() - 1)).slice(-pad.length);
   // // const date = '18'
   // const month = (pad + (new Date().getMonth() + 1)).slice(-pad.length);
   // const year = new Date().getFullYear().toString();

   const filter = {
      "any": year, "mes": month, "dia": date, "centro": center, "interval": "Total"
   };
   const data = await getIntervals(filter);
   return data
}

export const getHoursChart = async (year: string, month: string, day: string, center: string) => {
   const filter = { "any": year, "mes": month, "dia": day, "centro": center, order: { "$lt": 25 } };
   const sort = "dia";
   const data: any = await getIntervals(filter, sort);
   let chartData: any = [{
      type: 'column',
      name: 'Contestades',
      color: "var(--green)",
      data: [],
      yAxis: 0
   }, {
      type: 'column',
      name: 'Abandonades',
      color: "var(--red)",
      data: [],
      yAxis: 0
   }, {
      type: 'spline',
      name: 'Operadors',
      color: "var(--lightBlue)",
      data: [],
      yAxis: 1
   }, {
      type: 'spline',
      name: 'Cua',
      color: "var(--orange)",
      data: [],
      yAxis: 1
   }];

   data.forEach((ele: any) => {
      let ans: number = 0;
      let aba: number = 0;
      ele.titulos.forEach((e: any, i: number) => {
         ans += ele.answered[i];
         aba -= ele.abandoned[i];
      });
      chartData[0].data.push({
         name: ele.interval.split(' ')[0],
         y: ans,
         drilldown: 'c' + ele.interval.split(' ')[0],
      });
      chartData[1].data.push({
         name: ele.interval.split(' ')[0],
         y: aba,
         drilldown: 'a' + ele.interval.split(' ')[0],
      });
      chartData[2].data.push({
         name: ele.interval.split(' ')[0],
         y: ele.ready
      });
      chartData[3].data.push({
         name: ele.interval.split(' ')[0],
         y: ele.cola
      });
   });
   return chartData;
}

export const getHoursDrilldown = async (year: string, month: string, day: string, center: string) => {
   const filter = { "any": year, "mes": month, "dia": day, "centro": center, order: { "$lt": 25 } };
   const sort = "dia";
   const data: any = await getIntervals(filter, sort);
   let chartData: any = {
      breadcrumbs: {
         position: {
            align: 'right'
         }
      },
      series: []
   };

   data.forEach((ele: any) => {
      let cSeries: any = {
         type: 'column',
         name: '',
         id: '',
         color: "var(--green)",
         data: []
      };
      let aSeries: any = {
         type: 'column',
         name: '',
         id: '',
         color: "var(--red)",
         data: []
      };
      cSeries.name = 'Contestades ' + ele.interval.split(' ')[0];
      cSeries.id = 'c' + ele.interval.split(' ')[0];
      aSeries.name = 'Abandonades ' + ele.interval.split(' ')[0];
      aSeries.id = 'a' + ele.interval.split(' ')[0];
      ele.titulos.forEach((e: any, i: number) => {
         cSeries.data.push([e, ele.answered[i]])
         aSeries.data.push([e, ele.abandoned[i]])
      });
      chartData.series.push(cSeries);
      chartData.series.push(aSeries);
   });
   return chartData;
}

export const getIntervalsChart = async (year: string, month: string, day: string, center: string) => {
   const filter = { "any": year, "mes": month, "dia": day, "centro": center, order: { "$lt": 25 } };
   const sort = "dia";
   const data: any = await getIntervals(filter, sort);
   let chartData: any = [{
      type: 'column',
      name: 'Contestades',
      color: "var(--green)",
      data: [],
   }, {
      type: 'column',
      name: 'Abandonades',
      color: "var(--red)",
      data: [],
   }];

   if (data[0]) {
      data[0].titulos.forEach((e: any, i: number) => {
         let ans: number = 0;
         let aba: number = 0;
         data.forEach((ele: any) => {
            ans += ele.answered[i];
            aba -= ele.abandoned[i];
         });
         chartData[0].data.push({
            name: e,
            y: ans,
            drilldown: 'c' + e,
         });
         chartData[1].data.push({
            name: e,
            y: aba,
            drilldown: 'a' + e,
         });
      });
   }
   return chartData;
}

export const getIntervalsDrilldown = async (year: string, month: string, day: string, center: string) => {
   const filter = { "any": year, "mes": month, "dia": day, "centro": center, order: { "$lt": 25 } };
   const sort = "dia";
   const data: any = await getIntervals(filter, sort);
   let chartData: any = {
      breadcrumbs: {
         position: {
            align: 'right'
         }
      },
      series: []
   };

   if (data[0]) {
      data[0].titulos.forEach((e: any, i: number) => {
         let cSeries: any = {
            type: 'column',
            name: '',
            id: '',
            color: "var(--green)",
            data: []
         };
         let aSeries: any = {
            type: 'column',
            name: '',
            id: '',
            color: "var(--red)",
            data: []
         };
         cSeries.name = 'Contestades ' + e;
         cSeries.id = 'c' + e;
         aSeries.name = 'Abandonades ' + e;
         aSeries.id = 'a' + e;
         data.forEach((ele: any, ind: number) => {
            cSeries.data.push([ele.interval.split(' ')[0], ele.answered[i]])
            aSeries.data.push([ele.interval.split(' ')[0], ele.abandoned[i]])
         });
         chartData.series.push(cSeries);
         chartData.series.push(aSeries);
      });
      return chartData;
   }
}
