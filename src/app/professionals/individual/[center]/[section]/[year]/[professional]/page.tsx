import { getCentre, getChartIndividual, getMonth, getProfessionalsList, getTableIndicators } from "@/services/professionals";
import { getCenters } from "@/services/centros";
import { Chart } from "./chart";
import { ProfessionalsTable } from "./table";

async function professionalName(professionals: string[], professional: string) {
   for (let index = 0; index < professionals.length; index++) {
      if (professionals[index].includes(professional)) {
         return professionals[index];
      }
   }
}

async function centerName(professional: string) {
   const centreProf = await getCentre(professional);
   const centres = await getCenters();

   for (let index = 0; index < centres.length; index++) {
      if (centres[index].id == centreProf) {
         return centres[index].name;
      }
   }
}

export default async function ProfessionalsChart({ params }: any) {
   const { center, section, year, professional } = params;

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
   const professionals = await getProfessionalsList(filters);
   const infoChart = await getChartIndividual(filters, professional);
   const infoTable = await getTableIndicators(filters);

   let profName = await professionalName(professionals, professional);
   const chartName = await professionalName(professionals, professional) + ' - ' + await centerName(professional);
   const month = await getMonth(filters)

   return (
      <div className="h-[41rem]">
         <Chart
            name={chartName}
            data={infoChart}
         />
         <ProfessionalsTable
            data={infoTable}
            professional={profName}
            month={month.number}
         />
      </div>
   )
}