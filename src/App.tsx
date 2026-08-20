import type { ReactNode } from 'react';
import { MapView } from './components/MapView';
import { RouteSelect } from './components/RouteSelect';
import { RunnerControls } from './components/RunnerControls';
import { RunnerApplyButton } from './components/RunnerApplyButton';
import { PlaybackSpeedControl } from './components/PlaybackSpeedControl';
import { Timeline } from './components/Timeline';
import { useSimulationStore } from './store/simulationStore';
import { useRunnerForm } from './hooks/useRunnerForm';
import { getRunnerPosition } from './lib/simulation/position';

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 p-4">
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>
      {children}
    </section>
  );
}

function App() {
  const route = useSimulationStore((state) => state.route);
  const runner = useSimulationStore((state) => state.runner);
  const clockTime = useSimulationStore((state) => state.clockTime);
  const runnerForm = useRunnerForm();

  const runnerPosition =
    route && runner && clockTime ? getRunnerPosition(route, runner, clockTime) : null;

  return (
    <div className="flex h-screen flex-col">
      <header className="border-b border-slate-200 px-4 py-3">
        <h1 className="text-xl font-semibold text-slate-900">
          Paceplot <span className="text-sm font-normal text-slate-400">({__APP_VERSION__})</span>
        </h1>
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 shrink-0 space-y-4 overflow-y-auto border-r border-slate-200 p-4">
          <SidebarSection title="Route">
            <RouteSelect />
          </SidebarSection>
          <SidebarSection title="Runner">
            <RunnerControls
              timeValue={runnerForm.timeValue}
              setTimeValue={runnerForm.setTimeValue}
              paceMinValue={runnerForm.paceMinValue}
              setPaceMinValue={runnerForm.setPaceMinValue}
              paceSecValue={runnerForm.paceSecValue}
              setPaceSecValue={runnerForm.setPaceSecValue}
              color={runnerForm.color}
            />
          </SidebarSection>
          <RunnerApplyButton
            hasPendingChanges={runnerForm.hasPendingChanges}
            onApply={runnerForm.apply}
          />
          <SidebarSection title="Playback">
            <PlaybackSpeedControl />
          </SidebarSection>
        </aside>
        <main className="relative flex-1">
          <MapView route={route} runnerPosition={runnerPosition} runnerColor={runner?.color} />
        </main>
      </div>
      <footer className="border-t border-slate-200 p-4">
        <Timeline />
      </footer>
    </div>
  );
}

export default App;
