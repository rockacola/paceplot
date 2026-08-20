const SECONDS_PER_MINUTE = 60;
const METERS_PER_KM = 1000;

export function paceToSpeedMps(minPerKm: number): number {
  return METERS_PER_KM / (minPerKm * SECONDS_PER_MINUTE);
}

export function speedToPaceMinPerKm(speedMps: number): number {
  return METERS_PER_KM / (speedMps * SECONDS_PER_MINUTE);
}
