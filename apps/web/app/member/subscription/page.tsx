import { PremiumUpgrade } from '@/components/premium-upgrade'
export default async function SubscriptionPage() {
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          <h1>{'Minha assinatura'}</h1>
          <p>{'Conheça o Premium e acompanhe sua solicitação.'}</p>
        </div>
      </header>
      <PremiumUpgrade />
    </div>
  )
}
