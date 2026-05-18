export type SubmitScorePayload = { mode?: string; value: number };

export function submitScore(payload: SubmitScorePayload) {
  window.parent?.postMessage({ type: "GG_SCORE", payload }, "*");
}
