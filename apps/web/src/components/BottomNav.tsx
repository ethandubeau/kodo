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

export function BottomNav() {
  const path = usePathname()
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-cave border-t border-white/[0.06] z-40 pb-safe">
      <div className="flex items-center justify-around px-2 pt-2 pb-3">
        {nav.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors min-w-[56px]',
                active ? 'text-gold' : 'text-dust'
              )}
            >
              <Icon size={22} strokeWidth={active ? 2 : 1.5} />
              <span className="text-[10px] uppercase tracking-widest font-sans">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
