import { Footer } from "@/components/marketing/footer";
import { Nav } from "@/components/marketing/nav";
import { RevealRoot } from "@/components/marketing/reveal-root";
import { SkipLink } from "@/components/marketing/skip-link";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SkipLink />
      <Nav />
      <div id="content" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </div>
      <Footer />
      <RevealRoot />
    </>
  );
}
