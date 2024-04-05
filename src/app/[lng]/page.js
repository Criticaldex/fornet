import Image from 'next/image'
import { useTranslation } from '@/app/i18n'
import Link from 'next/link'
import { Footer } from '@/components/footer.components'

export default async function Home({ params: { lng } }) {
   const { t } = await useTranslation(lng)
   return (
      <>
         <main className="flex min-h-screen flex-col items-center justify-between p-24">
            <h1>{t('title')}</h1>
            <Link href={`/${lng}/second-page`}>
               {t('to-second-page')}
            </Link>
         </main>
         <Footer lng={lng} />0808
      </>
   )
}
