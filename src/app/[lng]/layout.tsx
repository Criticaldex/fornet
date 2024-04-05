import './globals.css'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import GetNav from './routing'
import { NextAuthProvider } from "./providers";
import { getSession } from "@/services/session"
import { dir } from 'i18next'
<<<<<<<< HEAD:src/app/layout.js
import { Footer } from '@/components/footer.components'
import { languages } from '@/app/i18n/settings'

========

const inter = Inter({ subsets: ['latin'] })
const languages = ['en', 'es', 'ca']

export async function generateStaticParams() {
   return languages.map((lng) => ({ lng }))
}
>>>>>>>> 69b39418c7761d8ffa59e866e59cb74114e70139:src/app/[lng]/layout.tsx

export async function generateStaticParams() {
   return languages.map((lng) => ({ lng }))
}

<<<<<<<< HEAD:src/app/layout.js
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
========
export default async function RootLayout({ children, params: {
   lng
} }: { children: React.ReactNode, params: any }) {
   const session = await getSession();
   return (
      <html lang={lng} dir={dir(lng)}>
         <body className={inter.className}>
>>>>>>>> 69b39418c7761d8ffa59e866e59cb74114e70139:src/app/[lng]/layout.tsx
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