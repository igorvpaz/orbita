'use client'
import { ThemeToggle } from '@/components/theme-provider'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { OrbitaLogo } from '@/components/orbita-logo'
import { UiIcon } from '@/components/ui-icon'
import { LogoutButton } from '@/components/logout-button'
type NavItem = {
  label: string
  href: string
  icon:
    | 'dashboard'
    | 'partners'
    | 'services'
    | 'orders'
    | 'members'
    | 'crown'
    | 'download'
}
const navigation: NavItem[] = [
  { label: 'Visão geral', href: '/admin', icon: 'dashboard' as const },
  { label: 'Parceiros', href: '/admin/partners', icon: 'partners' as const },
  { label: 'Serviços', href: '/admin/services', icon: 'services' as const },
  { label: 'Pedidos', href: '/admin/orders', icon: 'orders' as const },
]
export function AdminShell({
  name,
  email,
  children,
  mode = 'admin',
}: {
  name: string
  email: string
  children: React.ReactNode
  mode?: 'admin' | 'member'
}) {
  const pathname = usePathname()
  const isMember = mode === 'member'
  const home = isMember ? '/member' : '/admin'
  const items: NavItem[] = isMember
    ? [
        {
          label: 'Descobrir serviços',
          href: '/member',
          icon: 'services',
        },
        {
          label: 'Meus pedidos',
          href: '/member/orders',
          icon: 'orders',
        },
        {
          label: 'Minha assinatura',
          href: '/member/subscription',
          icon: 'crown',
        },
        {
          label: 'Instalar aplicativo',
          href: '/member/install',
          icon: 'download',
        },
      ]
    : navigation
  const [open, setOpen] = useState(false)
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
  function navItem(item: NavItem) {
    const active =
      item.href === home
        ? pathname === item.href
        : pathname.startsWith(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setOpen(false)}
        className={`sidebar-link ${active ? 'is-active' : ''}`}
        aria-current={active ? 'page' : undefined}
      >
        <UiIcon name={item.icon} />
        <span>{item.label}</span>
      </Link>
    )
  }
  return (
    <div
      className="admin-shell"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false)
      }}
    >
      <div className="mobile-admin-bar">
        <Link href={home} aria-label="Órbita, início">
          <OrbitaLogo />
        </Link>
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          aria-expanded={open}
          aria-controls="admin-sidebar"
        >
          <UiIcon name={open ? 'close' : 'menu'} />
        </button>
      </div>
      {open && (
        <button
          className="sidebar-backdrop"
          aria-label="Fechar menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        id="admin-sidebar"
        className={`admin-sidebar ${open ? 'is-open' : ''}`}
      >
        <button
          className="sidebar-close"
          aria-label="Fechar navegação"
          onClick={() => setOpen(false)}
        >
          <UiIcon name="close" />
        </button>
        <Link href={home} className="sidebar-brand" aria-label="Órbita, início">
          <OrbitaLogo />
          <span>SEU ESPAÇO, MAIS POSSIBILIDADES.</span>
        </Link>
        <nav aria-label={isMember ? 'Área do membro' : 'Administração'}>
          <p className="sidebar-label">
            {isMember ? 'SUA EXPERIÊNCIA' : 'GESTÃO DO COWORKING'}
          </p>
          {items.map(navItem)}
          {!isMember && (
            <>
              <p className="sidebar-label admin-nav-label">ADMINISTRAÇÃO</p>
              {navItem({
                label: 'Membros',
                href: '/admin/members',
                icon: 'members',
              })}
              {navItem({
                label: 'Upgrades Premium',
                href: '/admin/upgrades',
                icon: 'crown',
              })}
            </>
          )}
        </nav>
        <div className="sidebar-account">
          <div className="sidebar-person">
            <span className="sidebar-avatar">{initials}</span>
            <div>
              <p>
                {name}
                <span className="admin-role">
                  {isMember ? 'MEMBRO' : 'ADMIN'}
                </span>
              </p>
              <span className="sidebar-email" title={email}>
                {email}
              </span>
            </div>
          </div>
          <div className="sidebar-locale">
            <ThemeToggle />
          </div>
          <LogoutButton label={'Sair da conta'} />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  )
}
