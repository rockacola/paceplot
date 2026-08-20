import { MapView } from './components/MapView';
import { GpxUpload } from './components/GpxUpload';
import { RunnerControls } from './components/RunnerControls';
import { Timeline } from './components/Timeline';
import { useSimulationStore } from './store/simulationStore';
import { getRunnerPosition } from './lib/simulation/position';

function App() {
  const route = useSimulationStore((state) => state.route);
  const runner = useSimulationStore((state) => state.runner);
  const clockTime = useSimulationStore((state) => state.clockTime);

  const runnerPosition =
    route && runner && clockTime ? getRunnerPosition(route, runner, clockTime) : null;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-slate-900">Paceplot</h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 space-y-6 overflow-y-auto border-r border-slate-200 p-4">
          <GpxUpload />
          <RunnerControls />
        </aside>
        <main className="relative flex-1">
          <MapView route={route} runnerPosition={runnerPosition} />
        </main>
      </div>
      <footer className="border-t border-slate-200 p-4">
        <Timeline />
      </footer>
    </div>
  );
}

export default App;
