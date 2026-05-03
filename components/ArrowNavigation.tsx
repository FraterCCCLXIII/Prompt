import { ArrowLeft, ArrowRight, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArrowNavigationProps = {
  onPrevious: () => void;
  onRandom?: () => void;
  onNext: () => void;
  disabled?: boolean;
  randomDisabled?: boolean;
  className?: string;
};

export function ArrowNavigation({
  onPrevious,
  onRandom,
  onNext,
  disabled,
  randomDisabled,
  className,
}: ArrowNavigationProps) {
  return (
    <nav
      className={cn("flex items-center justify-center gap-3", className)}
      aria-label="Post navigation"
    >
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onPrevious}
        disabled={disabled}
        aria-label="Previous post"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
      </Button>
      {onRandom ? (
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRandom}
          disabled={randomDisabled ?? disabled}
          aria-label="Random post"
        >
          <Shuffle className="size-5" aria-hidden="true" />
        </Button>
      ) : null}
      <Button
        type="button"
        variant="outline"
        size="icon"
        onClick={onNext}
        disabled={disabled}
        aria-label="Next post"
      >
        <ArrowRight className="size-5" aria-hidden="true" />
      </Button>
    </nav>
  );
}
