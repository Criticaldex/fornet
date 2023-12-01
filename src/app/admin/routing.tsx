'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation';

export function GetLinksAdmin({ session }: any) {
   const pathname = usePathname();
   // const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   // const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;

   let links: object[] = [
      {
         label: 'Perfil',
         route: `/admin/profile`
      }
   ];

   if (session?.user.role != "2") {
      links.push(
         {
            label: 'Quadre Comandament',
            route: `/admin/dashboard`
         },
         {
            label: 'Professionals',
            route: `/admin/professionals`
         }
      )
   }

   if (session?.user.role == "0") {
      links.push({
         label: 'Usuaris',
         route: `/admin/users`
      })
   }

   return (
      <div className="flex justify-start mr-3 my-2">
         {links.map(({ label, route }: any) => (
            <Link className={`my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(route) ? 'bg-darkBlue text-textColor' : 'bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40'}`} key={route} href={route}>
               {label}
            </Link>
         ))}
      </div>
   )
}