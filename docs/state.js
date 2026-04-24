// State management for the review app.
//
// State shape:
//   - server-known: batch (read from batch.json), decisions (read from
//     decisions.json), currentBatchId, batches index.
//   - local overlay: localDecisions — pending decisions the user has made
//     that aren't yet synced anywhere. In turn 2, "anywhere" is nowhere
//     (localStorage only); in turn 3 the sync flow writes them back to
//     GitHub.
//   - UI: filter, loadError.
//
// Rendering rule: the visible status of an item is localDecisions[id] if
// present, else decisions[id], else "undecided". Local wins.

import { fetchLatestPointer, fetchBatchesIndex, fetchBatch, fetchDecisions } from "./data.js";

const LOCAL_DECISIONS_KEY = "minis_review_local_decisions";


export function initialState() {
  let localDecisions = {};
  try {
    localDecisions = JSON.parse(localStorage.getItem(LOCAL_DECISIONS_KEY) || "{}");
  } catch {
    // Corrupted localStorage — start fresh rather than crashing.
    localDecisions = {};
  }
  return {
    batches: [],           // BatchesIndexEntry[]
    currentBatchId: null,
    batch: null,           // PublishedBatch
    decisions: null,       // Decisions (from server; may be null if fetch failed)
    localDecisions,        // { [item_id]: ItemDecision }
    filter: "all",         // "all" | "undecided" | "approved" | "rejected"
    loadError: null,
  };
}


export function reducer(state, action) {
  switch (action.type) {
    case "BATCH_LOADED":
      return {
        ...state,
        batches: action.batches,
        currentBatchId: action.currentBatchId,
        batch: action.batch,
        decisions: action.decisions,
      };

    case "LOAD_ERROR":
      return { ...state, loadError: action.error };

    case "SET_FILTER":
      return { ...state, filter: action.filter };

    case "DECIDE": {
      // action.itemId, action.status, action.chosen_candidate, action.notes
      const now = new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
      const newDecisions = {
        ...state.localDecisions,
        [action.itemId]: {
          status: action.status,
          chosen_candidate: action.chosen_candidate ?? null,
          decided_at: now,
          notes: action.notes ?? "",
        },
      };
      persistLocalDecisions(newDecisions);
      return { ...state, localDecisions: newDecisions };
    }

    case "UNDECIDE": {
      const newLocal = { ...state.localDecisions };
      // Even an "undecide" needs an explicit overlay: if the server says
      // "approved" and the user now wants it undecided, we record that
      // explicitly so the sync flow knows to overwrite.
      newLocal[action.itemId] = {
        status: "undecided",
        chosen_candidate: null,
        decided_at: new Date().toISOString().replace(/\.\d{3}Z$/, "Z"),
        notes: "",
      };
      persistLocalDecisions(newLocal);
      return { ...state, localDecisions: newLocal };
    }

    default:
      return state;
  }
}


function persistLocalDecisions(localDecisions) {
  try {
    localStorage.setItem(LOCAL_DECISIONS_KEY, JSON.stringify(localDecisions));
  } catch {
    // localStorage unavailable (private browsing, quota exceeded). The
    // decisions still live in memory; they just won't survive a refresh.
    // For turn 2 this is acceptable; no error surfacing needed.
  }
}


// Compose server + local decisions into a single lookup. Local wins.
// Returns an ItemDecision-shaped object (never null).
export function effectiveDecision(state, itemId) {
  const local = state.localDecisions[itemId];
  if (local) return local;
  const server = state.decisions?.decisions?.[itemId];
  if (server) return server;
  return { status: "undecided", chosen_candidate: null, decided_at: null, notes: "" };
}


// Count items by effective decision status for the filter bar.
export function statusCounts(state) {
  const counts = { all: 0, undecided: 0, approved: 0, rejected: 0 };
  if (!state.batch) return counts;
  for (const item of state.batch.items) {
    counts.all += 1;
    const eff = effectiveDecision(state, item.item_id);
    counts[eff.status] = (counts[eff.status] || 0) + 1;
  }
  return counts;
}


export async function loadCurrentBatch(dispatch) {
  // Kick off the three JSON fetches in parallel so first render lands fast.
  const [latest, index] = await Promise.all([
    fetchLatestPointer(),
    fetchBatchesIndex(),
  ]);
  const [batch, decisions] = await Promise.all([
    fetchBatch(latest.batch_json_path),
    // decisions may genuinely be missing on a fresh repo; tolerate 404.
    fetchDecisions(latest.batch_id).catch(() => null),
  ]);
  dispatch({
    type: "BATCH_LOADED",
    currentBatchId: latest.batch_id,
    batches: index.batches,
    batch,
    decisions,
  });
}


// Exposed for tests.
export const __test__ = { persistLocalDecisions, LOCAL_DECISIONS_KEY };
