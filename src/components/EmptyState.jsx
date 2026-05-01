export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      {/* Animated pipeline illustration */}
      <div className="flex items-end gap-1.5 mb-8">
        {[
          { h: 20, delay: '0ms', color: 'bg-indigo-500/40' },
          { h: 32, delay: '150ms', color: 'bg-indigo-400/50' },
          { h: 24, delay: '300ms', color: 'bg-violet-400/40' },
          { h: 40, delay: '450ms', color: 'bg-violet-500/50' },
          { h: 28, delay: '600ms', color: 'bg-indigo-400/40' },
          { h: 36, delay: '750ms', color: 'bg-indigo-300/30' },
          { h: 20, delay: '900ms', color: 'bg-violet-400/40' },
        ].map((bar, i) => (
          <div
            key={i}
            className={`w-1.5 rounded-full ${bar.color} animate-pulse`}
            style={{ height: bar.h, animationDelay: bar.delay }}
          />
        ))}
      </div>

      <h2 className="text-lg font-semibold text-slate-300 mb-2">
        No active run
      </h2>
      <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
        Select a fixture above to replay an agent run and watch the pipeline
        unfold in real time.
      </p>

      <div className="mt-8 grid grid-cols-3 gap-3 text-left max-w-sm">
        {[
          { icon: '⟲', label: 'Parallel tasks', desc: 'Multiple agents work concurrently' },
          { icon: '↺', label: 'Retry & recover', desc: 'Failed tasks resume automatically' },
          { icon: '◎', label: 'Smart cancel', desc: 'Skips tasks when data is sufficient' },
        ].map((f) => (
          <div key={f.label} className="bg-slate-900/60 border border-slate-800 rounded-lg p-3">
            <div className="text-lg mb-1.5">{f.icon}</div>
            <p className="text-xs font-medium text-slate-300 mb-0.5">{f.label}</p>
            <p className="text-[10px] text-slate-600 leading-tight">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
