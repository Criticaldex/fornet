'use client'
import Link from "next/link"

import { BiPlusMedical } from "react-icons/bi"
import { FaCapsules, FaUserNurse, FaPhoneAlt } from "react-icons/fa"
import { TbLayoutDashboard } from "react-icons/tb"
import { RiMedicineBottleLine } from "react-icons/ri"

import { usePathname } from "next/navigation"
import { LogoutButton, ProfileButton } from "@/components/loginbuttons.component";
import { NextAuthProvider } from "@/app/providers";

export default function GetNav({ session }: any) {

   const pathname = usePathname();

   const callsCenters = ['Capsbe', 'Demo']

   const navTitlesIcons = [
      {
         label: 'Dashboard',
         icon: TbLayoutDashboard,
         route: '/dashboard'
      },
      {
         label: 'Professionals',
         icon: FaUserNurse,
         route: '/professionals'
      }
   ]
   {
      callsCenters.includes(session?.user.db) &&
         navTitlesIcons.push(
            {
               label: 'Trucades',
               icon: FaPhoneAlt,
               route: '/calls'
            }
         )
   }

   const navTitlesIconsFarma = [
      {
         label: 'IQF',
         icon: FaCapsules,
         route: '/iqf'
      }
   ]

   return (
      <div className="fixed top-0 left-0 z-50 w-16 h-screen bg-bgNavGlobal pt-4 pr-3 pb-0 pl-0 hover:w-52 transition-all duration-500">
         <nav className="text-TextNav flex flex-col justify-between h-full overflow-hidden">
            <div>
               <Link href="/" className="text-yellowCustom text-xl font-bold grid grid-cols-[max-content_max-content] place-items-cente gap-x-4 pt-2 pr-0 pb-7 pl-3 ml-3">
                  <BiPlusMedical size={20} />
                  <span className="text-lg">CAPFA</span>
               </Link>
               <div className="flex flex-col justify-between" id="lista">
                  {navTitlesIcons.map((navTI) => (
                     <Link key={navTI.route} href={navTI.route} className={`hover:text-darkBlue pb-6 grid grid-cols-[max-content_max-content] place-items-center gap-x-4 pt-2 pr-0 pl-3 items-center ml-3
                     ${pathname?.includes(navTI.route) ? 'text-darkBlue' : ''}`}>
                        <navTI.icon size={19} />
                        <span className="text-base">
                           {navTI.label}
                        </span>
                     </Link>
                  ))}
                  <hr className="my-4 ml-2 border-spacerNav" />
                  <div className="text-yellowCustom text-lg font-bold grid grid-cols-[max-content_max-content] place-items-cente gap-x-4 pt-2 pr-0 pb-7 pl-3 ml-3">
                     <RiMedicineBottleLine size={20} />
                     <h3>
                        Farmàcia
                     </h3>
                  </div>
                  {navTitlesIconsFarma.map((navTI) => (
                     <Link key={navTI.label} href={navTI.route} className={`hover:text-darkBlue pb-6 grid grid-cols-[max-content_max-content] place-items-cente gap-x-4 pt-2 pr-0  pl-3 items-center ml-3
                     ${pathname?.includes(navTI.route) ? 'text-darkBlue' : ''}`}>
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
