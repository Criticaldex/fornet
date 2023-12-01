import { getAdminTable } from "@/services/indicators";
import { AdminTable } from "./table";
import { getYears } from "@/services/indicators";
import { getCenters } from "@/services/centros";

export default async function AdminDashboard({ params }: any) {
   const { year, center } = params;
   let up: string = '';
   let nameCentro: string = '';
   const centros = await getCenters();
   const years = await getYears();
   centros.map((centro: any) => {
      if (centro.id == center) {
         up = centro.up
         nameCentro = centro.name
      }
   })

   const indicadores = await getAdminTable(year, center);

   return (
      <div className="flex flex-col">
         <AdminTable
            data={indicadores}
            centers={centros}
            years={years}
         />
      </div >
   )
}