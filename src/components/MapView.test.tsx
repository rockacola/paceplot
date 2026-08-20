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
    const { container } = render(<MapView route={null} runnerPosition={null} />);
    expect(container.querySelector('.leaflet-container')).not.toBeNull();
  });

  it('renders a route polyline when a route is given', () => {
    const { container } = render(<MapView route={route} runnerPosition={null} />);
    expect(container.querySelector('path')).not.toBeNull();
  });

  it('renders a runner marker when a position is given', () => {
    const { container } = render(
      <MapView route={route} runnerPosition={{ lat: -33.8683, lng: 151.2093 }} />
    );
    expect(container.querySelector('.leaflet-marker-icon')).not.toBeNull();
  });
});
