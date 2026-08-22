import Link from 'next/link'
import Image from 'next/image'
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
    <header className={`flex flex-col gap-3 md:flex-row md:items-center md:gap-6 ${className ?? ''}`}>
      <nav aria-label="Основная навигация" className="flex items-center justify-between gap-3 md:contents">
        <Link href="/" aria-label="На главную" className="shrink-0 md:order-1 md:mr-auto">
          <Image
            src="/logo.png"
            alt="KurStata"
            width={139}
            height={30}
            priority
            className="block h-7 w-auto dark:hidden"
          />
          <Image
            src="/logo-dark.png"
            alt="KurStata"
            width={139}
            height={30}
            className="hidden h-7 w-auto dark:block"
          />
        </Link>
        <Link href={link.href} className={`${getButtonClassName('primary')} md:order-3`}>
          {link.label}
        </Link>
      </nav>

      <div className="flex flex-1 items-center justify-between gap-3 md:contents">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 md:order-2">{title}</h1>
        <div className="flex items-center gap-2 md:order-4">
          <ThemeToggle />
          <AuthControls
            userName={user?.name}
            openAuthOnMount={openAuthOnMount}
            returnTo={returnTo}
            resetToken={resetToken}
            sessionError={sessionError}
          />
        </div>
      </div>
    </header>
  )
}

export { Header }
