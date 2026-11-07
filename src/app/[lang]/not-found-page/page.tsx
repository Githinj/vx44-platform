import { notFound } from "next/navigation";

// The proxy rewrites any unknown public address here. Calling notFound() at build time makes Next
// prerender this language's not-found page (see ../not-found.tsx) and serve it with a 404 status,
// inside the site's nav and footer.
export default async function NotFoundPage({ params }: PageProps<"/[lang]/not-found-page">) {
  await params;
  notFound();
}
