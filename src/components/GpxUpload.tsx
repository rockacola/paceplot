import { useGpxUpload } from '../hooks/useGpxUpload';
import { useSimulationStore } from '../store/simulationStore';

export function GpxUpload() {
  const { error, isLoading, handleFile } = useGpxUpload();
  const routeName = useSimulationStore((state) => state.route?.name);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="gpx-upload" className="text-sm font-medium text-slate-700">
        Upload GPX route
      </label>
      <input
        id="gpx-upload"
        type="file"
        accept=".gpx"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
        className="text-sm"
      />
      {isLoading && <p className="text-sm text-slate-500">Reading file…</p>}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
      {routeName && !error && <p className="text-sm text-slate-600">Loaded: {routeName}</p>}
    </div>
  );
}
