'use client'
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation';

export function GetLines({ lines }: any) {
   const pathname = usePathname();
   const router = useRouter();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const line = (pathArray[2]) ? pathArray[2] : process.env.DASHBOARD_DEFAULT_LINE;
   const name = (pathArray[3]) ? pathArray[3] : process.env.DASHBOARD_DEFAULT_NAME;

   return (
      <>
         <label className="flex">
            <select value={`/dashboard/${line}/${name}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  router.push(e.target.value)
               }}>

               {lines.map((line: any) => {
                  return <option key={line} value={`/dashboard/${line}/${name}`}>
                     {line}
                  </option>
               })}
            </select>
         </label>
      </>
   )
}

export function GetNames({ names }: any) {
   const pathname = usePathname();
   const router = useRouter();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const line = (pathArray[2]) ? pathArray[2] : process.env.DASHBOARD_DEFAULT_LINE;
   const name = (pathArray[3]) ? pathArray[3] : process.env.DASHBOARD_DEFAULT_NAME;

   return (
      <>
         <label className="flex">
            <select value={`/dashboard/${line}/${name}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  router.push(e.target.value)
               }}>

               {names.map((name: any) => {
                  return <option key={name} value={`/dashboard/${line}/${name}`}>
                     {name}
                  </option>
               })}
            </select>
         </label>
      </>
   )
}