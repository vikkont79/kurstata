import Link from 'next/link'
import { getButtonClassName } from '@/shared/ui/button/Button'
import { ThemeToggle } from '@/widgets/header/ui/ThemeToggle'
import { AuthControls } from '@/features/auth'

type HeaderProps = {
  title: string
  link: { href: string; label: string }
  className?: string
  user?: { name: string } | null
  openAuthOnMount?: boolean
}

const Header = ({ title, link, className, user, openAuthOnMount }: HeaderProps) => {
  return (
    <header className={`flex items-center justify-between ${className ?? ''}`}>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <AuthControls userName={user?.name} openAuthOnMount={openAuthOnMount} />
        <Link href={link.href} className={getButtonClassName('primary')}>
          {link.label}
        </Link>
      </div>
    </header>
  )
}

export { Header }
