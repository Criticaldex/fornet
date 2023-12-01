import { getCenters } from "@/services/centros";
import { Totals } from "./totals";
import { UniversalsContainer } from "./universalsContainer"
import { SeleccioContainer } from "./seleccioContainer"
import { HiperContainer } from "./hiperContainer"
import { getHiper, getSeleccio, getTotalsIqf, getUniversals } from "@/services/iqfs";

export default async function LayoutDashboard({ children, params }: any) {
   const { year } = params
   const centros = await getCenters();
   const universals = await getUniversals(year, centros);
   const seleccio = await getSeleccio(year, centros);
   const hiper = await getHiper(year, centros);

   const iqfTotals = await getTotalsIqf(year, centros);

   return (
      <div className="min-h-fit">
         <Totals
            iqfTotals={iqfTotals}
         />
         {children}
         <UniversalsContainer
            year={year}
            centros={centros}
            universals={universals}
         />
         <HiperContainer
            year={year}
            centros={centros}
            hiper={hiper}
         />
         <SeleccioContainer
            year={year}
            centros={centros}
            seleccio={seleccio}
         />
      </div>
   );
}
