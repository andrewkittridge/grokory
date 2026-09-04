import { BotListPaste } from "@/components/bot-list-paste";
import { motionDelay } from "@/lib/utils";

export function LandingHow() {
  return (
    <section
      className="motion-enter mt-14 border-t border-border pt-6 sm:mt-16"
      style={motionDelay(4)}
    >
      <BotListPaste compact />
    </section>
  );
}
