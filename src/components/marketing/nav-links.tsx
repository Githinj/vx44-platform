"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type NavLink = { href: string; label: string };

// Desktop section links. On the homepage a soft pill slides under the link for the section
// in view, so the bar doubles as a "you are here" marker.
export function NavLinks({ links }: { links: NavLink[] }) {
  const pathname = usePathname();
  const [active, setActive] = useState<string | null>(null);
  const [pill, setPill] = useState<{ left: number; width: number } | null>(null);
  const linkRefs = useRef(new Map<string, HTMLAnchorElement>());

  useEffect(() => {
    if (pathname !== "/") return;
    const ids = links.map((link) => link.href.split("#")[1]).filter(Boolean);
    const inView = new Set<string>();

    // A section counts as current while it crosses a thin band just above the middle.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) inView.add(entry.target.id);
          else inView.delete(entry.target.id);
        }
        setActive(ids.find((id) => inView.has(id)) ?? null);
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const id of ids) {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    }
    return () => observer.disconnect();
  }, [pathname, links]);

  const current = pathname === "/" ? active : null;

  useEffect(() => {
    const link = current ? linkRefs.current.get(current) : undefined;
    if (link) setPill({ left: link.offsetLeft, width: link.offsetWidth });
  }, [current]);

  return (
    <nav aria-label="Main" className="relative hidden items-center gap-1 md:flex">
      <span
        aria-hidden="true"
        style={pill ? { transform: `translateX(${pill.left}px)`, width: pill.width } : undefined}
        className={`absolute top-1.5 bottom-1.5 left-0 rounded-full bg-white/[0.07] transition-[transform,width,opacity] duration-500 ease-calm ${
          current && pill ? "opacity-100" : "opacity-0"
        }`}
      />
      {links.map((link) => {
        const id = link.href.split("#")[1];
        const isCurrent = id === current;
        return (
          <Link
            key={link.href}
            href={link.href}
            ref={(node) => {
              if (node) linkRefs.current.set(id, node);
              else linkRefs.current.delete(id);
            }}
            aria-current={isCurrent ? "location" : undefined}
            className={`relative inline-flex min-h-11 items-center rounded-full px-3.5 text-sm transition-colors duration-180 hover:text-text ${
              isCurrent ? "text-text" : ""
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
