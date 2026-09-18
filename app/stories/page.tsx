import Link from "next/link";
import { getCatalog } from "@/lib/data";

export const dynamic = "force-dynamic";

const STORY_META: Record<string, { slug: string; title: string; blurb: string }> = {
  "mexico-city": {
    slug: "the-sinking-capital",
    title: "The sinking capital",
    blurb: "A metropolis outrunning its aquifer, measured one radar epoch at a time.",
  },
  "central-valley": {
    slug: "the-breadbasket-that-sank",
    title: "The breadbasket that sank",
    blurb: "California's drought cycles written into the ground — and read back by NISAR.",
  },
  jakarta: {
    slug: "the-city-moves-to-higher-ground",
    title: "The city moving to higher ground",
    blurb: "North Jakarta sinks while a new capital is built — the century's biggest moving story.",
  },
};

export default async function StoriesPage() {
  const catalog = await getCatalog();
  const stories = catalog.filter((c) => STORY_META[c.id]);

  return (
    <div className="space-y-6">
      <section className="panel p-6">
        <h1 className="text-xl font-semibold">Stories — the ground, told human</h1>
        <p className="mt-2 text-sm text-slate-300">
          Three curated deep dives for the public face of land motion. Same verified numbers as the reports —
          different altitude.
        </p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {stories.map((c) => {
          const meta = STORY_META[c.id];
          return (
            <Link key={c.id} href={`/stories/${meta.slug}`} className="panel group p-5 transition hover:border-signal/50">
              <div className="chip mb-3">{c.country}</div>
              <div className="font-medium group-hover:text-signal">{meta.title}</div>
              <div className="mt-1 text-sm text-muted">{meta.blurb}</div>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
