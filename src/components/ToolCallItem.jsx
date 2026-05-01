export default function ToolCallItem({ call }) {
  const { tool, input_summary, output_summary, pending } = call

  return (
    <div className="flex items-start gap-2 text-[11px] font-mono">
      {/* Tool icon */}
      <div className="flex-shrink-0 mt-0.5">
        {pending ? (
          <svg className="w-3 h-3 text-amber-400 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        ) : (
          <svg className="w-3 h-3 text-slate-500" viewBox="0 0 16 16" fill="currentColor">
            <path d="M9.5 3.5a.5.5 0 0 0-1 0V9H3.5a.5.5 0 0 0 0 1H9v5.5a.5.5 0 0 0 1 0V10h5.5a.5.5 0 0 0 0-1H10V3.5z" />
          </svg>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Tool name + input */}
        <div className="flex items-baseline gap-1.5 flex-wrap">
          <span className="text-amber-300/90 font-semibold">{tool}</span>
          {pending && <span className="text-[10px] text-amber-500/60 not-italic font-sans">calling...</span>}
        </div>
        <p className="text-slate-500 truncate" title={input_summary}>
          ↳ {input_summary}
        </p>

        {/* Result */}
        {output_summary && (
          <p className="text-slate-400 mt-0.5">
            ← {output_summary}
          </p>
        )}
      </div>
    </div>
  )
}
