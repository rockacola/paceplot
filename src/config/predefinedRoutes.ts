export type PredefinedRoute = {
  id: string;
  name: string;
  url: string;
};

export const PREDEFINED_ROUTES: PredefinedRoute[] = [
  {
    id: 'whale-rock-trial-race-17km',
    name: 'Whale Rock Trial Race 17km',
    url: `${import.meta.env.BASE_URL}routes/whale-rock-trail-race-17km.gpx`,
  },
  {
    id: 'tcs-sydney-marathon-2026',
    name: 'TCS Sydney Marathon 2026',
    url: `${import.meta.env.BASE_URL}routes/tcs-sydney-marathon-2026-course.gpx`,
  },
];
