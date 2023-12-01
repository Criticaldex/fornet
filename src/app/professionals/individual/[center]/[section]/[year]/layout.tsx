import { GetLinksProfessionals } from "@/app/professionals/routing";
import { getProfessionalsList } from "@/services/professionals";

export default async function ProfessionalsChart({ children, params }: any) {
   const { center, section, year } = params;
   let filters = (center == 'all') ? { 'any': year, 'sector': section.replaceAll('_', ' ') } : { 'any': year, 'centre': center, 'sector': section.replaceAll('_', ' ') }
   const professionals = await getProfessionalsList(filters);

   return (
      <article>
         <hr className="w-11/12 m-auto mt-0 mb-2 border-b border-darkBlue" />
         <div className="flex items-stretch mx-2">
            <div className="basis-1/4">
               <GetLinksProfessionals
                  professionals={professionals}
               />
            </div>
            <div className="w-3/4">
               {children}
            </div>
         </div>
      </article>
   )
}