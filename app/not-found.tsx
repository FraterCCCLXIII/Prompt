import Link from "next/link";
import { SiteLogoMenu } from "@/components/SiteLogoMenu";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-dvh px-5 pb-4 pt-24 text-center sm:px-8">
      <SiteLogoMenu className="absolute left-5 top-4 sm:left-8" />
      <section className="mx-auto flex min-h-[80vh] max-w-4xl flex-col items-center justify-center py-16">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          404
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-[-0.05em] text-foreground md:text-7xl">
          Write about something you expected to find.
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
          This page is missing, but the blank space is still useful.
        </p>
        <Button asChild className="mt-8" size="lg">
          <Link href="/">Start writing</Link>
        </Button>
      </section>
    </main>
  );
}
