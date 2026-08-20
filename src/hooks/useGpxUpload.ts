import { useState } from 'react';
import { validateGpx } from '../lib/gpx/validateGpx';
import { parseGpx } from '../lib/gpx/parseGpx';
import { useSimulationStore } from '../store/simulationStore';

export function useGpxUpload() {
  const setRoute = useSimulationStore((state) => state.setRoute);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleFile(file: File) {
    setIsLoading(true);
    setError(null);
    try {
      const text = await file.text();
      const validation = validateGpx(text);
      if (!validation.valid) {
        setError(validation.reason);
        return;
      }
      setRoute(parseGpx(text));
    } catch {
      setError('Could not read this file.');
    } finally {
      setIsLoading(false);
    }
  }

  return { error, isLoading, handleFile };
}
