import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export function Card({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-cave rounded-2xl border border-white/[0.06] p-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
