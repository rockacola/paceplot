# Phases

Each phase of paceplot gets one doc here, `phase-N-<slug>.md`. A phase moves through three sections, filled in as they're settled, not all at once:

1. **Mini plan** — what this phase is trying to achieve, feature list, in scope / out of scope, open questions
2. **Tech spec** — data model, algorithms, module breakdown, resolved decisions
3. **Solution design** — file layout, component contracts, implementation order

This is the same shape as the original build spec in the waymarks idea doc (`data/ideas/run-route-pace-simulator.md` in the `waymarks` repo) that this project was built from. Copy `_template.md` to start a new phase.

`.ai/tasks/` holds the batch-level work items that implement a phase. A task's `phase` field points back to the phase doc it belongs to.
