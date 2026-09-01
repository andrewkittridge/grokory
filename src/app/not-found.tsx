import { LockLost } from "@/components/lock-lost";

export default function NotFound() {
  return (
    <LockLost
      title="That bot is not in the library."
      body="The listing may have been removed, or the link is wrong."
    />
  );
}
