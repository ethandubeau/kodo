import { Sidebar } from '@/components/Sidebar'
import { BottomNav } from '@/components/BottomNav'
import { RestTimerOverlay } from '@/components/workout/RestTimerOverlay'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen pb-24 lg:pb-8 px-4 sm:px-6 lg:px-8 py-8 max-w-3xl mx-auto w-full">
        {children}
      </main>
      <BottomNav />
      <RestTimerOverlay />
    </div>
  )
}
