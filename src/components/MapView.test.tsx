import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MapView } from './MapView';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import type { Route } from '../types/route';

const points = buildRoutePoints([
  { lat: -33.8688, lng: 151.2093 },
  { lat: -33.8683, lng: 151.2093 },
  { lat: -33.8678, lng: 151.2093 },
]);
const route: Route = {
  id: 'route-1',
  name: 'Test route',
  points,
  totalDistanceM: points[points.length - 1].cumulativeDistanceM,
};

describe('MapView', () => {
  it('renders a map container with no route', () => {
    const { container } = render(<MapView route={null} runnerMarkers={[]} />);
    expect(container.querySelector('.leaflet-container')).not.toBeNull();
  });

  it('renders a route polyline when a route is given', () => {
    const { container } = render(<MapView route={route} runnerMarkers={[]} />);
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('renders one colored dot marker per entry in runnerMarkers, not the default pin', () => {
    const { container } = render(
      <MapView
        route={route}
        runnerMarkers={[
          { id: 'a', lat: -33.8683, lng: 151.2093, color: '#ff0000' },
          { id: 'b', lat: -33.8678, lng: 151.2093, color: '#00ff00' },
        ]}
      />
    );
    const markers = container.querySelectorAll('.runner-dot-marker');
    expect(markers).toHaveLength(2);
    expect(markers[0].querySelector('span')).toHaveStyle({ background: '#ff0000' });
    expect(markers[1].querySelector('span')).toHaveStyle({ background: '#00ff00' });
  });

  it('renders no markers when runnerMarkers is empty', () => {
    const { container } = render(<MapView route={route} runnerMarkers={[]} />);
    expect(container.querySelectorAll('.runner-dot-marker')).toHaveLength(0);
  });
});
