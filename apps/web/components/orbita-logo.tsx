import Image from 'next/image'

export function OrbitaLogo({ className = '' }: { className?: string }) {
  return (
    <Image
      src="/branding/orbita-logo.svg?v=planet-1"
      alt="Órbita"
      width={208}
      height={64}
      className={className}
      loading="eager"
    />
  )
}
