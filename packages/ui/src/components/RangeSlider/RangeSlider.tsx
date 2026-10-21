"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./range-slider.css";

export interface RangeSliderProps {
  min?: number;
  max?: number;
  step?: number;
  value?: [number, number];
  onChange?: (values: [number, number]) => void;
  /** Optional label above the track. Pass empty string to hide. */
  label?: string;
  /** Format displayed min/max values */
  formatValue?: (value: number) => string;
  /** Hide the min/max value row under the track */
  hideValues?: boolean;
  className?: string;
  "data-test-id"?: string;
}

function snapToStep(raw: number, min: number, max: number, step: number): number {
  if (step <= 0) return Math.min(max, Math.max(min, raw));
  const snapped = Math.round((raw - min) / step) * step + min;
  return Math.min(max, Math.max(min, snapped));
}

const RangeSlider: React.FC<RangeSliderProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value,
  onChange,
  label = "Rango",
  formatValue,
  hideValues = false,
  className = "",
  "data-test-id": dataTestId = "range-slider-root",
}) => {
  const [values, setValues] = useState<[number, number]>(value || [min, max]);
  const [dragging, setDragging] = useState<null | "min" | "max">(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const valuesRef = useRef(values);
  valuesRef.current = values;

  useEffect(() => {
    if (value) setValues(value);
  }, [value?.[0], value?.[1]]);

  const updateFromClientX = useCallback(
    (clientX: number, thumb: "min" | "max") => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      if (rect.width <= 0) return;
      const percent = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = percent * (max - min) + min;
      const newValue = snapToStep(raw, min, max, step);
      const current = valuesRef.current;

      if (thumb === "min") {
        const clamped = Math.min(newValue, current[1]);
        const next: [number, number] = [clamped, current[1]];
        setValues(next);
        onChange?.(next);
      } else {
        const clamped = Math.max(newValue, current[0]);
        const next: [number, number] = [current[0], clamped];
        setValues(next);
        onChange?.(next);
      }
    },
    [min, max, step, onChange],
  );

  useEffect(() => {
    if (!dragging) return;

    const onPointerMove = (e: PointerEvent) => {
      updateFromClientX(e.clientX, dragging);
    };
    const onPointerUp = () => setDragging(null);

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
    };
  }, [dragging, updateFromClientX]);

  const span = max - min;
  const getPercent = (val: number) => (span <= 0 ? 0 : ((val - min) / span) * 100);
  const display = (v: number) => (formatValue ? formatValue(v) : String(v));

  return (
    <div className={`w-full ${className}`.trim()} data-test-id={dataTestId}>
      {label ? (
        <div className="mb-1 flex items-center justify-between">
          <span className="text-xs text-foreground font-light" data-test-id="range-slider-label">
            {label}
          </span>
        </div>
      ) : null}
      <div className="fs-range-slider" ref={trackRef} data-test-id="range-slider-track">
        <div className="fs-range-slider__track" data-test-id="range-slider-bg" />
        <div
          className="fs-range-slider__fill"
          style={{
            left: `${getPercent(values[0])}%`,
            width: `${Math.max(0, getPercent(values[1]) - getPercent(values[0]))}%`,
          }}
          data-test-id="range-slider-fill"
        />
        <button
          type="button"
          className="fs-range-slider__thumb"
          style={{ left: `${getPercent(values[0])}%`, transform: "translate(-50%, -50%)" }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setDragging("min");
          }}
          aria-label="Valor mínimo"
          data-test-id="range-slider-thumb-min"
        />
        <button
          type="button"
          className="fs-range-slider__thumb"
          style={{ left: `${getPercent(values[1])}%`, transform: "translate(-50%, -50%)" }}
          onPointerDown={(e) => {
            e.preventDefault();
            (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
            setDragging("max");
          }}
          aria-label="Valor máximo"
          data-test-id="range-slider-thumb-max"
        />
      </div>
      {!hideValues ? (
        <div className="flex w-full justify-between mt-2" data-test-id="range-slider-values">
          <span className="text-xs text-foreground font-light" data-test-id="range-slider-value-min">
            {display(values[0])}
          </span>
          <span className="text-xs text-foreground font-light" data-test-id="range-slider-value-max">
            {display(values[1])}
          </span>
        </div>
      ) : null}
    </div>
  );
};

export default RangeSlider;
