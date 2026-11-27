import type { Metadata } from "next";
import { MERCH_CATEGORY } from "@/lib/catalog";
import { loadShop } from "@/lib/shop-data";
import { ScrollProgress } from "@/components/motion";
import { SiteHeader } from "@/components/site-header";
import { CategorySection } from "@/components/shop";
import { Newsletter, SiteFooter } from "@/components/home-sections";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Merch | Lethargic Gardens",
  description: "Tees, hoodies, hats, mugs and more for the unhurried gardener.",
};

export default async function MerchPage() {
  const shop = await loadShop();
  const items = shop.get("merch") ?? [];
  return (
    <div className="min-h-screen bg-ink">
      <ScrollProgress />
      <SiteHeader />
      <main>
        <section className="relative overflow-hidden px-5 pb-6 pt-36 sm:px-8 sm:pt-44">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(245,199,106,0.14),transparent)]" />
          <div className="relative mx-auto max-w-7xl text-center">
            <p className="mx-auto w-fit rounded-full border border-amber-200/30 bg-amber-200/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-amber-100">
              Small batch · Slow made
            </p>
            <h1 className="mt-6 font-display text-6xl font-light leading-[1.02] tracking-tight text-white sm:text-8xl">
              Wear the <em className="text-amber-200">pace.</em>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/60">
              Soft goods for people who garden whenever they get around to it. Add them to the same
              basket as your seeds and we will pack it all together.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-white/60">
              {["Organic cotton", "Free pickup in store", "Free shipping over $50", "Synced with shop stock"].map(
                (t) => (
                  <span key={t} className="rounded-full border border-white/10 px-4 py-1.5">
                    {t}
                  </span>
                ),
              )}
            </div>
          </div>
        </section>
        <CategorySection cat={MERCH_CATEGORY} index={0} products={items} numbered={false} />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
