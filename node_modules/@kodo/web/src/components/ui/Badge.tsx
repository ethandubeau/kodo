import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

type BadgeVariant = 'gold' | 'cenote' | 'muted'

const variants: Record<BadgeVariant, string> = {
  gold:   'bg-gold-dim text-gold border-gold/20',
  cenote: 'bg-jungle text-cenote border-cenote/20',
  muted:  'bg-stone text-dust border-white/[0.06]',
}

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

export function Badge({ className, variant = 'muted', children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-widest border font-sans',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
