import { localSupabase } from "./local-supabase";

// Reads emails caught by the local stack's mail catcher (Mailpit), so a test can follow the link
// in an invite. Local stack only: localSupabase() refuses anything that isn't on this computer.

function mailUrl(): string {
  const { mailUrl } = localSupabase();
  if (!mailUrl) {
    throw new Error("The local mail catcher isn't running. Start the stack without excluding mailpit.");
  }
  return mailUrl;
}

/** Removes caught emails to this address, so a test only sees the ones it caused. */
export async function clearEmailsTo(address: string) {
  await fetch(`${mailUrl()}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`, { method: "DELETE" });
}

/** The newest email to this address, waiting up to `timeoutMs` for one to arrive. */
export async function latestEmailTo(address: string, timeoutMs = 20_000): Promise<{ subject: string; html: string }> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const search = await fetch(`${mailUrl()}/api/v1/search?query=${encodeURIComponent(`to:"${address}"`)}`);
    const { messages } = (await search.json()) as { messages: { ID: string; Subject: string }[] };
    if (messages.length > 0) {
      const message = await fetch(`${mailUrl()}/api/v1/message/${messages[0].ID}`);
      const { HTML, Subject } = (await message.json()) as { HTML: string; Subject: string };
      return { subject: Subject, html: HTML };
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`No email to ${address} within ${timeoutMs / 1000} seconds`);
}

/** The first link in an email's HTML whose address contains `contains`. */
export function linkIn(html: string, contains: string): string {
  const href = [...html.matchAll(/href="([^"]+)"/g)].map((match) => match[1]).find((url) => url.includes(contains));
  if (!href) throw new Error(`No link containing "${contains}" in the email`);
  return href.replaceAll("&amp;", "&");
}
