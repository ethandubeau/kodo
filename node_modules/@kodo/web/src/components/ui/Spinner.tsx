import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn('animate-spin h-5 w-5 text-dust', className)}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Spinner className="h-7 w-7" />
    </div>
  )
}
