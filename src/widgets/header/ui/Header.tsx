import Link from 'next/link'
import { getButtonClassName } from '@/shared/ui/button/Button'

type HeaderProps = {
  title: string
  link: { href: string; label: string }
  className?: string
}

const Header = ({ title, link, className }: HeaderProps) => {
  return (
    <header className={`flex items-center justify-between ${className ?? ''}`}>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <Link href={link.href} className={getButtonClassName('primary')}>
        {link.label}
      </Link>
    </header>
  )
}

export { Header }
