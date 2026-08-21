import type { Meta, StoryObj } from '@storybook/react-vite';
import { MapView } from './MapView';
import { buildRoutePoints } from '../lib/geometry/routeGeometry';
import type { Route } from '../types/route';

const points = buildRoutePoints([
  { lat: -33.8688, lng: 151.2093 },
  { lat: -33.865, lng: 151.211 },
  { lat: -33.861, lng: 151.213 },
  { lat: -33.857, lng: 151.212 },
]);
const route: Route = {
  id: 'story-route',
  name: 'Story route',
  points,
  totalDistanceM: points[points.length - 1].cumulativeDistanceM,
};

const meta: Meta<typeof MapView> = {
  title: 'Components/MapView',
  component: MapView,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof MapView>;

export const Empty: Story = {
  args: { route: null, runnerMarkers: [] },
};

export const WithRoute: Story = {
  args: { route, runnerMarkers: [] },
};

export const WithRunnerPosition: Story = {
  args: {
    route,
    runnerMarkers: [{ id: 'runner-1', lat: -33.863, lng: 151.2125, color: '#2563eb' }],
  },
};

export const WithMultipleRunners: Story = {
  args: {
    route,
    runnerMarkers: [
      { id: 'runner-1', lat: -33.863, lng: 151.2125, color: '#2563eb' },
      { id: 'runner-2', lat: -33.867, lng: 151.2105, color: '#dc2626' },
      { id: 'runner-3', lat: -33.859, lng: 151.2115, color: '#16a34a' },
    ],
  },
};
