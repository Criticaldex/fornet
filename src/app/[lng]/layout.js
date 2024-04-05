import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import GetNav from './routing'
import { NextAuthProvider } from "./providers";
import { getSession } from "@/services/session"
import { dir } from 'i18next'
import { Footer } from '@/components/footer.components'
import { languages } from '@/app/i18n/settings'


export async function generateStaticParams() {
   return languages.map((lng) => ({ lng }))
}

export default async function RootLayout({
   children,
   params: {
      lng
   }
}) {
   const session = await getSession();
   return (
      <html lang="en">
         <body>
            <GetNav
               session={session}
            />
            <NextAuthProvider>
               {children}
            </NextAuthProvider>
            <Analytics />
            <SpeedInsights />
         </body>
         <Footer lng={lng} />
      </html>
   )
}