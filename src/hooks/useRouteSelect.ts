import { useState } from 'react';
import { useSimulationStore } from '../store/simulationStore';
import { loadRouteFromGpxText } from '../lib/gpx/loadRouteFromGpxText';
import { PREDEFINED_ROUTES } from '../config/predefinedRoutes';

export const UPLOAD_OPTION_VALUE = 'upload';

export function useRouteSelect() {
  const setRoute = useSimulationStore((state) => state.setRoute);
  const [selected, setSelected] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSelect(value: string) {
    setSelected(value);
    setError(null);
    if (value === '' || value === UPLOAD_OPTION_VALUE) return;

    const preset = PREDEFINED_ROUTES.find((route) => route.id === value);
    if (!preset) return;

    setIsLoading(true);
    try {
      const response = await fetch(preset.url);
      const text = await response.text();
      const result = loadRouteFromGpxText(text);
      if ('error' in result) {
        setError(result.error);
        return;
      }
      setRoute({ ...result.route, name: preset.name });
    } catch {
      setError('Could not load this route.');
    } finally {
      setIsLoading(false);
    }
  }

  return {
    options: PREDEFINED_ROUTES,
    selected,
    isLoading,
    error,
    isUploadMode: selected === UPLOAD_OPTION_VALUE,
    handleSelect,
  };
}
