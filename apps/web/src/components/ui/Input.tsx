import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  suffix?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, suffix, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[10px] uppercase tracking-widest text-dust font-sans">
            {label}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full bg-pit text-linen placeholder-dust rounded-xl px-4 py-3 font-sans text-sm',
              'border border-white/[0.06] focus:outline-none focus:border-gold/40 transition-colors',
              suffix && 'pr-14',
              error && 'border-red-400/40',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dust text-xs font-sans">
              {suffix}
            </span>
          )}
        </div>
        {error && <p className="text-red-400 text-xs font-sans">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'
