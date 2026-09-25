"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Click any .trip-photo inside the report to see it full size.
 * Arrows / swipe move between photos of the same report, Esc or a click
 * on the backdrop closes it.
 */
export default function PhotoLightbox() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [index, setIndex] = useState<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const close = useCallback(() => setIndex(null), []);
  const step = useCallback(
    (delta: number) =>
      setIndex((i) => (i === null ? i : (i + delta + photos.length) % photos.length)),
    [photos.length]
  );

  // open on click of any report photo
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      if (!(target instanceof HTMLImageElement) || !target.classList.contains("trip-photo")) return;
      const all = Array.from(document.querySelectorAll<HTMLImageElement>(".trip-body img.trip-photo"));
      const i = all.indexOf(target);
      if (i === -1) return;
      e.preventDefault();
      setPhotos(all.map((img) => img.currentSrc || img.src));
      setIndex(i);
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  // keyboard + scroll lock while open
  useEffect(() => {
    if (index === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [index, close, step]);

  if (index === null || !photos[index]) return null;
  const multiple = photos.length > 1;

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Фото в полном размере"
      onClick={close}
      onTouchStart={(e) => (touchStartX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchStartX.current === null || !multiple) return;
        const dx = e.changedTouches[0].clientX - touchStartX.current;
        touchStartX.current = null;
        if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        className="lightbox__img"
        src={photos[index]}
        alt=""
        onClick={(e) => {
          e.stopPropagation();
          if (multiple) step(1);
        }}
      />
      <button type="button" className="lightbox__close" aria-label="Закрыть" onClick={close}>
        ×
      </button>
      {multiple && (
        <>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--prev"
            aria-label="Предыдущее фото"
            onClick={(e) => {
              e.stopPropagation();
              step(-1);
            }}
          >
            ←
          </button>
          <button
            type="button"
            className="lightbox__nav lightbox__nav--next"
            aria-label="Следующее фото"
            onClick={(e) => {
              e.stopPropagation();
              step(1);
            }}
          >
            →
          </button>
          <span className="lightbox__counter">
            {index + 1} / {photos.length}
          </span>
        </>
      )}
    </div>
  );
}
