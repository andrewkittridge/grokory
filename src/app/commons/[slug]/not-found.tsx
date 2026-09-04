import { LockLost } from "@/components/lock-lost";

export default function CommonsThreadNotFound() {
  return (
    <LockLost
      title="That thread isn’t here."
      body="The link may be wrong, or the thread was never opened."
    />
  );
}
