'use client'
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation'

export function GetLinksYears({ years }: any) {
   const pathname = usePathname();
   const router = useRouter();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const up = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;
   const any = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_YEAR;

   return (
      <>
         <label>
            Any:{' '}
            <select value={`/admin/professionals/${up}/${any}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  router.push(e.target.value)
               }}>

               {years.map((year: any) => {
                  return <option key={year} value={`/admin/professionals/${up}/${year}`}>
                     {year}
                  </option>
               })}
            </select>
         </label>
      </>
   );
}

export function GetLinksCenters({ centros }: any) {
   const pathname = usePathname();
   const router = useRouter();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const up = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;
   const year = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_YEAR;

   return (
      <>
         <label>
            Centre:{' '}
            <select value={`/admin/professionals/${up}/${year}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  router.push(e.target.value)
               }}>

               {centros.map((centro: any) => {
                  return <option key={centro.id} value={`/admin/professionals/${centro.id}/${year}`}>
                     {centro.name}
                  </option>
               })}
            </select>
         </label>
      </>
   );
}