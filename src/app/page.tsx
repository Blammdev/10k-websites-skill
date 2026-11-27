import { CATEGORIES } from "@/lib/catalog";
import { loadShop } from "@/lib/shop-data";
import { ScrollProgress } from "@/components/motion";
import { ScrollSpyHeader } from "@/components/scrollspy-header";
import { CategorySection } from "@/components/shop";
import {
  Hero,
  HowItWorks,
  Marquee,
  MerchTeaser,
  Newsletter,
  OnlineOrdering,
  SiteFooter,
} from "@/components/home-sections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const shop = await loadShop();
  return (
    <div className="min-h-screen bg-ink">
      <ScrollProgress />
      <ScrollSpyHeader ids={CATEGORIES.map((c) => c.id)} />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        {CATEGORIES.map((c, i) => (
          <CategorySection key={c.id} cat={c} index={i} products={shop.get(c.id) ?? []} />
        ))}
        <OnlineOrdering />
        <MerchTeaser />
        <Newsletter />
      </main>
      <SiteFooter />
    </div>
  );
}
