# DECISIONS.md — Agent Run Panel

Five design decisions made for intentionally under-specified requirements.

---

## 1. Agent Thoughts — Shown on demand, collapsed by default

**Decision:** Coordinator thoughts are shown in the timeline as a small collapsible element — visible but quiet. Task-level agent thoughts (emitted by the synthesis agent before it begins) are shown inside the task card, also collapsed by default behind a toggle. Neither is shown by default in an expanded state.

**Why:** The primary user is a financial analyst who wants research output, not a transcript of the agent's internal reasoning. If thoughts were shown expanded by default, they would push actual outputs down and create cognitive load before the analyst even sees data. But hiding them entirely felt like a trust problem — if the system is making decisions (like which peer data to fetch, or whether to cancel a task), the analyst deserves the ability to see why. The toggle gives analysts and power users the option to inspect reasoning without forcing it on everyone.

**What would make me reconsider:** If user research showed that analysts frequently toggled thoughts open — indicating they're already looking for them — I'd surface them by default, probably in a separate "Reasoning" panel in a sidebar. Alternatively, if the coordinator's thoughts contained information that affected analyst trust in the output (e.g., "I only found 3 years of data, not 5"), those specific thoughts should be surfaced prominently rather than hidden.

---

## 2. Parallel Task Layout — Grouped container with a left accent stripe

**Decision:** Tasks sharing the same `parallel_group` are rendered inside a dedicated container card with a "Parallel group" header and individual task cards separated by a left indigo border stripe. The header shows how many agents are running concurrently, with live counts of running vs. complete tasks.

**Why:** A flat vertical list of three tasks that happen to share a `parallel_group` looks identical to three sequential tasks. The only semantic difference is timing, and that's invisible in a list. Wrapping them in a shared container makes the parallel relationship explicit: these three things are happening at the same time. The left accent stripe (matching the parallel group header colour) gives each task a visual "this belongs to the group" cue without adding heavy nesting. I deliberately chose a container over a column grid because columns break down on narrow viewports and make it harder to show per-task details (tool calls, outputs) without truncation.

**What would make me reconsider:** If there were parallel groups with more than 4 tasks, a two-column grid inside the container would likely be cleaner than a long stacked list. I'd also reconsider if analysts wanted to compare parallel task outputs side-by-side, which would argue for a column layout with scrollable output panels per task.

---

## 3. Partial Outputs (`is_final: false`) — Show the latest, stream-in-place

**Decision:** When a task emits a partial output (`is_final: false`), the content is displayed inline in the task card with a "Streaming" label and a blinking cursor. When a subsequent output arrives (whether another intermediate or the final), it replaces the previous content rather than appending. When `is_final: true` arrives, the cursor and label disappear and the content is shown as a clean, complete result.

**Why:** Appending intermediate outputs creates a noisy log: the analyst sees redundant, partial sentences that contradict each other as the LLM refines its answer. Replacing-in-place mimics the streaming behaviour analysts already recognise from LLM chat interfaces (like Claude.ai or ChatGPT), where the output appears to "type itself" rather than accumulate repetitions. Discarding intermediates on final arrival keeps the card uncluttered. The blinking cursor signals "this isn't done yet" without a label that might alarm users.

**What would make me reconsider:** If intermediate outputs carried meaningfully different information — e.g., different data points rather than refined versions of the same answer — discarding them would be a loss. In that case I'd use a collapsed "earlier outputs" log the user could expand. I'd also reconsider if analysts wanted to see how the output changed over time for audit purposes.

---

## 4. `cancelled` with `reason: "sufficient_data"` — "Skipped" with a neutral icon

**Decision:** A cancelled task with `reason: "sufficient_data"` is shown with a neutral grey `◎` icon, the status label "Skipped — sufficient data", and an expandable explanation in muted text: "Coordinator had sufficient data from other tasks. This task was stopped early — results are not needed." The word "cancelled" does not appear in the UI. There is no red colour anywhere on the card.

**Why:** "Cancelled" reads as failure in most UIs. An analyst who sees a greyed-out task with a red or amber indicator will wonder if the output is incomplete or unreliable. The truth is the opposite: the coordinator stopped the task because it had *enough* data, which is a sign the system is working efficiently. Framing it as "Skipped" and using the coordinator's own message ("3 of 4 peers fetched") turns what could read as an error into a feature. I avoided green (too positive — the task didn't succeed at its job) and amber (suggests a warning). Grey/slate is the right register: acknowledged, neutral, not alarming.

**What would make me reconsider:** If analysts consistently questioned the completeness of results because of skipped tasks, I'd add a tooltip or inline explanation on the final output: "1 of 4 peer fetches was skipped — coordinator determined 3 was sufficient." That would close the loop without alarming the user mid-run.

---

## 5. Task Dependency Display — Show unresolved deps while pending, silently resolve after

**Decision:** While a task is in `running` status and has a non-empty `depends_on` array, the task card shows a small muted label: "depends on t_001, t_002, t_003". This text disappears once the task has started executing (i.e., once it emits a tool call or output). The cancelled `t_004` does not appear in the synthesis task's dependencies (`t_005.depends_on` is `["t_001","t_002","t_003"]`), so no special handling is needed there. The coordinator already resolved the cancellation before spawning the synthesis task.

**Why:** Drawing a dependency graph (DAG) would be accurate but overwhelming for a financial analyst. They don't need to see the graph — they need to understand *why* something hasn't started yet. Showing "depends on t_001, t_002, t_003" answers that question in plain language. Once a task is running, the dependency information is historical and irrelevant; removing it keeps the card focused on current state. I chose not to draw arrows between task cards because the DOM order (top-to-bottom, sequential before parallel) already implies execution order: tasks higher up completed before tasks lower down started.

**What would make me reconsider:** If users needed to reason about *why* a task was blocked (e.g., a long-running dependency was delaying the whole pipeline), a visual dependency indicator would become important. I'd add a small "waiting for: [task label]" link that scrolled the user to the blocking task rather than a full graph render.
