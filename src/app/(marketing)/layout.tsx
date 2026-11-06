import { Footer } from "@/components/marketing/footer";
import { Nav } from "@/components/marketing/nav";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}
