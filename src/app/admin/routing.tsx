'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation';

export function GetLinksAdmin({ session }: any) {
   const pathname = usePathname();

   let links: object[] = [
      {
         label: 'Profile',
         route: `/admin/profile`
      },
      {
         label: 'Users',
         route: `/admin/users`
      },
      {
         label: 'Sensors',
         route: `/admin/sensors`
      },
      {
         label: 'PLCs',
         route: `/admin/plcs`
      },
      {
         label: 'Shifts',
         route: `/admin/shifts`
      },
      {
         label: 'Logs',
         route: `/admin/logs`
      },
      {
         label: 'PowerBi',
         route: `/admin/powerBi`
      }
   ];
   if (session?.user.role == 2) {
      links = [
         {
            label: 'Profile',
            route: `/admin/profile`
         }
      ];
   }

   return (
      <div className="flex justify-start mr-3 my-2">
         {links.map(({ label, route }: any) => (
            <Link className={`my-1 mx-4 py-2 px-5 rounded-md text-textColor font-bold border border-accent
            ${pathname?.includes(route) ? 'bg-accent text-textColor' : 'bg-bgDark bg-opacity-20 dark:bg-opacity-80 hover:bg-opacity-40'}`} key={route} href={route}>
               {label}
            </Link>
         ))}
      </div>
   )
}