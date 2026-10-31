import "server-only";

const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

// Throws if Cloudflare can't be reached, so the caller fails closed instead of skipping the check.
export async function verifyTurnstile(
  token: string,
  secret: string,
  remoteIp: string | null,
): Promise<boolean> {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  const response = await fetch(VERIFY_URL, {
    method: "POST",
    body,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`Turnstile verification returned ${response.status}`);
  }

  const result = (await response.json()) as { success?: boolean };
  return result.success === true;
}
