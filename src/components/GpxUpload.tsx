import { useGpxUpload } from '../hooks/useGpxUpload';
import { useSimulationStore } from '../store/simulationStore';
import { Icon } from './ui/Icon';

export function GpxUpload() {
  const { error, isLoading, fileName, handleFile } = useGpxUpload();
  const routeName = useSimulationStore((state) => state.route?.name);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <label
          htmlFor="gpx-upload"
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded border border-slate-300 px-3 py-1.5 text-base font-medium text-slate-700 hover:bg-slate-50 active:bg-slate-100"
        >
          <Icon name="upload" />
          Choose GPX file…
        </label>
        <input
          id="gpx-upload"
          type="file"
          accept=".gpx"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
          className="sr-only"
        />
        <span className="truncate text-base text-slate-500">{fileName ?? 'No file chosen'}</span>
      </div>
      {isLoading && <p className="text-base text-slate-500">Reading file…</p>}
      {error && (
        <p role="alert" className="text-base text-red-600">
          {error}
        </p>
      )}
      {routeName && !error && <p className="text-base text-slate-600">Loaded: {routeName}</p>}
    </div>
  );
}
