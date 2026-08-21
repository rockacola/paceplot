import type { ReactNode } from 'react';
import { MapView } from './components/MapView';
import { RouteSelect } from './components/RouteSelect';
import { RunnerList } from './components/RunnerList';
import { RunnerApplyButton } from './components/RunnerApplyButton';
import { Timeline } from './components/Timeline';
import { useSimulationStore } from './store/simulationStore';
import { useRunnersForm } from './hooks/useRunnersForm';
import { getRunnersPositions } from './lib/simulation/getRunnersPositions';

function SidebarSection({
  title,
  bare = false,
  children,
}: {
  title: string;
  bare?: boolean;
  children: ReactNode;
}) {
  return (
    <section className={bare ? undefined : 'rounded-lg border border-slate-200 p-4'}>
      <h2 className="mb-3 text-sm font-semibold tracking-wide text-slate-500 uppercase">{title}</h2>
      {children}
    </section>
  );
}

function App() {
  const route = useSimulationStore((state) => state.route);
  const runners = useSimulationStore((state) => state.runners);
  const clockTime = useSimulationStore((state) => state.clockTime);
  const runnersForm = useRunnersForm();

  const runnerMarkers = clockTime ? getRunnersPositions(route, runners, clockTime) : [];

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
          <SidebarSection title="Runners" bare>
            <RunnerList
              entries={runnersForm.entries}
              addRunner={runnersForm.addRunner}
              removeRunner={runnersForm.removeRunner}
              canAddRunner={runnersForm.canAddRunner}
              canRemoveRunner={runnersForm.canRemoveRunner}
            />
          </SidebarSection>
          <RunnerApplyButton
            hasPendingChanges={runnersForm.hasPendingChanges}
            onApply={runnersForm.applyAll}
          />
        </aside>
        <main className="relative flex-1">
          <MapView route={route} runnerMarkers={runnerMarkers} />
        </main>
      </div>
      <footer className="border-t border-slate-200 p-4">
        <Timeline />
      </footer>
    </div>
  );
}

export default App;
