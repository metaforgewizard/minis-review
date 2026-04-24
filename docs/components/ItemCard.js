// One item: header, candidates, decision buttons.

import { h } from "../vendor/preact.mjs";
import htm from "../vendor/htm.mjs";

import { effectiveDecision } from "../state.js";
import { Candidate } from "./Candidate.js";

const html = htm.bind(h);


export function ItemCard({ item, state, dispatch }) {
  const decision = effectiveDecision(state, item.item_id);

  const approve = (n) => dispatch({
    type: "DECIDE",
    itemId: item.item_id,
    status: "approved",
    chosen_candidate: n,
  });

  const reject = () => dispatch({
    type: "DECIDE",
    itemId: item.item_id,
    status: "rejected",
    chosen_candidate: null,
  });

  const clear = () => dispatch({
    type: "UNDECIDE",
    itemId: item.item_id,
  });

  const isApproved = decision.status === "approved";
  const isRejected = decision.status === "rejected";

  return html`
    <div class=${"item-card status-" + decision.status}>
      <div class="item-header">
        <div class="item-header-main">
          <div class="item-id">${item.item_id}</div>
          <div class="item-prompt">${item.source_prompt}</div>
        </div>
        <div class="item-header-meta">
          <span class="meta-pill">${item.scale}</span>
          <span class="meta-pill priority">p${item.priority}</span>
          ${item.style_tags.map((t) => html`<span class="meta-pill tag">${t}</span>`)}
          <span class=${"status-pill " + decision.status}>${decision.status}</span>
        </div>
      </div>

      <div class="candidates">
        ${item.candidates.map((c) => html`
          <${Candidate}
            key=${c.candidate}
            candidate=${c}
            isChosen=${isApproved && decision.chosen_candidate === c.candidate}
            canApprove=${!isRejected}
            onApprove=${() => approve(c.candidate)}
          />
        `)}
      </div>

      <div class="item-actions">
        <button
          class=${"reject-btn" + (isRejected ? " active" : "")}
          onClick=${reject}
        >
          ${isRejected ? "✗ Rejected" : "Reject"}
        </button>
        ${decision.status !== "undecided" && html`
          <button class="clear-btn" onClick=${clear}>Clear decision</button>
        `}
      </div>
    </div>
  `;
}
