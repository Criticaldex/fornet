'use client'
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation';
import { useState } from "react";

export function GetLines({ lines, line, setter }: any) {
   return (
      <>
         <label className="flex">
            <select value={`${line}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  setter(e.target.value)
               }}>

               {lines.map((line: any) => {
                  return <option key={line} value={`${line}`}>
                     {line}
                  </option>
               })}
            </select>
         </label>
      </>
   )
}

export function GetNames({ names, units, name, setter, setUnit }: any) {
   return (
      <>
         <label className="flex">
            <select value={`${name}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  setter(e.target.value)
                  setUnit(units[e.target.selectedIndex])
               }}>

               {names.map((name: any, i: number) => {
                  return <option key={i} value={`${name}`} tabIndex={i}>
                     {name}
                  </option>
               })}
            </select>
         </label>
      </>
   )
}

export function GetLinksYears({ years }: any) {
   const pathname = usePathname();
   const router = useRouter();
   const pathArray: string[] = (pathname) ? pathname.split('/') : [];
   const year = (pathArray[2]) ? pathArray[2] : process.env.SUMMARY_DEFAULT_YEAR;
   return (
      <>
         <select value={`/live/${year}`}
            className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-accent bg-bgDark hover:bg-bgLight'}
            onChange={e => {
               router.push(e.target.value)
            }}>

            {years.map((year: any) => {
               return <option key={year} value={`/live/${year}`}>
                  {year}
               </option>
            })}
         </select>
      </>
   )
}