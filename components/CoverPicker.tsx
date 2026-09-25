"use client";

import { useEffect, useState } from "react";

type T = { slug: string; year: number; title: string; cover: string; photos: string[] };

const KEY = "cover-picks-v1";

export default function CoverPicker({ trips }: { trips: T[] }) {
  const [picks, setPicks] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(KEY) || "{}");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (saved && typeof saved === "object") setPicks(saved);
    } catch {}
  }, []);

  function pick(slug: string, url: string) {
    const next = { ...picks, [slug]: url };
    setPicks(next);
    setCopied(false);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {}
  }

  const lines = trips.filter((t) => picks[t.slug]).map((t) => `${t.slug}: ${picks[t.slug]}`);
  const text = lines.join("\n");

  return (
    <div className="cover-picker">
      {trips.map((t) => {
        const current = picks[t.slug] || t.cover;
        return (
          <section key={t.slug} className="cover-picker__trip">
            <h2 className="cover-picker__title">
              {t.year} — {t.title}{" "}
              <span className="cover-picker__state">
                {picks[t.slug] ? "выбрано" : t.photos.length ? "сейчас: первое фото" : "фото нет"}
              </span>
            </h2>
            {t.photos.length > 0 && (
              <div className="cover-picker__grid">
                {t.photos.map((url, i) => (
                  <button
                    key={url + i}
                    type="button"
                    className={`cover-picker__item${url === current ? " cover-picker__item--on" : ""}`}
                    onClick={() => pick(t.slug, url)}
                    aria-pressed={url === current}
                    aria-label={`Фото ${i + 1} — сделать обложкой`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </section>
        );
      })}

      <div className="cover-picker__result">
        <p className="cover-picker__result-head">
          Выбрано: {lines.length} из {trips.length}
        </p>
        <textarea id="cover-result" readOnly value={text} rows={Math.max(3, Math.min(lines.length, 10))} />
        <button
          type="button"
          className="pill-button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(text);
              setCopied(true);
            } catch {
              (document.getElementById("cover-result") as HTMLTextAreaElement | null)?.select();
            }
          }}
          disabled={!lines.length}
        >
          {copied ? "Скопировано" : "Скопировать список"}
        </button>
      </div>
    </div>
  );
}
