'use client'
import Link from "next/link"

import { FaCapsules, FaBroadcastTower, FaHistory, FaChartBar } from "react-icons/fa"
import Image from 'next/image'

import { usePathname } from "next/navigation"
import { LogoutButton, ProfileButton } from "@/components/loginbuttons.component";
import { NextAuthProvider } from "@/app/providers";

export default function GetNav({ session }: any) {

   const pathname = usePathname();

   const callsCenters = ['Capsbe', 'Demo']

   const navTitlesIcons = [
      {
         label: 'Live',
         icon: FaBroadcastTower,
         route: '/live'
      },
      {
         label: 'History',
         icon: FaHistory,
         route: '/history'
      }
   ]

   const externalLinks = [
      {
         label: 'PowerBi',
         icon: FaChartBar,
         route: 'https://app.powerbi.com/groups/d8792594-3b20-4154-9892-77fe3e41f43e/reports/209d6e8f-97c1-4550-9518-8ab93ecf0c37/ea75936307d815500425?experience=power-bi'
      }
   ]

   return (
      <div className="fixed top-0 left-0 z-50 w-16 h-screen bg-bgNavGlobal pt-2 pr-3 pb-0 pl-0 hover:w-52 transition-all duration-500">
         <nav className="text-TextNav flex flex-col justify-between h-full overflow-hidden">
            <div>
               <Link href="/" className="text-accent text-xl font-bold grid grid-cols-[max-content_max-content] gap-x-4 mt-1 mb-7 mr-1 ml-2">
                  {/* <BsRepeat size={20} /> */}
                  <Image
                     className="text-accent"
                     src="/fornet_color.svg"
                     alt="ForNet Logo"
                     width={40}
                     height={40}
                  />
                  <span className="text-lg">ForNet</span>
               </Link>
               <div className="flex flex-col justify-between" id="lista">
                  {navTitlesIcons.map((navTI) => (
                     <Link key={navTI.route} href={navTI.route} className={`hover:text-accent pb-6 grid grid-cols-[max-content_max-content] place-items-center gap-x-4 pt-2 pr-0 pl-3 items-center ml-3
                     ${pathname?.includes(navTI.route) ? 'text-accent' : ''}`}>
                        <navTI.icon size={19} />
                        <span className="text-base">
                           {navTI.label}
                        </span>
                     </Link>
                  ))}
                  <hr className="my-4 ml-2 border-spacerNav" />
                  {externalLinks.map((navTI) => (
                     <Link key={navTI.label} href={navTI.route} rel="noopener noreferrer" target="_blank" className={`hover:text-accent pb-6 grid grid-cols-[max-content_max-content] place-items-cente gap-x-4 pt-2 pr-0  pl-3 items-center ml-3
                     ${pathname?.includes(navTI.route) ? 'text-accent' : ''}`}>
                        <navTI.icon size={19} />
                        <span className="text-base">
                           {navTI.label}
                        </span>
                     </Link>
                  ))}
               </div>
            </div>
            <div>
               <NextAuthProvider>
                  <div>
                     <ProfileButton />
                     <LogoutButton />
                  </div>
               </NextAuthProvider>
            </div>
         </nav>
      </div>
   )
}
