type ColorSwatchPickerProps = {
  colors: string[];
  selected: string;
  onSelect: (hex: string) => void;
};

export function ColorSwatchPicker({ colors, selected, onSelect }: ColorSwatchPickerProps) {
  return (
    <div role="group" aria-label="Runner color" className="flex flex-wrap gap-2">
      {colors.map((color) => {
        const isSelected = color === selected;
        return (
          <button
            key={color}
            type="button"
            aria-label={color}
            aria-pressed={isSelected}
            onClick={() => onSelect(color)}
            style={{ backgroundColor: color }}
            className={
              isSelected
                ? 'h-6 w-6 cursor-pointer rounded-full ring-2 ring-slate-900 ring-offset-2'
                : 'h-6 w-6 cursor-pointer rounded-full hover:opacity-80 active:opacity-60'
            }
          />
        );
      })}
    </div>
  );
}
