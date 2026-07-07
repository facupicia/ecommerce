export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)] p-4 relative overflow-hidden">
      {/* Background sutil */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, var(--color-fg) 0%, transparent 60%), radial-gradient(circle at 80% 70%, var(--color-fg) 0%, transparent 60%)",
        }}
        aria-hidden
      />

      <div className="w-full max-w-sm relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-[var(--radius)] bg-[var(--color-fg)] mb-5">
            <span className="text-[var(--color-fg-inverse)] text-sm font-bold tracking-tight">
              pl
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-fg)]">
            Admin
          </h1>
          <p className="text-sm text-[var(--color-fg-muted)] mt-1">
            Ingresá la contraseña para continuar.
          </p>
        </div>

        {children}
      </div>
    </div>
  );
}
