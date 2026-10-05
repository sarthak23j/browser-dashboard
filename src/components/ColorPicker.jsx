import { useEffect, useRef, useState } from 'react';
import './ColorPicker.css';

function hexToHsv(hex) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  let hue = 0;

  if (delta !== 0) {
    if (max === red) hue = ((green - blue) / delta) % 6;
    else if (max === green) hue = (blue - red) / delta + 2;
    else hue = (red - green) / delta + 4;
    hue *= 60;
    if (hue < 0) hue += 360;
  }

  return {
    hue,
    saturation: max === 0 ? 0 : (delta / max) * 100,
    value: max * 100,
  };
}

function hsvToHex({ hue, saturation, value }) {
  const chroma = (value / 100) * (saturation / 100);
  const section = hue / 60;
  const secondary = chroma * (1 - Math.abs((section % 2) - 1));
  const match = value / 100 - chroma;
  const channels = section < 1
    ? [chroma, secondary, 0]
    : section < 2
      ? [secondary, chroma, 0]
      : section < 3
        ? [0, chroma, secondary]
        : section < 4
          ? [0, secondary, chroma]
          : section < 5
            ? [secondary, 0, chroma]
            : [chroma, 0, secondary];
  const hex = channels
    .map((channel) => Math.round((channel + match) * 255).toString(16).padStart(2, '0'))
    .join('');
  return `#${hex}`;
}

function ColorPicker({ value, onChange }) {
  const [color, setColor] = useState(() => hexToHsv(value));
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef(null);

  useEffect(() => {
    setColor(hexToHsv(value));
  }, [value]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const closeOnOutsideClick = (event) => {
      if (!pickerRef.current?.contains(event.target)) setIsOpen(false);
    };
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('pointerdown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const updateColor = (nextColor) => {
    const normalized = {
      hue: (nextColor.hue + 360) % 360,
      saturation: Math.min(100, Math.max(0, nextColor.saturation)),
      value: Math.min(100, Math.max(0, nextColor.value)),
    };
    setColor(normalized);
    onChange(hsvToHex(normalized));
  };

  const setFromPointer = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const saturation = ((event.clientX - bounds.left) / bounds.width) * 100;
    const brightness = (1 - (event.clientY - bounds.top) / bounds.height) * 100;
    updateColor({ ...color, saturation, value: brightness });
  };

  const handleSurfaceKeyDown = (event) => {
    const step = event.shiftKey ? 10 : 2;
    const changes = {
      ArrowLeft: { saturation: color.saturation - step },
      ArrowRight: { saturation: color.saturation + step },
      ArrowDown: { value: color.value - step },
      ArrowUp: { value: color.value + step },
    }[event.key];

    if (!changes) return;
    event.preventDefault();
    updateColor({ ...color, ...changes });
  };

  return (
    <div className="color-picker-container" ref={pickerRef}>
      <button
        type="button"
        className="custom-accent-control"
        style={{ '--custom-accent': value }}
        aria-expanded={isOpen}
        aria-controls="accent-color-picker"
        aria-label={`Choose custom accent color, current ${value.toUpperCase()}`}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className="custom-accent-swatch" aria-hidden="true" />
        <span className="custom-accent-copy">
          <span className="custom-accent-title">Custom color</span>
          <span className="custom-accent-value">{value.toUpperCase()}</span>
        </span>
      </button>
      {isOpen && (
        <div className="color-picker-popover" id="accent-color-picker">
          <div className="color-picker-popover-header">
            <span>Choose accent</span>
            <button
              type="button"
              className="color-picker-close"
              aria-label="Close color picker"
              onClick={() => setIsOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="color-picker">
            <div
              className="color-picker-surface"
              role="slider"
              tabIndex={0}
              aria-label="Accent saturation and brightness"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(color.saturation)}
              aria-valuetext={`${Math.round(color.saturation)}% saturation, ${Math.round(color.value)}% brightness`}
              style={{ '--picker-hue': `hsl(${color.hue} 100% 50%)` }}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setFromPointer(event);
              }}
              onPointerMove={(event) => {
                if (event.currentTarget.hasPointerCapture(event.pointerId)) {
                  setFromPointer(event);
                }
              }}
              onKeyDown={handleSurfaceKeyDown}
            >
              <span
                className="color-picker-handle"
                style={{
                  left: `${color.saturation}%`,
                  top: `${100 - color.value}%`,
                }}
              />
            </div>
            <label className="color-picker-hue">
              <span>Hue</span>
              <input
                type="range"
                min="0"
                max="359"
                value={Math.round(color.hue)}
                aria-label="Accent hue"
                onChange={(event) => updateColor({ ...color, hue: Number(event.target.value) })}
              />
            </label>
            <output className="color-picker-value">{hsvToHex(color).toUpperCase()}</output>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColorPicker;
