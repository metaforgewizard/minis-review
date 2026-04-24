// Gallery: iterates items, applies the active filter.

import { h } from "../vendor/preact.mjs";
import htm from "../vendor/htm.mjs";

import { effectiveDecision } from "../state.js";
import { ItemCard } from "./ItemCard.js";

const html = htm.bind(h);


function filterItems(items, filter, state) {
  if (filter === "all") return items;
  return items.filter((item) => effectiveDecision(state, item.item_id).status === filter);
}


export function Gallery({ state, dispatch }) {
  const items = filterItems(state.batch.items, state.filter, state);

  if (items.length === 0) {
    return html`
      <div class="gallery-empty">
        No items match filter <strong>${state.filter}</strong>.
      </div>
    `;
  }

  return html`
    <div class="gallery">
      ${items.map((item) => html`
        <${ItemCard} key=${item.item_id} item=${item} state=${state} dispatch=${dispatch} />
      `)}
    </div>
  `;
}
