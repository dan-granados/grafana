---
name: performant-frontends
description: Keep Grafana frontend payload and boot path small. Use when adding or changing React/TS UI under public/app, packages/grafana-*, routes, webpack chunks, fonts, boot data, Explore visualizations, or when writing frontend performance tests.
---

# Performant frontends

Grafana's first-paint cost is the `app` shell plus whatever the route eagerly imports. A cold Explore load in local webpack-dev was ~29 requests / 6.8 MB transferred, almost all `app.*.js` then `explore.*.js`, then two panel plugins and three Inter fonts. Production minifies and vendor-splits; the import graph still decides what users download.

Apply this skill before adding a static import, a provider around the router, a font, or boot-time fetch.

## Do this first

1. Trace the import: does this module load on every page, on one route, or only after a user action / data shape?
2. Default to `import(/* webpackChunkName: "<name>" */ ...)` behind `SafeDynamicImport` (routes) or `React.lazy` (in-route UI).
3. Do not put feature code in `public/app/app.ts`, `public/app/index.ts`, or `RoutesWrapper` unless every authenticated page needs it.
4. Add or extend a `@performance` Playwright test when the change can move payload, request count, or time-to-ready. See [Performance tests](#performance-tests).

## Import and chunk rules

**Route pages** already use `SafeDynamicImport` + `webpackChunkName` in `public/app/routes/routes.tsx`. New pages must do the same. Never default-export a heavy page from a barrel that `app.ts` imports.

**In-route UI** (Explore, dashboards, query editors): static-import only what the empty/default view needs. Lazy-load the rest when the data or user action requires it.

```tsx
// BAD — Explore.tsx pulls logs/traces/flamegraph/node-graph into every Explore visit
import LogsContainer from './Logs/LogsContainer';
import { TraceViewContainer } from './TraceView/TraceViewContainer';

// GOOD — load when frames of that type exist
const LogsContainer = lazy(() => import(/* webpackChunkName: "explore-logs" */ './Logs/LogsContainer'));
```

**Panel / datasource plugins** already have named chunks in `public/app/features/plugins/built_in_plugins.ts`. Do not import a panel module from feature code; go through the plugin loader so `timeseriesPanel` / `tablePanel` stay optional. Do not mount Graph and Table together unless both are visible.

**Heavy vendors** (monaco-editor, `@kusto/monaco-kusto`, vis-network, d3, `@grafana/plugin-ui`, geomap) must stay behind their existing async chunks. A static import from a shared file re-merges them into `app` or the parent route chunk.

**Context providers**: `QueriesDrawerContextProvider` in `RoutesWrapper` is the anti-pattern — Explore state on Home, Dashboards, Alerting. New providers belong on the route that uses them, not around `AppChrome`.

**`webpackMode: "eager"`** is reserved for boot (`public/app/index.ts` → `initApp`). Do not copy it.

**Webpack-dev vs production**: `scripts/webpack/webpack.dev.ts` sets `splitChunks: false` and `devtool: 'source-map'` on purpose (rebuild speed). Dev Network "36 MB resources" is uncompressed JS + maps. Do not "fix" that, and do not set byte budgets from a webpack-dev waterfall. Use `yarn build` / `yarn build:stats` / `yarn bundle-size:stats` for size.

## Boot path

Keep these off the critical path unless measured as necessary:

- Extra Inter (or other) font files. Three Inter faces already ship (~100 KB each). Prefer one weight, subset, `font-display: swap`.
- New fields on `window.grafanaBootData` or extra boot fetches. Feature flags already add a ~40 KB fetch on Explore.
- Echo / JS agent / Faro work in render. Keep it async.
- Live websocket: Network **Finish** stays open (~11s on Explore). Never treat Finish as time-to-interactive. Use Load, LCP, or a feature-ready selector.

## Performance tests

Ship a test with the change when you add a route, a static import on a hot path, a provider above the router, a panel that loads on default Explore/dashboard, or a boot fetch.

### Playwright payload / timing (`@performance`)

Canonical test: `e2e-playwright/various-suite/perf-test.spec.ts`. Recorder: `e2e-playwright/utils/RequestsRecorder.ts`.

```ts
test('explore-payload-size', { tag: '@performance' }, async ({ page }) => {
  const recorder = new RequestsRecorder(page);
  const stopListening = recorder.listen(); // before goto

  const start = performance.now();
  await page.goto('/explore');
  await page.getByTestId(selectors.pages.Explore.General.container).waitFor();
  const elapsedMs = performance.now() - start;

  await stopListening();
  // emit recorder.getMetrics() the same way perf-test.spec.ts does
});
```

Rules:

- Call `recorder.listen()` **before** `page.goto`.
- Wait on a **feature-ready** test id (Explore container, dashboard header), not network idle and not websocket close.
- Record transfer size, inflated size, request count (`RequestsRecorder`) and time-to-ready. Heap via CDP is optional (`HeapProfiler.collectGarbage` then `Runtime.getHeapUsage`), matching the dashboard test.
- Tag `{ tag: '@performance' }`.
- Do **not** assert absolute byte sizes from webpack-dev. If you need a budget, snapshot **named chunks** that must stay absent on the path (e.g. metrics Explore must not request `monaco-editor` / `kusto` / `geomapPanel` / `vis-network`) and compare production `assets-manifest.json` sizes.
- Login/session: use the existing `@grafana/plugin-e2e` fixtures; do not reinvent auth.

Extend `perf-test.spec.ts` for another core surface, or add `e2e-playwright/<area>/<name>.perf.spec.ts` next to the feature's e2e if the file would otherwise mix unrelated flows.

### Production bundle stats

After a webpack-graph change (new entry, new cacheGroup, new eager import into `app`):

```sh
yarn build
yarn bundle-size:stats   # reads public/build/assets-manifest.json
```

`yarn build:stats` / `yarn stats` for a deeper webpack profile. Call out entrypoint `app` and the named route chunk in the PR.

### Unit tests for the boundary

When lazy-loading, add a unit test that the default render does **not** mount the heavy child (query by absence of its test id). That is cheaper than e2e and catches a static import regression.

### CUJ timing

User-journey duration belongs in `public/app/core/journeys/` (see that tree's AGENTS.md). Do not duplicate CUJ traces inside `@performance` tests.

## PR checklist

- [ ] No new static import of a route-only or viz-only module from `app.ts`, `index.ts`, or `RoutesWrapper`.
- [ ] New route uses `SafeDynamicImport` + `webpackChunkName`.
- [ ] Optional UI (logs/traces/table/monaco/maps) loads only when needed.
- [ ] `@performance` test or bundle-stats note if payload can move.
- [ ] Measured with production build or named-chunk assertions — not webpack-dev Network Finish.
