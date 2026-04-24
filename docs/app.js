// Main application entry point.
//
// Turn 2 scope: read-only-ish — gallery, decisions recorded in localStorage
// only. No GitHub API integration yet.
//
// Preact and htm are vendored locally under ./vendor/ so the app works
// offline, has no CDN dependency, and makes the repo self-contained.
// Keeping the "no build step" discipline means anyone reading this file
// in the browser's devtools is seeing the same source that lives in the repo.

import { h, render } from "./vendor/preact.mjs";
import { useReducer, useEffect } from "./vendor/hooks.mjs";
import htm from "./vendor/htm.mjs";

import { initialState, reducer, loadCurrentBatch } from "./state.js";
import { StatusBar } from "./components/StatusBar.js";
import { FilterBar } from "./components/FilterBar.js";
import { Gallery } from "./components/Gallery.js";

const html = htm.bind(h);


function App() {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  useEffect(() => {
    loadCurrentBatch(dispatch).catch((err) => {
      dispatch({ type: "LOAD_ERROR", error: String(err) });
    });
  }, []);

  if (state.loadError) {
    return html`
      <div class="app">
        <div class="error-banner">
          Failed to load batch: ${state.loadError}
        </div>
      </div>
    `;
  }

  if (!state.batch) {
    return html`<div class="boot">Loading review app…</div>`;
  }

  return html`
    <div class="app">
      <${StatusBar} state=${state} dispatch=${dispatch} />
      <${FilterBar} state=${state} dispatch=${dispatch} />
      <${Gallery} state=${state} dispatch=${dispatch} />
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("app"));
