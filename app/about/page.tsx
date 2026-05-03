import { SiteLogoMenu } from "@/components/SiteLogoMenu";

export default function AboutPage() {
  return (
    <main className="min-h-dvh px-5 py-4 sm:px-8">
      <SiteLogoMenu />
      <section className="mx-auto flex min-h-[80vh] max-w-3xl flex-col justify-center py-16">
        <p className="text-sm uppercase tracking-[0.32em] text-muted-foreground">
          About Prompt
        </p>
        <h1 className="mt-6 font-serif text-5xl leading-[1.05] tracking-[-0.05em] text-foreground md:text-7xl">
          A quiet place to write something down.
        </h1>
        <div className="mt-8 space-y-6 text-xl leading-relaxed text-muted-foreground md:text-2xl">
          <p>
            Prompt was conceived by Paul Bloch and Ken Miller sometime around
            2013 on M St in East Sacramento.
          </p>
          <p>
            They felt the internet needed a simple place to write something
            meaningful: no logins, no constraints, just an experiment in writing
            about anything, the meaningful and the mundane, the profound and the
            prosaic.
          </p>
          <p>
            It is not a place to meet so much as a place to encounter: a quiet
            archive where anonymous messages can be left for others to discover,
            like love letters hidden in the folds of cyberspace.
          </p>
        </div>
      </section>
    </main>
  );
}
