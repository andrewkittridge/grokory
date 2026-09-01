import { LockLost } from "@/components/lock-lost";

export default function TemplateNotFound() {
  return (
    <LockLost
      title="That bot isn’t listed."
      body="The listing may have been removed, or the link is wrong."
    />
  );
}
