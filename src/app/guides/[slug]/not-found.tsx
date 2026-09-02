import { LockLost } from "@/components/lock-lost";

export default function GuideNotFound() {
  return (
    <LockLost
      title="That guide isn’t here."
      body="The link may be wrong, or the page moved."
    />
  );
}
