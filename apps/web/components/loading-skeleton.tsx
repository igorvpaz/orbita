'use client'
import { useLanguage } from '@/components/language-provider'
import type { ReactNode } from 'react'
export function Skeleton({ className = '' }: { className?: string }) {
  return <span aria-hidden="true" className={`skeleton ${className}`} />
}
export function LoadingRegion({ children }: { children: ReactNode }) {
  const { t } = useLanguage()
  return (
    <div
      className="loading-skeleton"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only">{t('Carregando conteúdo…')}</span>
      <div aria-hidden="true">{children}</div>
    </div>
  )
}
export type SkeletonVariant =
  | 'catalog'
  | 'detail'
  | 'table'
  | 'orders'
  | 'dashboard'
  | 'form'
  | 'subscription'
  | 'install'
export function ContentSkeleton({
  variant = 'table',
}: {
  variant?: SkeletonVariant
}) {
  return (
    <LoadingRegion>
      {variant === 'catalog' ? (
        <>
          <div className="surface-card skeleton-unit">
            <div>
              <Skeleton className="sk-eyebrow" />
              <Skeleton className="sk-heading" />
              <Skeleton className="sk-copy" />
            </div>
            <Skeleton className="sk-select" />
          </div>
          <div className="skeleton-banner">
            <Skeleton className="sk-avatar" />
            <div>
              <Skeleton className="sk-heading" />
              <Skeleton className="sk-copy sk-wide" />
            </div>
          </div>
          <div className="skeleton-section-heading">
            <Skeleton className="sk-heading" />
            <Skeleton className="sk-badge" />
          </div>
          <div className="catalog-grid">
            {Array.from({ length: 6 }, (_, i) => (
              <div className="surface-card skeleton-catalog-card" key={i}>
                <Skeleton className="sk-art" />
                <div className="sk-card-body">
                  <Skeleton className="sk-eyebrow" />
                  <Skeleton className="sk-heading" />
                  <Skeleton className="sk-copy sk-wide" />
                  <Skeleton className="sk-copy" />
                  <div className="sk-card-footer">
                    <Skeleton className="sk-price" />
                    <Skeleton className="sk-badge" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : variant === 'detail' ? (
        <div className="surface-card skeleton-detail">
          <Skeleton className="sk-detail-art" />
          <div className="sk-detail-body">
            <Skeleton className="sk-eyebrow" />
            <Skeleton className="sk-title" />
            <Skeleton className="sk-copy sk-wide" />
            <Skeleton className="sk-copy sk-wide" />
            <Skeleton className="sk-copy" />
            <Skeleton className="sk-price" />
            <div className="sk-actions">
              <Skeleton className="sk-button" />
              <Skeleton className="sk-button" />
            </div>
          </div>
        </div>
      ) : variant === 'orders' ? (
        <div className="sk-order-list">
          {Array.from({ length: 3 }, (_, i) => (
            <div className="surface-card sk-order" key={i}>
              <div className="skeleton-section-heading">
                <Skeleton className="sk-heading" />
                <Skeleton className="sk-badge" />
              </div>
              <Skeleton className="sk-copy" />
            </div>
          ))}
        </div>
      ) : variant === 'dashboard' ? (
        <>
          <div className="sk-metrics">
            {Array.from({ length: 5 }, (_, i) => (
              <div className="surface-card sk-metric" key={i}>
                <Skeleton className="sk-copy" />
                <Skeleton className="sk-price" />
              </div>
            ))}
          </div>
          <ContentRows />
        </>
      ) : variant === 'subscription' || variant === 'install' ? (
        <div className="surface-card sk-subscription">
          <Skeleton className="sk-logo" />
          <Skeleton className="sk-title" />
          <Skeleton className="sk-copy sk-wide" />
          <Skeleton className="sk-copy" />
          {variant === 'subscription' ? (
            <div className="sk-benefits">
              {Array.from({ length: 3 }, (_, i) => (
                <Skeleton key={i} className="sk-copy" />
              ))}
            </div>
          ) : (
            <div className="sk-form-grid">
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i}>
                  <Skeleton className="sk-heading" />
                  <Skeleton className="sk-copy sk-wide" />
                  <Skeleton className="sk-copy" />
                </div>
              ))}
            </div>
          )}
          <Skeleton className="sk-button" />
        </div>
      ) : variant === 'form' ? (
        <>
          <div className="surface-card sk-form">
            <Skeleton className="sk-heading" />
            <div className="sk-form-grid">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i}>
                  <Skeleton className="sk-eyebrow" />
                  <Skeleton className="sk-input" />
                </div>
              ))}
            </div>
            <Skeleton className="sk-input sk-wide" />
          </div>
          <ContentRows />
        </>
      ) : (
        <ContentRows />
      )}
    </LoadingRegion>
  )
}
function ContentRows() {
  return (
    <div className="surface-card skeleton-table">
      <div className="skeleton-section-heading">
        <Skeleton className="sk-heading" />
        <Skeleton className="sk-select" />
      </div>
      {Array.from({ length: 5 }, (_, i) => (
        <div className="sk-table-row" key={i}>
          <Skeleton className="sk-avatar" />
          <div>
            <Skeleton className="sk-copy sk-wide" />
            <Skeleton className="sk-copy" />
          </div>
          <Skeleton className="sk-badge sk-desktop" />
          <Skeleton className="sk-button" />
        </div>
      ))}
    </div>
  )
}
export function PageSkeleton({
  variant = 'table',
  title,
}: {
  variant?: SkeletonVariant
  title?: string
}) {
  const { t } = useLanguage()
  return (
    <div className="admin-workspace">
      <header className="workspace-heading">
        <div>
          {title ? <h1>{t(title)}</h1> : <Skeleton className="sk-title" />}
          <Skeleton className="sk-copy" />
        </div>
        <Skeleton className="sk-button" />
      </header>
      <ContentSkeleton variant={variant} />
    </div>
  )
}
