import RunHeader from './RunHeader'
import TaskList from './TaskList'
import FinalOutput from './FinalOutput'
import EmptyState from './EmptyState'
import SystemThought from './SystemThought'

export default function AgentRunPanel({ state, elapsed }) {
  const { run, tasks, taskOrder, systemThoughts, finalOutput } = state

  // No run started yet
  if (!run) {
    return <EmptyState />
  }

  // Group taskOrder into segments: sequential tasks and parallel groups
  const segments = buildSegments(taskOrder, tasks)

  return (
    <div className="space-y-4 animate-fade-in">
      <RunHeader run={run} elapsed={elapsed} taskCount={taskOrder.length} />

      {/* System-level coordinator thoughts */}
      {systemThoughts.length > 0 && (
        <div className="space-y-1">
          {systemThoughts.map((t, i) => (
            <SystemThought key={i} thought={t} />
          ))}
        </div>
      )}

      {/* Task list */}
      {taskOrder.length > 0 && (
        <TaskList segments={segments} tasks={tasks} />
      )}

      {/* Final output — the star of the show */}
      {finalOutput && run.status === 'complete' && (
        <FinalOutput output={finalOutput} durationMs={run.duration_ms} taskCount={taskOrder.length} />
      )}

      {/* Run error panel */}
      {run.status === 'failed' && run.error && (
        <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-5">
          <div className="flex items-start gap-3">
            <span className="text-red-400 text-lg mt-0.5">⚠</span>
            <div>
              <p className="text-sm font-semibold text-red-300 mb-1">Run terminated</p>
              <p className="text-sm text-red-400/80 leading-relaxed">{run.error}</p>
              {taskOrder.some(id => tasks[id]?.finalOutput) && (
                <p className="text-xs text-slate-500 mt-2">
                  Partial results from completed tasks are shown above.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Groups taskOrder into segments for rendering.
 * Consecutive tasks with the same parallel_group are grouped together.
 * Sequential tasks (parallel_group: null) each form their own segment.
 */
function buildSegments(taskOrder, tasks) {
  const segments = []
  let i = 0
  while (i < taskOrder.length) {
    const task = tasks[taskOrder[i]]
    if (!task) { i++; continue }

    if (task.parallel_group) {
      // Collect all consecutive tasks with same parallel_group
      const group = task.parallel_group
      const groupTasks = []
      while (i < taskOrder.length && tasks[taskOrder[i]]?.parallel_group === group) {
        groupTasks.push(taskOrder[i])
        i++
      }
      segments.push({ type: 'parallel', group, taskIds: groupTasks })
    } else {
      segments.push({ type: 'sequential', taskId: taskOrder[i] })
      i++
    }
  }
  return segments
}
