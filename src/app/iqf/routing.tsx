'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation';

export function GetLinksYears({ years }: any) {
   const pathname = usePathname();

   let links: object[] = [];
   years.map((label: any) => (
      links.push({
         label: label,
         route: `/iqf/${label}`
      })
   ))

   return (
      <div className="flex">
         {links.map(({ label, route }: any) => (
            <Link className={`my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(route) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`} key={route} href={route}>
               {label}
            </Link>
         ))}
      </div>
   )
}