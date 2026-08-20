export type IconName = 'upload';

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

const ICON_PATHS: Record<IconName, string[]> = {
  upload: ['M10 12.5V3.5', 'M6 7.5 10 3.5 14 7.5', 'M3.5 13.5v2a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-2'],
};

export function Icon({ name, size = 16, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {ICON_PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
