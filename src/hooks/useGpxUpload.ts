import { useState } from 'react';
import { loadRouteFromGpxText } from '../lib/gpx/loadRouteFromGpxText';
import { useSimulationStore } from '../store/simulationStore';

export function useGpxUpload() {
  const setRoute = useSimulationStore((state) => state.setRoute);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  async function handleFile(file: File) {
    setFileName(file.name);
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const result = loadRouteFromGpxText(text);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setRoute(result.route);
    } catch {
      setError('Could not read this file.');
    } finally {
      setIsLoading(false);
    }
  }

  return { error, isLoading, fileName, handleFile };
}
