// Top of the page: batch identification and global status (sync, errors).
// Turn 2 version: no sync state, just shows what batch we're looking at.

import { h } from "../vendor/preact.mjs";
import htm from "../vendor/htm.mjs";

const html = htm.bind(h);

export function StatusBar({ state }) {
  const pending = Object.keys(state.localDecisions).length;
  return html`
    <div class="status-bar">
      <div class="status-bar-left">
        <strong>Minis Review</strong>
        ${state.currentBatchId && html`
          <span class="batch-id">${state.currentBatchId}</span>
        `}
      </div>
      <div class="status-bar-right">
        ${state.batch && html`
          <span class="item-count">${state.batch.item_count} items</span>
        `}
        ${pending > 0 && html`
          <span class="pending-badge" title="Decisions not yet synced (turn 3 adds GitHub sync)">
            ${pending} local
          </span>
        `}
      </div>
    </div>
  `;
}
