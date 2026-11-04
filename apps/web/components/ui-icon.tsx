export function UiIcon({
  name,
  className = '',
}: {
  name:
    | 'dashboard'
    | 'partners'
    | 'services'
    | 'members'
    | 'orders'
    | 'search'
    | 'logout'
    | 'menu'
    | 'close'
    | 'refresh'
    | 'plus'
    | 'crown'
    | 'download'
    | 'lock'
    | 'clock'
  className?: string
}) {
  const paths = {
    dashboard: (
      <>
        <path d="M4 13h6v7H4zM14 4h6v16h-6zM4 4h6v5H4z" />
      </>
    ),
    partners: (
      <>
        <path d="m8 12 3 3a2 2 0 0 0 3 0l5-5M3 7l5-3 4 3 4-3 5 3-2 9-5 4-4-2-4-4z" />
        <path d="m12 7-3 3 2 2 3-2" />
      </>
    ),
    services: (
      <>
        <rect x="4" y="6" width="16" height="15" rx="2" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M4 11h16M10 10v3h4v-3" />
      </>
    ),
    members: (
      <>
        <circle cx="9" cy="7" r="3" />
        <path d="M3 21v-3a6 6 0 0 1 12 0v3M16 4a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5v2" />
      </>
    ),
    orders: (
      <>
        <path d="M7 4H5v17h14V4h-2M9 10h6M9 15h6" />
        <rect x="8" y="2" width="8" height="4" rx="1" />
      </>
    ),
    search: (
      <>
        <circle cx="10" cy="10" r="6" />
        <path d="m15 15 5 5" />
      </>
    ),
    logout: (
      <>
        <path d="M10 4H4v16h6M9 12h12m-5-5 5 5-5 5" />
      </>
    ),
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    refresh: (
      <>
        <path d="M3 11a9 9 0 0 1 15.36-6.36L21 7" />
        <path d="M21 3v4h-4M21 13a9 9 0 0 1-15.36 6.36L3 17M7 17H3v4" />
      </>
    ),
    crown: (
      <>
        <path d="m3 6 4 4 5-7 5 7 4-4-2 13H5zM5 22h14" />
      </>
    ),
    download: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="10" width="16" height="12" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4M12 15v3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    plus: <path d="M12 4v16M4 12h16" />,
  }
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`ui-icon ${className}`}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}
