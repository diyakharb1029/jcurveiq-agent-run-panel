import TaskCard from './TaskCard'
import ParallelGroup from './ParallelGroup'

export default function TaskList({ segments, tasks }) {
  return (
    <div className="space-y-2">
      {segments.map((seg, i) => {
        if (seg.type === 'parallel') {
          return (
            <ParallelGroup
              key={seg.group}
              group={seg.group}
              taskIds={seg.taskIds}
              tasks={tasks}
            />
          )
        }
        return (
          <TaskCard key={seg.taskId} task={tasks[seg.taskId]} />
        )
      })}
    </div>
  )
}
