"use client";

import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export const THEME_KEY = "site-theme";
export const THEME_EVENT = "site-theme-change";

function subscribe(cb: () => void) {
  window.addEventListener(THEME_EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(THEME_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function read(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

/** Current site theme; re-renders when the header toggle flips it. */
export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, read, () => "light");
}

export function setTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* private mode — theme just won't persist */
  }
  window.dispatchEvent(new Event(THEME_EVENT));
}

type MapPalette = {
  styles: { elementType?: string; featureType?: string; stylers: Record<string, string>[] }[];
  dayColors: string[];
  category: { cycling: string; hiking: string; walk: string; transport: string };
  startFill: string;
  startLabel: string;
  endFill: string;
  endStroke: string;
  stopStroke: string;
  overviewLightness: number;
};

function styles(c: {
  land: string;
  label: string;
  halo: string;
  admin: string;
  border: string;
  road: string;
  highway: string;
  water: string;
}) {
  return [
    { elementType: "geometry", stylers: [{ color: c.land }] },
    { elementType: "labels.text.fill", stylers: [{ color: c.label }] },
    { elementType: "labels.text.stroke", stylers: [{ color: c.halo }] },
    { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: c.admin }] },
    { featureType: "administrative", elementType: "geometry", stylers: [{ color: c.border }] },
    { featureType: "landscape", elementType: "geometry", stylers: [{ color: c.land }] },
    { featureType: "poi", stylers: [{ visibility: "off" }] },
    { featureType: "road", elementType: "geometry", stylers: [{ color: c.road }] },
    { featureType: "road", elementType: "labels", stylers: [{ visibility: "off" }] },
    { featureType: "road.highway", elementType: "geometry", stylers: [{ color: c.highway }] },
    { featureType: "transit", stylers: [{ visibility: "off" }] },
    { featureType: "water", elementType: "geometry", stylers: [{ color: c.water }] },
  ];
}

export const MAP_PALETTE: Record<Theme, MapPalette> = {
  light: {
    styles: styles({
      land: "#ece7d8",
      label: "#7c8570",
      halo: "#ece7d8",
      admin: "#4c5744",
      border: "#c7bd9e",
      road: "#e1dac4",
      highway: "#d8cfae",
      water: "#c9d6cd",
    }),
    dayColors: ["#c1501b", "#445c3c", "#a07a1e", "#9c3f6b", "#2f6f86"],
    category: { cycling: "#c1501b", hiking: "#445c3c", walk: "#a8875a", transport: "#7c8570" },
    startFill: "#212f1f",
    startLabel: "#ece7d8",
    endFill: "#ece7d8",
    endStroke: "#212f1f",
    stopStroke: "#445c3c",
    overviewLightness: 38,
  },
  dark: {
    styles: styles({
      land: "#1d251b",
      label: "#a39e8e",
      halo: "#141a13",
      admin: "#cfc8b4",
      border: "#3b4637",
      road: "#2c3629",
      highway: "#39452f",
      water: "#0f1b1c",
    }),
    dayColors: ["#f09a68", "#a9c39a", "#e6cf8a", "#d98ab0", "#8fc1d4"],
    category: { cycling: "#f09a68", hiking: "#a9c39a", walk: "#e6cf8a", transport: "#a39e8e" },
    startFill: "#f09a68",
    startLabel: "#141a13",
    endFill: "#141a13",
    endStroke: "#eee8d8",
    stopStroke: "#a9c39a",
    overviewLightness: 62,
  },
};
