import { dir } from 'i18next'
import { Footer } from '@/components/footer.components'
import { languages } from '@/app/i18n/settings'

export async function generateStaticParams() {
   return languages.map((lng) => ({ lng }))
}

export default function RootLayout({
   children,
   params: {
      lng
   }
}) {
   return (
      <html lang={lng} dir={dir(lng)}>
         <head />
         <body>
            {children}
         </body>
         <Footer lng={lng} />
      </html>
   )
}