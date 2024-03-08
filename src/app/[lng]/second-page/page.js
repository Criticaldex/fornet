import Link from 'next/link'
import { useTranslation } from '@/app/i18n'

export default async function Page({ params: { lng } }) {
   const { t } = await useTranslation(lng, 'second-page')
   return (
      <>
         <h1>{t('title')}</h1>
         <Link href={`/${lng}`}>
            {t('back-to-home')}
         </Link>
      </>
   )
}