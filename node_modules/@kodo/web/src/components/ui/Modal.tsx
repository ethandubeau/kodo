'use client'
import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  className?: string
}

export function Modal({ open, onClose, title, children, className }: ModalProps) {
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-cave border border-white/[0.06] rounded-2xl w-full max-w-md shadow-2xl',
          'animate-in fade-in slide-in-from-bottom-4 duration-200',
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-white/[0.06]">
            <h2 className="font-serif text-lg text-linen tracking-tight">{title}</h2>
            <button onClick={onClose} className="text-dust hover:text-linen transition-colors p-1">
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}
