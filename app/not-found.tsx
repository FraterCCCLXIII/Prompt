import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-6 text-center">
      <div>
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          Prompt
        </p>
        <h1 className="mt-6 font-serif text-5xl tracking-[-0.05em]">
          This post is gone, or was never here.
        </h1>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">Write your own</Link>
        </Button>
      </div>
    </main>
  );
}
