export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-serif text-4xl text-gold tracking-tight">KŌDO</h1>
          <p className="text-dust text-sm font-sans mt-2 tracking-wide">Train with intention</p>
        </div>
        {children}
      </div>
    </div>
  )
}
