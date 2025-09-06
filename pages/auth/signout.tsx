import '../signin.css'
import { signOut } from "next-auth/react";
import Fornet from "../../public/fornet_color.svg";
import { Inter } from 'next/font/google'
const inter = Inter({
   subsets: ['latin'],
   variable: '--font-inter'
});

export default function SignOut() {

   return (
      <main className={`${inter.variable} font-sans`}>
         <div className="bg-image"></div>
         <div className="title">
            <Fornet />
            <h1>ForNet</h1>
         </div>
         <section>
            <h1>SIGN OUT</h1>
            <button className="hover:text-darkBlue py-2 grid grid-cols-[max-content_max-content] gap-x-4 pt-2 pr-0 pb-2 pl-3 items-center ml-3"
               onClick={() => signOut({ redirect: true, callbackUrl: "/" })}>
               <span className="text-lg">
                  Sortir
               </span>
            </button>
         </section>
      </main>
   )
}