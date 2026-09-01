import type { Vote, VoteValue } from "./types";

export const VOTER_COOKIE = "grokdex_voter";
export const LEGACY_VOTER_COOKIE = "grokory_voter";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type Ballot = 0 | VoteValue;

export type VoteResult = {
  slug: string;
  score: number;
  userVote: Ballot;
};

export function validVoterId(value: string | undefined) {
  return value && UUID.test(value) ? value : undefined;
}

export function nextBallot(current: Ballot, value: VoteValue): Ballot {
  return current === value ? 0 : value;
}

export function scoreAfter(score: number, current: Ballot, next: Ballot) {
  return score - current + next;
}

export function applyBallot(
  votes: Vote[],
  voterId: string,
  templateId: string,
  value: VoteValue
): Vote[] {
  const index = votes.findIndex(
    (vote) => vote.voterId === voterId && vote.templateId === templateId
  );
  const current: Ballot = index >= 0 ? votes[index].value : 0;
  const next = nextBallot(current, value);
  if (next === 0) {
    if (index < 0) return votes;
    return votes.filter((_, i) => i !== index);
  }
  const ballot: Vote = { voterId, templateId, value: next };
  if (index < 0) return [...votes, ballot];
  const copy = votes.slice();
  copy[index] = ballot;
  return copy;
}
