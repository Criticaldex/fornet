import { getChartIndicators, getIndicators, getMonth, getProfessionalsList, getSections, getTableIndicators } from "@/services/professionals";
import { Chart } from "./chart";
import { ProfessionalsTable } from "./table";

export default async function ProfessionalsChart({ params }: any) {
   const { center, section } = params;

   const date = new Date();
   let year = date.getFullYear().toString();
   let filters = {
      any: year,
      centre: center,
      sector: section.replaceAll('_', ' '),
      ordre: { $gt: 0 },
      identificador: {
         $nin: [
            "IT001OST",
            "IT001MEN",
            "IT001ALT",
            "IT003TOT",
         ]
      }
   }

   const indicadors = await getIndicators(filters);
   const infoChart = await getChartIndicators(filters);
   const infoTable = await getTableIndicators(filters);
   const professionals = await getProfessionalsList(filters);
   const month = await getMonth(filters);

   const indicadorsNames = indicadors.map((ind: any) => ind.name)
   const indicadorsObj = indicadors.map((ind: any) => ind.obj)

   return (
      <article>
         <hr className="w-11/12 m-auto mt-0 mb-2 border-b border-darkBlue" />
         <div className="mx-2">
            <div className="mb-2">
               {month.number != null ?
                  <Chart
                     name={month.string + ' ' + year}
                     data={infoChart}
                     index={indicadorsNames}
                     objectius={indicadorsObj}
                  />
                  :
                  ''
               }
            </div>
            <ProfessionalsTable
               data={infoTable}
               professionals={professionals}
               month={month.number}
            />
         </div>
      </article>
   )
}