export function createHintState(questionId) {
  return { version: 1, questionId, hintUsed: false, attempts: 0, wrongAfterHint: 0, moreHintUnlocked: false, moreHintViewed: false, completed: false };
}
export function reduceHintState(state, event, {unlockAfterWrong=false}={}) {
  if (!event || event.questionId !== state.questionId) return state;
  if (event.type === 'MORE_HINT_OPENED') {
    return state.moreHintUnlocked ? { ...state, moreHintViewed: true } : state;
  }
  if (state.completed) return state;
  if (event.type === 'HINT_REVEALED') return { ...state, hintUsed: true };
  if (event.type !== 'ANSWER_SUBMITTED' || typeof event.correct !== 'boolean') return state;
  const wrongAfterHint = state.wrongAfterHint + Number(!event.correct && state.hintUsed);
  return { ...state, attempts: state.attempts + 1, wrongAfterHint,
    moreHintUnlocked: wrongAfterHint > 0 || (unlockAfterWrong && (state.moreHintUnlocked || !event.correct)), completed: event.correct };
}
export function restoreHintState(saved, questionId) {
  if (!saved || saved.questionId !== questionId || saved.version !== 1) return createHintState(questionId);
  const count = x => Number.isSafeInteger(x) && x >= 0 ? x : 0;
  const attempts = count(saved.attempts);
  const hintUsed = saved.hintUsed === true;
  const wrongAfterHint = hintUsed ? Math.min(attempts, count(saved.wrongAfterHint)) : 0;
  return { version: 1, questionId, hintUsed, attempts, wrongAfterHint,
    moreHintUnlocked: wrongAfterHint > 0,
    moreHintViewed: wrongAfterHint > 0 && saved.moreHintViewed === true,
    completed: saved.completed === true };
}
