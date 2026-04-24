// JSON fetching helpers.
//
// Every fetch carries a cache-busting query string because GitHub Pages
// caches aggressively and a just-published batch can lag by minutes
// otherwise. Cache-busting is cheap; stale data is confusing.
//
// Paths are relative to the page's own location so the same code works
// whether the app is served from /docs on GitHub Pages or from localhost
// for local development.

function bust(url) {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_t=${Date.now()}`;
}


async function fetchJson(url) {
  const resp = await fetch(bust(url), { cache: "no-store" });
  if (!resp.ok) {
    throw new Error(`fetch ${url} failed: ${resp.status} ${resp.statusText}`);
  }
  return await resp.json();
}


// Publicly accessible JSON files — no auth, plain HTTPS fetches against
// whichever origin the page is served from.
//
// Paths are relative to the docs/ directory the app lives in. In the
// review-site-same-repo layout, batches/ is a sibling of docs/, so we
// look up one level.

export async function fetchLatestPointer() {
  return await fetchJson("../batches/latest.json");
}

export async function fetchBatchesIndex() {
  return await fetchJson("../batches/index.json");
}

export async function fetchBatch(batchJsonPath) {
  // batchJsonPath comes from latest.json and is repo-relative
  // (e.g. "batches/batch-abc/batch.json"). We need to make it relative to
  // the app's own location, which is one level deeper (under /docs/).
  return await fetchJson(`../${batchJsonPath}`);
}

export async function fetchDecisions(batchId) {
  return await fetchJson(`../batches/${batchId}/decisions.json`);
}
