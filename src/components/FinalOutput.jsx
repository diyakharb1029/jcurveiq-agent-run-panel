// ─── Simple inline markdown renderer (bold + line breaks) ────────────────────
function renderMarkdown(text) {
  const lines = text.split('\n')
  return lines.map((line, li) => {
    const parts = []
    const re = /\*\*(.+?)\*\*/g
    let last = 0, m
    while ((m = re.exec(line)) !== null) {
      if (m.index > last) parts.push(line.slice(last, m.index))
      parts.push(<strong key={m.index} className="font-semibold text-slate-100">{m[1]}</strong>)
      last = m.index + m[0].length
    }
    if (last < line.length) parts.push(line.slice(last))
    return (
      <span key={li}>
        {parts.length > 0 ? parts : ' '}
        {li < lines.length - 1 && <br />}
      </span>
    )
  })
}

export default function FinalOutput({ output, durationMs, taskCount }) {
  if (!output) return null

  const { summary, citations = [] } = output

  function formatDuration(ms) {
    if (!ms) return null
    const s = Math.round(ms / 1000)
    return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`
  }

  return (
    <div className="rounded-xl border border-emerald-900/50 bg-gradient-to-b from-emerald-950/30 to-slate-900/60 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-emerald-900/30 bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 text-sm">✦</span>
          <span className="text-sm font-semibold text-emerald-300">Research Output</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-500">
          {taskCount && <span>{taskCount} tasks</span>}
          {durationMs && <span>{formatDuration(durationMs)}</span>}
        </div>
      </div>

      {/* Summary */}
      <div className="px-5 py-4">
        <p className="text-slate-200 text-sm leading-relaxed">
          {renderMarkdown(summary)}
        </p>
      </div>

      {/* Citations */}
      {citations.length > 0 && (
        <div className="px-5 pb-4">
          <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">
            Sources
          </p>
          <div className="flex flex-wrap gap-2">
            {citations.map((c) => (
              <CitationChip key={c.ref_id} citation={c} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function CitationChip({ citation }) {
  const { title, source, page } = citation
  return (
    <div className="flex items-center gap-1.5 text-[10px] bg-slate-800/60 border border-slate-700/50 rounded px-2 py-1 text-slate-400">
      <span className="text-slate-600">📄</span>
      <span>{title}</span>
      <span className="text-slate-600">·</span>
      <span className="text-slate-500">{source}</span>
      {page && <span className="text-slate-600">p. {page}</span>}
    </div>
  )
}
