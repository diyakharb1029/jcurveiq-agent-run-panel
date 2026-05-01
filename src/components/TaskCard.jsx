import { useState } from 'react'
import ToolCallItem from './ToolCallItem'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS = {
  running: {
    icon: () => <SpinnerIcon />,
    label: 'Running',
    dot: 'bg-blue-400 animate-pulse',
    text: 'text-blue-300',
    ring: 'border-slate-800',
  },
  complete: {
    icon: () => <span className="text-emerald-400 text-sm">✓</span>,
    label: 'Complete',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    ring: 'border-slate-800',
  },
  failed: {
    icon: () => <span className="text-red-400 text-sm">✕</span>,
    label: 'Failed',
    dot: 'bg-red-400',
    text: 'text-red-300',
    ring: 'border-red-900/50',
  },
  cancelled: {
    icon: () => <span className="text-slate-400 text-xs">◎</span>,
    label: 'Skipped',
    dot: 'bg-slate-500',
    text: 'text-slate-400',
    ring: 'border-slate-800',
  },
}

function SpinnerIcon() {
  return (
    <svg className="w-3 h-3 text-blue-400 animate-spin" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  )
}

// ─── Quality score badge ──────────────────────────────────────────────────────
function QualityBadge({ score }) {
  if (score === null || score === undefined) return null
  const pct = Math.round(score * 100)
  const color = pct >= 90 ? 'text-emerald-400' : pct >= 75 ? 'text-yellow-400' : 'text-orange-400'
  return (
    <span className={`text-xs font-mono ${color} ml-1`} title="Quality score">
      {pct}%
    </span>
  )
}

// ─── Retry history badge ──────────────────────────────────────────────────────
function RetryBadge({ retryCount, statusHistory }) {
  if (retryCount === 0) return null
  // Find the failure + recovery in history
  const recovered = statusHistory.some(h => h.status === 'running' && statusHistory.some(h2 => h2.status === 'failed'))
  return (
    <span className="inline-flex items-center gap-1 text-[10px] bg-amber-950/50 text-amber-400 border border-amber-900/50 px-1.5 py-0.5 rounded-full ml-1">
      ↺ retried {retryCount}×
    </span>
  )
}

