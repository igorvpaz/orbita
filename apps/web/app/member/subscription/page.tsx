import { serverTranslator } from '@/lib/i18n-server'
import { PremiumUpgrade } from '@/components/premium-upgrade'
export default async function SubscriptionPage() {
  const t = await serverTranslator()
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>{t('Minha assinatura')}</h1>
          <p>{t('Conheça o Premium e acompanhe sua solicitação.')}</p>
        </div>
      </header>
      <PremiumUpgrade />
    </div>
  )
}
