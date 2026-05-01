import TaskCard from './TaskCard'

export default function ParallelGroup({ group, taskIds, tasks }) {
  const groupTasks = taskIds.map(id => tasks[id]).filter(Boolean)
  const runningCount = groupTasks.filter(t => t.status === 'running').length
  const completeCount = groupTasks.filter(t => t.status === 'complete').length

  return (
    <div className="rounded-xl border border-slate-700/50 overflow-hidden animate-fade-in">
      {/* Parallel group header */}
      <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/60 border-b border-slate-700/50">
        {/* Parallel lanes icon */}
        <div className="flex gap-0.5 items-end h-3">
          {[4, 7, 5].map((h, i) => (
            <div key={i} className="w-0.5 rounded-sm bg-indigo-400/70" style={{ height: h }} />
          ))}
        </div>
        <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
          Parallel group
        </span>
        <span className="text-xs text-slate-500">
          {taskIds.length} agents running concurrently
        </span>
        <div className="ml-auto flex items-center gap-2 text-xs text-slate-500">
          {runningCount > 0 && (
            <span className="text-blue-400">{runningCount} running</span>
          )}
          {completeCount > 0 && (
            <span className="text-emerald-400">{completeCount} done</span>
          )}
        </div>
      </div>

      {/* Task cards inside the group — indented with a left accent */}
      <div className="divide-y divide-slate-800/50">
        {groupTasks.map(task => (
          <div key={task.task_id} className="border-l-2 border-indigo-600/40">
            <TaskCard task={task} isGrouped />
          </div>
        ))}
      </div>
    </div>
  )
}