// ─── TaskCard ─────────────────────────────────────────────────────────────────
export default function TaskCard({ task, isGrouped = false }) {
  const [expanded, setExpanded] = useState(true)
  const [thoughtsOpen, setThoughtsOpen] = useState(false)

  if (!task) return null

  const cfg = STATUS[task.status] ?? STATUS.running
  const isStreaming = task.status === 'running' && task.latestOutput && !task.finalOutput
  const isCancelled = task.status === 'cancelled'
  const isFailed = task.status === 'failed'
  const hasOutput = task.latestOutput || task.finalOutput
  const hasTools = task.toolCalls.length > 0
  const hasThoughts = task.thoughts.length > 0

  // For cancelled: show a neutral, non-alarming message
  const cancelMessage =
    task.reason === 'sufficient_data'
      ? task.message ?? 'Coordinator had sufficient data from other tasks. This task was stopped early — results are not needed.'
      : task.message

  const base = isGrouped ? 'bg-slate-900/30 px-4 py-3' : 'rounded-xl border bg-slate-900/50 px-4 py-3'
  const borderColor = isFailed ? 'border-red-900/40' : 'border-slate-800'

  return (
    <div className={`${base} ${!isGrouped ? borderColor : ''} animate-fade-in`}>
      {/* Header row */}
      <div className="flex items-start gap-2.5">
        {/* Status icon */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5">
          {cfg.icon()}
        </div>

        {/* Label + agent */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium leading-snug ${
                isCancelled ? 'text-slate-500' : 'text-slate-200'
              }`}
            >
              {task.label}
            </span>
            <RetryBadge retryCount={task.retryCount} statusHistory={task.statusHistory} />
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {/* Agent pill */}
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
              {task.agent}
            </span>

            {/* Status label */}
            <span className={`text-[10px] font-medium ${cfg.text}`}>
              {isCancelled && task.reason === 'sufficient_data' ? 'Skipped — sufficient data' : cfg.label}
            </span>

            {/* Dependency info: show unresolved deps subtly */}
            {task.depends_on && task.depends_on.length > 0 && task.status === 'running' && (
              <span className="text-[10px] text-slate-600">
                depends on {task.depends_on.join(', ')}
              </span>
            )}

            {/* Quality score on final output */}
            {task.finalOutput && (
              <QualityBadge score={task.finalOutput.quality_score} />
            )}
          </div>
        </div>

        {/* Expand / collapse toggle — only if there's content to show */}
        {(hasTools || hasOutput || hasThoughts || isFailed || isCancelled) && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="text-slate-600 hover:text-slate-400 transition-colors p-0.5 flex-shrink-0"
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            <svg className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-0' : '-rotate-90'}`} viewBox="0 0 16 16" fill="currentColor">
              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
            </svg>
          </button>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-3 ml-7 space-y-3 animate-slide-down">
          {/* Cancelled reason — neutral framing */}
          {isCancelled && cancelMessage && (
            <div className="flex items-start gap-2 bg-slate-800/40 rounded-lg px-3 py-2">
              <span className="text-slate-500 text-xs mt-0.5">◈</span>
              <p className="text-xs text-slate-500 leading-relaxed">{cancelMessage}</p>
            </div>
          )}

          {/* Failure message */}
          {isFailed && task.error && (
            <div className="flex items-start gap-2 bg-red-950/20 rounded-lg px-3 py-2 border border-red-900/30">
              <span className="text-red-500 text-xs mt-0.5">!</span>
              <div>
                <p className="text-xs text-red-400 leading-relaxed">{task.error}</p>
                {task.retryCount === 0 && (
                  <p className="text-[10px] text-red-600 mt-0.5">This task failed and did not recover.</p>
                )}
              </div>
            </div>
          )}

          {/* Tool calls */}
          {hasTools && (
            <div className="space-y-1.5">
              {task.toolCalls.map((call, i) => (
                <ToolCallItem key={i} call={call} />
              ))}
            </div>
          )}

          {/* Agent thoughts (for task-specific thoughts) — toggleable */}
          {hasThoughts && (
            <div>
              <button
                onClick={() => setThoughtsOpen(o => !o)}
                className="text-[10px] text-slate-600 hover:text-slate-400 flex items-center gap-1 transition-colors"
              >
                <span className="text-violet-600">✦</span>
                Agent reasoning {thoughtsOpen ? '▴' : '▾'}
              </button>
              {thoughtsOpen && (
                <div className="mt-1.5 space-y-1 animate-slide-down">
                  {task.thoughts.map((t, i) => (
                    <p key={i} className="text-xs text-slate-500 italic leading-relaxed pl-3 border-l border-violet-800/40">
                      {t.thought}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Output display */}
          {hasOutput && (
            <OutputBlock
              content={task.latestOutput}
              isFinal={!!task.finalOutput}
              isStreaming={isStreaming}
            />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Output block ─────────────────────────────────────────────────────────────
function OutputBlock({ content, isFinal, isStreaming }) {
  if (!content) return null

  return (
    <div className={`rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
      isFinal
        ? 'bg-slate-800/60 text-slate-300'
        : 'bg-slate-800/30 text-slate-400'
    }`}>
      {/* Streaming label */}
      {isStreaming && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
          <span className="text-[10px] text-blue-400 uppercase tracking-wider font-medium">Streaming</span>
        </div>
      )}
      <p className="whitespace-pre-wrap break-words">
        {content}
        {/* Blinking cursor while streaming */}
        {isStreaming && (
          <span className="inline-block w-0.5 h-3 bg-slate-400 ml-0.5 animate-blink align-middle" />
        )}
      </p>
    </div>
  )
}
