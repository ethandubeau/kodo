'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CalendarDays, Dumbbell, TrendingUp, BookOpen } from 'lucide-react'
import { cn } from '@/lib/cn'

const nav = [
  { href: '/planner',  label: 'Week',     icon: CalendarDays },
  { href: '/workout',  label: 'Workout',  icon: Dumbbell },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/library',  label: 'Library',  icon: BookOpen },
]

export function Sidebar() {
  const path = usePathname()
  return (
    <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-cave border-r border-white/[0.06] px-4 py-8 gap-1 sticky top-0">
      <div className="px-3 mb-8">
        <span className="font-serif text-2xl text-gold tracking-tight">KŌDO</span>
      </div>
      {nav.map(({ href, label, icon: Icon }) => {
        const active = path.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors',
              active
                ? 'bg-gold-dim text-gold'
                : 'text-dust hover:text-linen hover:bg-stone'
            )}
          >
            <Icon size={17} />
            {label}
          </Link>
        )
      })}
      <div className="mt-auto">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-sans transition-colors',
            path === '/settings' ? 'bg-gold-dim text-gold' : 'text-dust hover:text-linen hover:bg-stone'
          )}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
          </svg>
          Settings
        </Link>
      </div>
    </aside>
  )
}
