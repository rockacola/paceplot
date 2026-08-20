export type Pace = {
  minPerKm: number;
};

export type Runner = {
  id: string;
  name: string;
  startTime: Date;
  pace: Pace;
};
