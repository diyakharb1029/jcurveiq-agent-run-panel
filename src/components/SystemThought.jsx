import { useState } from 'react'

export default function SystemThought({ thought }) {
  // Coordinator thoughts are shown collapsed by default.
  // Users can expand to read the reasoning.
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex items-start gap-2 pl-1 animate-fade-in">
      {/* Timeline dot */}
      <div className="flex flex-col items-center pt-1.5">
        <div className="w-1.5 h-1.5 rounded-full bg-violet-500/60 mt-0.5" />
        <div className="w-px flex-1 bg-slate-800 mt-1" style={{ minHeight: 8 }} />
      </div>

      <div className="flex-1 min-w-0 pb-1">
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-400 transition-colors group"
        >
          <span className="text-violet-500/70">✦</span>
          <span className="font-medium">{thought.label ?? 'System'}</span>
          <span className="text-slate-600">thought</span>
          <span className="text-slate-700 group-hover:text-slate-500 transition-colors ml-0.5">
            {expanded ? '▴' : '▾'}
          </span>
        </button>

        {expanded && (
          <p className="text-xs text-slate-500 italic leading-relaxed mt-1 pl-0.5 animate-slide-down">
            {thought.thought}
          </p>
        )}
      </div>
    </div>
  )
}
