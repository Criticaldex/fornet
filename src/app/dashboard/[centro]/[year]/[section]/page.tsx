import { getTableIndicatorsNoCpr, getTableIndicatorsCpr, getTableIndicatorsGeneral } from "@/services/indicators";
import { DashboardTable } from "./table"
import { getCenters } from "@/services/centros";

export default async function Contracts({ params }: any) {
   const { year, section } = params;
   const centros = await getCenters();
   let indicadores: any = null;

   switch (section) {
      case 'cpr':
         indicadores = await getTableIndicatorsCpr(year);
         break;
      case 'nocpr':
         indicadores = await getTableIndicatorsNoCpr(year);
         break;
      default:
         indicadores = await getTableIndicatorsGeneral(year);
         break;
   }

   return (
      <DashboardTable
         data={indicadores}
         centros={centros}
      />
   )
}