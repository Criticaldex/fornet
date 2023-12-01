import { getAdminTable, getYears } from "@/services/professionals";
import { AdminTable } from "./table";
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

   const professionals = await getAdminTable(year, center);

   return (
      <div className="flex flex-col">
         <AdminTable
            data={professionals}
            centers={centros}
            years={years}
         />
      </div >
   )
}