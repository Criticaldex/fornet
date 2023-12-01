'use client'
import Link from "next/link"
import { usePathname } from 'next/navigation';
import React, { useEffect } from "react";

export function GetLinksView() {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;
   const section = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_SECTION;

   const links = [
      {
         label: 'Global',
         route: `/professionals/global/${center}/${section}`
      },
      {
         label: 'Individual',
         route: `/professionals/individual/${center}/${section}`
      }
   ]

   return (
      <div className="flex" >
         {links.map((view: any, i: number) => (
            <Link href={view.route} key={i} className={`my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(view.route) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`}>
               {view.label}
            </Link>
         ))}
      </div>
   )
}

export function GetLinksCentro({ centros }: any) {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const view = (pathArray[2]) ? pathArray[2] : process.env.PROFESSIONALS_DEFAULT_VIEW;
   const section = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_SECTION;

   let links: any = [];

   centros.map(({ id, name }: any) => (
      links.push({
         label: name,
         route: `/professionals/${view}/${id}/${section}`
      })
   ))

   return (
      <div className="flex" >
         {links.map((centro: any, i: number) => (
            <Link href={centro.route} key={i} className={`my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(centro.route) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`}>
               {centro.label}
            </Link>
         ))}
      </div>
   )
}

export function GetLinksSection({ sections }: any) {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const view = (pathArray[2]) ? pathArray[2] : process.env.PROFESSIONALS_DEFAULT_VIEW;
   const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;

   let links: object[] = [];
   sections.map((label: any) => (
      links.push({
         label: label,
         route: `/professionals/${view}/${center}/${label.replaceAll(' ', '_')}`
      })
   ))
   useEffect(() => {
      let coincidencia = links.filter((link: any) => pathname?.includes(link.route))
      if (coincidencia.length == 0)
         document.getElementById('secciones')?.getElementsByTagName('a')[0].click()
   }, []);

   return (
      <div id="secciones" className="flex" >
         {links.map((section: any, i: number) => (
            <Link href={section.route} key={i} className={`grow my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(section.route) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`}>
               {section.label}
            </Link>
         ))}
      </div>
   )
}

export function GetLinksYears({ years }: any) {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const view = (pathArray[2]) ? pathArray[2] : process.env.PROFESSIONALS_DEFAULT_VIEW;
   const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;
   const section = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_SECTION;
   const professional = (pathArray[6]) ? pathArray[6] : '';

   let links: object[] = [];
   years.map((label: any) => (
      links.push({
         label: label,
         route: `/professionals/${view}/${center}/${section}/${label}/${professional}`
      })
   ))

   return (
      <div className="flex" >
         {view == 'individual' &&
            links.map((year: any, i: number) => (
               <Link href={year.route} key={i} className={`my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue
            ${pathname?.includes(year.label) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`}>
                  {year.label}
               </Link>
            ))
         }
      </div>
   )
}

export function GetLinksProfessionals({ professionals }: any) {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const view = (pathArray[2]) ? pathArray[2] : process.env.PROFESSIONALS_DEFAULT_VIEW;
   const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;
   const section = (pathArray[4]) ? pathArray[4] : process.env.PROFESSIONALS_DEFAULT_SECTION;
   const year = (pathArray[5]) ? pathArray[5] : process.env.PROFESSIONALS_DEFAULT_YEAR;

   let links: object[] = [];
   professionals.map((label: any) => (
      links.push({
         label: label,
         code: label.split('(').pop().split(')')[0],
         route: `/professionals/${view}/${center}/${section}/${year}/${label.split('(').pop().split(')')[0]}`
      })
   ))

   return (
      <ul id="scrollDiv" className="overflow-y-scroll h-[41rem] bg-bgDark rounded-md">
         {links.map(({ label, code, route }: any) => (
            <Link className="w-full rounded-md text-textColor" key={route} href={route}>
               <li className={`rounded-md  border-darkBlue mx-3 py-4 px-3 text-textColor ${pathname?.includes(code) ? 'bg-darkBlue text-textColor' : 'bg-bgDark hover:bg-bgLight'}`}>
                  {label}
               </li>
            </Link>
         ))}
      </ul>
   )
}

export function GetCenter({ centros }: any) {
   const pathname = usePathname();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const center = (pathArray[3]) ? pathArray[3] : process.env.PROFESSIONALS_DEFAULT_CENTER;

   var centro = 'Tots';

   if (center != 'all') {
      centros.forEach((element: any) => {
         if (element.id == center) centro = element.name
      });
   }

   return (
      <h1 className="right-0 w-auto mr-10 font-semibold text-2xl italic">{centro}</h1>
   )
}