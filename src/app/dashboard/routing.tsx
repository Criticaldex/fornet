'use client'
import Link from "next/link"
import { usePathname, useRouter } from 'next/navigation';
import { useState } from "react";

export function GetLines({ lines, line, setter }: any) {
   return (
      <>
         <label className="flex">
            <select value={`${line}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
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

export function GetNames({ names, name, setter }: any) {
   return (
      <>
         <label className="flex">
            <select value={`${name}`}
               className={'my-1 mx-2 py-2 px-5 rounded-md text-textColor font-bold border border-darkBlue bg-bgDark hover:bg-bgLight'}
               onChange={e => {
                  setter(e.target.value)
               }}>

               {names.map((name: any) => {
                  return <option key={name} value={`${name}`}>
                     {name}
                  </option>
               })}
            </select>
         </label>
      </>
   )
}