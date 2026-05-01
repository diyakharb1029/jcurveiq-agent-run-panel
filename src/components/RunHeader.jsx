const STATUS_CONFIG = {
  running: {
    label: 'Running',
    dot: 'bg-blue-400 animate-pulse',
    badge: 'bg-blue-950 text-blue-300 border-blue-800',
  },
  complete: {
    label: 'Complete',
    dot: 'bg-emerald-400',
    badge: 'bg-emerald-950 text-emerald-300 border-emerald-800',
  },
  failed: {
    label: 'Failed',
    dot: 'bg-red-400',
    badge: 'bg-red-950 text-red-300 border-red-800',
  },
}

function formatElapsed(secs) {
  if (secs < 60) return `${secs}s`
  return `${Math.floor(secs / 60)}m ${secs % 60}s`
}

function formatDuration(ms) {
  if (!ms) return null
  const s = Math.round(ms / 1000)
  if (s < 60) return `${s}s`
  return `${Math.floor(s / 60)}m ${s % 60}s`
}

export default function RunHeader({ run, elapsed, taskCount }) {
  const cfg = STATUS_CONFIG[run.status] ?? STATUS_CONFIG.running
  const isRunning = run.status === 'running'

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5">
      {/* Top row: status badge + timing */}
      <div className="flex items-center justify-between mb-3">
        <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-medium ${cfg.badge}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
          {cfg.label}
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-500">
          {isRunning && (
            <span className="font-mono">{formatElapsed(elapsed)}</span>
          )}
          {!isRunning && run.duration_ms && (
            <span className="font-mono text-slate-400">
              Completed in {formatDuration(run.duration_ms)}
            </span>
          )}
          {taskCount > 0 && (
            <span>{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Query */}
      <p className="text-slate-100 text-base font-medium leading-snug">
        {run.query}
      </p>

      {/* Run ID */}
      <p className="text-xs text-slate-600 mt-1.5 font-mono">{run.run_id}</p>
    </div>
  )
}
