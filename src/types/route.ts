export type RoutePoint = {
  lat: number;
  lng: number;
  cumulativeDistanceM: number;
};

export type Route = {
  id: string;
  name: string;
  points: RoutePoint[];
  totalDistanceM: number;
};
