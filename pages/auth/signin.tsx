import type { GetServerSidePropsContext, InferGetServerSidePropsType } from "next";
import { getCsrfToken } from "next-auth/react"
import '../signin.css'
import Image from 'next/image'
import { BiPlusMedical } from "react-icons/bi"
import Fornet from "../../public/fornet_color.svg";
import { Inter } from 'next/font/google'
const inter = Inter({
   subsets: ['latin'],
   variable: '--font-inter'
});

export default function SignIn({ csrfToken }: InferGetServerSidePropsType<typeof getServerSideProps>) {
   return (
      <main className={`${inter.variable} font-sans`}>
         <div className="bg-image"></div>
         <div className="title">
            <Fornet />
            <h1>ForNet</h1>
         </div>
         <section>
            <h1>SIGN IN</h1>
            <form method="post" action="/api/auth/callback/credentials">
               <input name="csrfToken" type="hidden" defaultValue={csrfToken} />
               <div>
                  <input name="email" type="email" placeholder="Email" required />
               </div>
               <div>
                  <input name="password" type="password" placeholder="Contrasenya" required />
               </div>
               <div>
                  <button type="submit">Entrar</button>
               </div>
            </form>
         </section>
      </main>
   )
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
   const csrfToken = await getCsrfToken(context)
   return {
      props: { csrfToken },
   }
}