// Filter bar with per-status counts. Sticky at the top of the gallery.

import { h } from "../vendor/preact.mjs";
import htm from "../vendor/htm.mjs";

import { statusCounts } from "../state.js";

const html = htm.bind(h);

const FILTERS = [
  { key: "all",       label: "All" },
  { key: "undecided", label: "Undecided" },
  { key: "approved",  label: "Approved" },
  { key: "rejected",  label: "Rejected" },
];


export function FilterBar({ state, dispatch }) {
  const counts = statusCounts(state);

  return html`
    <div class="filter-bar">
      ${FILTERS.map((f) => html`
        <button
          key=${f.key}
          class=${"filter-btn" + (state.filter === f.key ? " active" : "")}
          onClick=${() => dispatch({ type: "SET_FILTER", filter: f.key })}
        >
          ${f.label} <span class="count">${counts[f.key] ?? 0}</span>
        </button>
      `)}
    </div>
  `;
}
