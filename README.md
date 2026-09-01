# Веложурнал

Архив отчётов о велопоездках. Next.js (App Router), без базы данных — каждая
поездка это markdown-файл с фронт-маттером в `content/trips/`.

## Структура

```
content/trips/<slug>.md     — один файл на поездку (метаданные + текст отчёта)
lib/trips.ts                — чтение и парсинг markdown
components/DailyKmChart.tsx — SVG-график километража по дням
app/page.tsx                — список поездок
app/trips/[slug]/page.tsx   — страница отчёта
```

## Добавить новую поездку

1. Скопировать `content/trips/lazurny-bereg-2011.md` как образец.
2. Заполнить фронт-маттер: `title`, `year`, `country`, `dates`, `distanceKm`,
   `participants`, `route`, `dailyKm`, `gpxUrl` и т.п.
3. Текст отчёта — обычным markdown ниже `---`. Место для фото отмечать
   HTML-комментарием `<!-- photo: URL -->` — сейчас никак не рендерится,
   зарезервировано под будущую фотогалерею.
4. Закоммитить — Vercel пересоберёт сайт автоматически.

## Локальный запуск

```
npm install
npm run dev
```
