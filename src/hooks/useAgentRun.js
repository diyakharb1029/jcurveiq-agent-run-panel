import { useReducer, useEffect, useRef, useState } from 'react'
import { MockEmitter } from '../../mock/emitter'

// ─── Initial state ────────────────────────────────────────────────────────────
const INITIAL_STATE = {
  run: null,
  tasks: {},
  taskOrder: [],
  systemThoughts: [],
  finalOutput: null,
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
function reducer(state, action) {
  const { event } = action

  switch (event.type) {
    case '_reset':
      return INITIAL_STATE

    case 'run_started': {
      return {
        ...INITIAL_STATE,
        run: {
          run_id: event.run_id,
          query: event.query,
          status: 'running',
          duration_ms: null,
          error: null,
        },
      }
    }

    case 'agent_thought': {
      const { task_id, thought, timestamp } = event
      const entry = { thought, timestamp, label: task_id === 'coordinator' ? 'Coordinator' : task_id }

      // null or coordinator → system-level
      if (!task_id || task_id === 'coordinator') {
        return { ...state, systemThoughts: [...state.systemThoughts, entry] }
      }

      // task-specific thought
      const task = state.tasks[task_id]
      if (!task) return state
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task_id]: { ...task, thoughts: [...task.thoughts, entry] },
        },
      }
    }

    case 'task_spawned': {
      const { task_id, label, agent, spawned_by, parallel_group, depends_on } = event
      const newTask = {
        task_id,
        label,
        agent,
        spawned_by,
        parallel_group: parallel_group ?? null,
        depends_on: depends_on ?? [],
        status: 'running',
        error: null,
        reason: null,
        message: null,
        toolCalls: [],
        outputs: [],
        latestOutput: null,
        finalOutput: null,
        thoughts: [],
        retryCount: 0,
        statusHistory: [],
      }
      return {
        ...state,
        tasks: { ...state.tasks, [task_id]: newTask },
        taskOrder: state.taskOrder.includes(task_id)
          ? state.taskOrder
          : [...state.taskOrder, task_id],
      }
    }

    case 'tool_call': {
      const { task_id, tool, input_summary, timestamp } = event
      const task = state.tasks[task_id]
      if (!task) return state
      const newCall = { tool, input_summary, output_summary: null, pending: true, timestamp }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task_id]: { ...task, toolCalls: [...task.toolCalls, newCall] },
        },
      }
    }

    case 'tool_result': {
      const { task_id, tool, output_summary } = event
      const task = state.tasks[task_id]
      if (!task) return state
      // Resolve the last pending call for this tool
      const updatedCalls = [...task.toolCalls]
      let resolved = false
      for (let i = updatedCalls.length - 1; i >= 0; i--) {
        if (updatedCalls[i].tool === tool && updatedCalls[i].pending) {
          updatedCalls[i] = { ...updatedCalls[i], output_summary, pending: false }
          resolved = true
          break
        }
      }
      return {
        ...state,
        tasks: { ...state.tasks, [task_id]: { ...task, toolCalls: updatedCalls } },
      }
    }

    case 'partial_output': {
      const { task_id, content, is_final, quality_score, timestamp } = event
      const task = state.tasks[task_id]
      if (!task) return state
      const outputEntry = { content, is_final, quality_score, timestamp }
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task_id]: {
            ...task,
            outputs: [...task.outputs, outputEntry],
            latestOutput: content,
            finalOutput: is_final ? outputEntry : task.finalOutput,
          },
        },
      }
    }

    case 'task_update': {
      const { task_id, status, error, reason, message, timestamp } = event
      const task = state.tasks[task_id]
      if (!task) return state
      const wasFailedNowRunning = task.status === 'failed' && status === 'running'
      return {
        ...state,
        tasks: {
          ...state.tasks,
          [task_id]: {
            ...task,
            status,
            error: error ?? null,
            reason: reason ?? null,
            message: message ?? null,
            retryCount: wasFailedNowRunning ? task.retryCount + 1 : task.retryCount,
            statusHistory: [...task.statusHistory, { status, error, reason, timestamp }],
          },
        },
      }
    }

    case 'run_complete': {
      return {
        ...state,
        run: { ...state.run, status: 'complete', duration_ms: event.duration_ms },
        finalOutput: event.output,
      }
    }

    case 'run_error': {
      return {
        ...state,
        run: { ...state.run, status: 'failed', error: event.message },
      }
    }

    default:
      return state
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAgentRun() {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)
  const emitterRef = useRef(null)
  const startTimeRef = useRef(null)
  const [elapsed, setElapsed] = useState(0)

  // Elapsed timer — ticks every second while run is active
  useEffect(() => {
    if (state.run?.status !== 'running') return
    startTimeRef.current = startTimeRef.current ?? Date.now()
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000))
    }, 1000)
    return () => clearInterval(id)
  }, [state.run?.status])

  function startRun(fixtureEvents) {
    if (emitterRef.current) emitterRef.current.stop()
    startTimeRef.current = Date.now()
    setElapsed(0)

    const onEvent = (event) => dispatch({ event })
    emitterRef.current = new MockEmitter(fixtureEvents, onEvent, null)
    emitterRef.current.start()
  }

  function resetRun() {
    if (emitterRef.current) emitterRef.current.stop()
    emitterRef.current = null
    startTimeRef.current = null
    setElapsed(0)
    dispatch({ event: { type: '_reset' } })
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (emitterRef.current) emitterRef.current.stop()
    }
  }, [])

  return { state, elapsed, startRun, resetRun }
}
