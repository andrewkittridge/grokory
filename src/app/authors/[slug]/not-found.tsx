import { LockLost } from "@/components/lock-lost";

export default function AuthorNotFound() {
  return (
    <LockLost
      title="No bots under that name."
      body="That author is not on the board, or their listings were taken down."
    />
  );
}
