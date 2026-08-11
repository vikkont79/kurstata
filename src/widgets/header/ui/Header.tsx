import Link from 'next/link'
import { getButtonClassName } from '@/shared/ui/button/Button'
import { ThemeToggle } from '@/widgets/header/ui/ThemeToggle'
import { AuthControls } from '@/features/auth'
import type { User } from '@/entities/user'

type HeaderProps = {
  title: string
  link: { href: string; label: string }
  className?: string
  user?: User | null
  openAuthOnMount?: boolean
  returnTo?: string
  resetToken?: string
  sessionError?: boolean
}

const Header = ({ title, link, className, user, openAuthOnMount, returnTo, resetToken, sessionError }: HeaderProps) => {
  return (
    <header className={`flex flex-col gap-3 md:flex-row md:items-center md:justify-between ${className ?? ''}`}>
      <div className="flex items-center justify-end gap-2 md:order-1">
        <ThemeToggle />
        <AuthControls
          userName={user?.name}
          openAuthOnMount={openAuthOnMount}
          returnTo={returnTo}
          resetToken={resetToken}
          sessionError={sessionError}
        />
      </div>
      <div className="flex items-center justify-between gap-3 md:flex-1">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{title}</h1>
        <Link href={link.href} className={getButtonClassName('primary')}>
          {link.label}
        </Link>
      </div>
    </header>
  )
}

export { Header }
