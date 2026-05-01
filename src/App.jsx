import { useState } from 'react'
import AgentRunPanel from './components/AgentRunPanel'
import { useAgentRun } from './hooks/useAgentRun'
import successFixture from '../mock/fixtures/run_success.json'
import errorFixture from '../mock/fixtures/run_error.json'

const FIXTURES = {
  success: { label: 'Success run', events: successFixture },
  error: { label: 'Error run', events: errorFixture },
}

export default function App() {
  const [activeFixture, setActiveFixture] = useState(null)
  const { state, elapsed, startRun, resetRun } = useAgentRun()

  function handleStart(fixtureKey) {
    setActiveFixture(fixtureKey)
    startRun(FIXTURES[fixtureKey].events)
  }

  function handleReset() {
    setActiveFixture(null)
    resetRun()
  }

  return (
    <div className="min-h-screen bg-[#0f1117] text-slate-200 flex flex-col">
      {/* Top bar */}
      <header className="border-b border-slate-800 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 bg-indigo-500 rounded flex items-center justify-center text-xs font-bold text-white">J</div>
          <span className="text-sm font-semibold text-slate-200 tracking-wide">JcurveIQ</span>
          <span className="text-slate-600 text-xs">/ Agent Run Panel</span>
        </div>

        {/* Fixture switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 mr-1">Fixture:</span>
          {Object.entries(FIXTURES).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => handleStart(key)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                activeFixture === key
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
          {activeFixture && (
            <button
              onClick={handleReset}
              className="px-3 py-1.5 rounded text-xs font-medium bg-slate-800 text-slate-400 hover:bg-slate-700 transition-colors ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-4 py-6 max-w-4xl mx-auto w-full">
        <AgentRunPanel state={state} elapsed={elapsed} />
      </main>
    </div>
  )
}
