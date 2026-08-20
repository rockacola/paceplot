import { UPLOAD_OPTION_VALUE, useRouteSelect } from '../hooks/useRouteSelect';
import { useSimulationStore } from '../store/simulationStore';
import { GpxUpload } from './GpxUpload';

export function RouteSelect() {
  const { options, selected, isLoading, error, isUploadMode, handleSelect } = useRouteSelect();
  const routeName = useSimulationStore((state) => state.route?.name);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="route-select" className="sr-only">
        Route
      </label>
      <select
        id="route-select"
        value={selected}
        onChange={(e) => void handleSelect(e.target.value)}
        className="cursor-pointer rounded border border-slate-300 px-2 py-1.5 text-base"
      >
        <option value="">Select a route…</option>
        {options.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
        <option value={UPLOAD_OPTION_VALUE}>Upload your own GPX file…</option>
      </select>
      {isLoading && <p className="text-base text-slate-500">Loading route…</p>}
      {error && (
        <p role="alert" className="text-base text-red-600">
          {error}
        </p>
      )}
      {!isUploadMode && routeName && !error && (
        <p className="text-base text-slate-600">Loaded: {routeName}</p>
      )}
      {isUploadMode && <GpxUpload />}
    </div>
  );
}
