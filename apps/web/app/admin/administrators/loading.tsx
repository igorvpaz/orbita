import { serverTranslator } from '@/lib/i18n-server'
import { PageSkeleton } from '@/components/loading-skeleton'
export default async function Loading() {
  const t = await serverTranslator()
  return <PageSkeleton title={t('Administradores')} variant="form" />
}
