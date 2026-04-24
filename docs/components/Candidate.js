// One candidate image with its "Approve" button and basic metadata.

import { h } from "../vendor/preact.mjs";
import htm from "../vendor/htm.mjs";

const html = htm.bind(h);


export function Candidate({ candidate, isChosen, canApprove, onApprove }) {
  // Image path is relative to the repo root (e.g.
  // "batches/batch-abc/items/mini-xyz/candidate-1.png"). The app is served
  // from /docs/, so we go up one level.
  const imgSrc = `../${candidate.image_path}`;

  return html`
    <div class=${"candidate" + (isChosen ? " chosen" : "")}>
      <div class="candidate-image-wrap">
        <img class="candidate-image" src=${imgSrc} alt=${"candidate " + candidate.candidate} loading="lazy" />
        ${isChosen && html`<div class="chosen-marker">✓ chosen</div>`}
      </div>
      <div class="candidate-meta">
        <div class="candidate-title">Candidate ${candidate.candidate}</div>
        <div class="candidate-sub">seed ${candidate.seed} · ${candidate.backend}</div>
      </div>
      <button
        class=${"approve-btn" + (isChosen ? " active" : "")}
        disabled=${!canApprove}
        onClick=${onApprove}
        title="Approve this candidate"
      >
        ${isChosen ? "✓ Approved" : "Approve #" + candidate.candidate}
      </button>
    </div>
  `;
}
