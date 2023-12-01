import _ from "lodash"
import { getSession } from "@/services/session"

const getProfessionals = async (filter: any, db?: string) => {
   if (!db) {
      const session = await getSession();
      db = session?.user.db;
   }

   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/professionals`,
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

const getBaixesProfessionals = async (filter: any) => {

   filter.identificador = {
      $in: [
         "IT001OST",
         "IT001MEN",
         "IT001ALT",
         "IT003TOT",
      ]
   };
   delete filter.ordre;

   return await getProfessionals(filter);
}

export const updateProfessionals = async (data: any) => {
   return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/professionals`,
      {
         method: 'PATCH',
         headers: {
            'Content-type': 'application/json',
         },
         body: JSON.stringify(data),
      }).then(res => res.json());
}

export const getChartIndicators = async (filtros: any) => {
   const data = await getProfessionals(filtros);
   const profList = await getProfessionalsList(filtros);
   const month = await getMonth(filtros);
   let res: any = [];

   if (month.number != null) {
      let mes = month.number
      profList.forEach(prof => {
         let result: { name: string, data: any[] } = {
            name: prof,
            data: [],
         };
         data.forEach((indi: any) => {
            if (indi.professionals[prof] && indi.professionals[prof][mes]) {
               result.data.push(indi.professionals[prof][mes]);
            } else {
               result.data.push(null);
            }
         });
         res.push(result);
      });
      return res;
   } else {
      return null
   }
}

export const getTableIndicators = async (filtros: any) => {
   let data = await getProfessionals(filtros);
   data.map(async (indi: any) => {
      if (indi.indicador == 'Durada mitjana de les baixes-') {
         indi.subtaula = await getBaixesProfessionals(filtros)
      }
   });
   return data;
}

export const getSections = async (filtros: any) => {
   const data = await getProfessionals(filtros);
   let groupBySec = _.groupBy(data, 'sector');
   let sectors: string[] = [];
   for (const [key, value] of (Object.entries(groupBySec) as [string, any][])) {
      sectors.push(key);
   }
   return sectors;
}

export const getYears = async () => {
   const data = await getProfessionals({});
   let groupByYear = _.groupBy(data, 'any');
   let years: string[] = [];
   for (const [key, value] of (Object.entries(groupByYear) as [string, any][])) {
      years.push(key);
   }
   return years;
}

export const getProfessionalsList = async (filtros: any) => {
   const data = await getProfessionals(filtros);
   let prof: string[] = [];
   for (const [key, value] of (Object.entries(data) as [string, any][])) {
      for (const [key] of (Object.entries(value.professionals) as [string, any][])) {
         if (!prof.includes(key)) {
            prof.push(key);
         }
      }
   }
   return prof;
}

export const getCentre = async (professional: string) => {
   const data = await getProfessionals({});
   for (let i = 0; i < data.length; i++) {
      for (const [key, value] of (Object.entries(data[i].professionals) as [string, any][])) {
         if (key.includes(professional)) {
            return data[i].centre;
         }
      }
   }
}

export const getIndicators = async (filtros: any) => {
   const data = await getProfessionals(filtros);
   let indi: any = [];
   for (const [key, value] of (Object.entries(data) as [string, any][])) {
      indi.push({ 'name': value.indicador, 'obj': value.invers == false || value.invers == null ? value.objectiu : -value.objectiu });
   }
   return indi;
}

export const getChartIndividual = async (filtros: any, professional: string) => {
   const data = await getProfessionals(filtros);
   let chart: any[] = [];
   let item: { name: string, data: number[] };
   data.map((d: any, i: number) => {
      for (const [key, value] of (Object.entries(d.professionals) as [string, any][])) {
         if (key.includes(professional)) {
            chart.push({
               name: d.indicador,
               data: value
            })
         }
      }
   })
   return chart;
}

export const getMonth = async (filtros: any) => {
   const data = await getProfessionals(filtros);
   const meses = ['Gener', 'Febrer', 'Març', 'Abril', 'Maig', 'Juny', 'Juliol', 'Agost', 'Setembre', 'Octubre', 'Novembre', 'Desembre']
   let mes = data[0] != undefined ? data[0].professionals[Object.keys(data[0].professionals)[0]].length - 1 : null
   let strMes = mes == null ? null : meses[mes]
   const month = {
      number: mes,
      string: strMes
   }
   return month;
}

export const getAdminTable = async (year: string, center: string, db?: string) => {
   const filter: any = {
      any: year,
      centre: center
   };
   return await getProfessionals(filter, db);
}