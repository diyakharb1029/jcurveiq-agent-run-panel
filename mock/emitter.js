/**
 * MockEmitter — replays a fixture event array with realistic timing.
 *
 * Usage:
 *   const emitter = new MockEmitter(events, onEvent, onDone)
 *   emitter.start()
 *   emitter.stop()  // cancels remaining timers
 */
export class MockEmitter {
  constructor(events, onEvent, onDone) {
    this.events = events
    this.onEvent = onEvent
    this.onDone = onDone
    this.timers = []
    this.stopped = false
  }

  start() {
    this.stopped = false
    this.timers = []

    if (!this.events || this.events.length === 0) return

    const t0 = this.events[0].timestamp ?? 0

    this.events.forEach((event) => {
      const delay = (event.timestamp ?? 0) - t0
      const timer = setTimeout(() => {
        if (!this.stopped) {
          this.onEvent(event)
        }
      }, delay)
      this.timers.push(timer)
    })

    // Fire onDone after the last event
    const lastDelay = (this.events[this.events.length - 1].timestamp ?? 0) - t0
    const doneTimer = setTimeout(() => {
      if (!this.stopped && this.onDone) {
        this.onDone()
      }
    }, lastDelay + 200)
    this.timers.push(doneTimer)
  }

  stop() {
    this.stopped = true
    this.timers.forEach(clearTimeout)
    this.timers = []
  }
}
